import jwt
import json
import pyotp
import base64
import qrcode
import random
import secrets
import datetime
import subprocess

from io import BytesIO
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.db.models import Q
from django.utils import timezone
from django.utils.html import escape

from .exceptions import AuthException
from .config import FTTRANSCENDENCE, FTAPI
from .models import Users, QRMeta, Friends
from .serializers import UsersSerializer, FriendsSerializer

from auth.settings import MEDIA_ROOT, TOTP_COOKIE_PREFIX, TOTP_COOKIE_SUFFIX, SECRET_KEY


class AuthController:

    def __init__(self):
        pass

    def get_user_by_id(self, user_id: str) -> Users:
        """Get user by id

        Parameters
        ----------
        user_id : str

        Returns
        -------
        Users

        """
        return Users.objects.filter(id=user_id).first()

    def get_authorization_url(self, state: str = '') -> str:
        """ Constructing the authorization url for redirection to 42oauth

        Parameters
        ----------
        state : str, optional

        Returns
        -------
        str

        """
        if not state:
            state = secrets.token_urlsafe(64)[:64]

        query_string = urlencode({
            'client_id': FTAPI.CLIENT_ID,
            'redirect_uri': f"{FTTRANSCENDENCE.PROTOCOL}://{FTTRANSCENDENCE.DOMAIN}/auth/api/callback",
            'scope': 'public',
            'state': state,
            'response_type': 'code',
        })

        return f"{FTAPI.AUTHORIZATION_URL}/oauth/authorize?{query_string}"

    def exchange_access_token(self, code: str) -> str:
        """ Method to exchange code for an access token

        Parameters
        ----------
        code : str

        Returns
        -------
        str

        Raises
        ------
        AuthException

        """
        request = Request(
            url=f"{FTAPI.AUTHORIZATION_URL}/oauth/token",
            data=urlencode({
                'grant_type': 'authorization_code',
                'client_id': FTAPI.CLIENT_ID,
                'client_secret': FTAPI.CLIENT_SECRET,
                'code': code,
                'redirect_uri': f"{FTTRANSCENDENCE.PROTOCOL}://{FTTRANSCENDENCE.DOMAIN}/auth/api/callback",
            }).encode()
        )

        try:
            with urlopen(request) as response:
                return json.loads(response.read().decode()).get('access_token', '')
        except Exception:
            try:
                output = subprocess.Popen([
                    "curl", "-F", "grant_type=authorization_code",
                    "-F", f"client_id={FTAPI.CLIENT_ID}",
                    "-F", f"client_secret={FTAPI.CLIENT_SECRET}",
                    "-F", f"code={code} ",
                    "-F", f"redirect_uri={FTTRANSCENDENCE.PROTOCOL}://{FTTRANSCENDENCE.DOMAIN}/auth/api/callback",
                    "-X", "POST", f"{FTAPI.AUTHORIZATION_URL}/oauth/token",
                ], stdout=subprocess.PIPE)

                return json.loads(output.communicate()[0].decode()).get('access_token', '')
            except Exception:
                return {}

    def retrieve_logged_user(self, access_token: str) -> Users:
        """ Method for getting access token owner (logged-in user) data

        Parameters
        ----------
        access_token : str

        Returns
        -------
        Users

        Raises
        ------
        Exception

        """
        request = Request(url=f"{FTAPI.AUTHORIZATION_URL}/v2/me")
        request.add_header('Authorization', f'Bearer {access_token}')

        try:
            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())
        except Exception:
            try:
                output = subprocess.Popen([
                    "curl", "-H" f"Authorization: Bearer {access_token}", f"{FTAPI.AUTHORIZATION_URL}/v2/me"
                ], stdout=subprocess.PIPE)
                response_data = json.loads(output.communicate()[0].decode())
            except Exception:
                return None

        try:
            login = response_data.get('login', '')

            if user := Users.objects.filter(login=login).first():
                UserController().set_status(user, 'online')

                return user

            serializer = UsersSerializer(data={
                'login': login,
                'email': response_data.get('email', ''),
                'first_name': response_data.get('first_name', ''),
                'last_name': response_data.get('last_name', ''),
                'status': 'online',
            })

            if serializer.is_valid():
                serializer.save()
            else:
                raise AuthException("Error occurred while storing user data", serializer.errors)

            return Users.objects.filter(login=login).first()
        except Exception:
            return None

    def create_user_jwt(self, user: Users, secret_key: str) -> str:
        """ Creates jwt for provided user

        Parameters
        ----------
        user : Users
        secret_key : str

        Returns
        -------
        str

        """
        return jwt.encode(
            {
                'id': str(user.id),
                'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=365),
                'iat': datetime.datetime.now(datetime.UTC)
            },
            secret_key,
            algorithm='HS256'
        )

    def create_totp_jwt(self, user: Users, secret_key: str) -> str:
        """ Creates jwt for two factor authentication

        Parameters
        ----------
        user : Users
        secret_key : str

        Returns
        -------
        str

        """
        return jwt.encode(
            {
                'id': f"{TOTP_COOKIE_PREFIX}{str(user.id)}{TOTP_COOKIE_SUFFIX}",
                'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=1),
                'iat': datetime.datetime.now(datetime.UTC)
            },
            secret_key,
            algorithm='HS256'
        )

    def validate_two_factor(self, totp_token: str, otp: str, secret_key: str) -> tuple:
        """ Validates multiple factors to check if one-time password is valid

        Parameters
        ----------
        totp_token : str
        otp : str
        secret_key : str

        Returns
        -------
        tuple
            (bool, Users)

        """
        empty = False, None

        if not totp_token:
            return empty

        try:
            user_id = jwt.decode(totp_token, secret_key, algorithms=['HS256'])['id']
            user_id = user_id.removeprefix(TOTP_COOKIE_PREFIX).removesuffix(TOTP_COOKIE_SUFFIX)
            user = AuthController().get_user_by_id(user_id)
        except Exception:
            return empty

        if not otp:
            return empty

        return QRCodeController().verify_otp(user, otp), user

    def verify_jwt(self, jwt_token: str) -> dict:
        """ Verifies the jwt token from the requests of other microservices

        Parameters
        ----------
        jwt_token : str

        Returns
        -------
        dict

        """
        user = {}
        authenticated = True

        try:
            payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=['HS256'])
            user = Users.objects.filter(id=payload.get('id')).values().first()
        except Exception:
            authenticated = False

        return {'authenticated': authenticated, 'user': user}


class UserController:

    def __init__(self):
        pass

    def get_user_information(self, user: Users) -> dict:
        """ Returns user data

        Parameters
        ----------
        user : Users

        Returns
        -------
        dict

        """
        user_data = UsersSerializer(user).data

        for prop in ('id', 'updated_at', 'avatar_path'):
            if prop in user_data:
                user_data.pop(prop)

        if user:
            user_data['created_at'] = timezone.localtime(user.created_at).strftime("%d-%m-%Y %H:%M")

        return user_data

    def get_user_by_id(self, user_id: str) -> Users | None:
        """ Get user by id

        Parameters
        ----------
        user_id : str

        Returns
        -------
        Users | None

        """
        return Users.objects.filter(id=user_id).values().first()

    def get_user_by_username(self, username: str) -> Users | None:
        """ Get user by login name

        Parameters
        ----------
        username : str

        Returns
        -------
        Users | None

        """
        return Users.objects.filter(login=username).first()

    def get_all_users(self, current_user: Users) -> list:
        """ Returns all users for representing in dashboard tabs

        Parameters
        ----------
        current_user : Users

        Returns
        -------
        list

        """
        if not current_user:
            return {'data': {'users': []}}

        return {'data': {'users':
            [user.get('login') for user in Users.objects.exclude(login=current_user.login).values('login')]
        }}

    def update_user_information(self, user: Users, user_data: dict) -> dict:
        """ Updates user information using form data

        Parameters
        ----------
        user : Users
        user_data : dict

        Returns
        -------
        dict

        """
        data = {}
        user_login = user.login

        self.__validate_user_information(user_data)

        if not (user_data := dict(filter(lambda item: item[1] != '', user_data.items()))):
            return {'message': 'Nothing to update'}

        user_info = Users.objects.filter(login=user_login).first().__dict__

        for field_name, field_value in user_data.items():
            if user_info.get(field_name, '') != field_value:
                break
        else:
            return {'message': 'Nothing to update'}

        allowed_fields = {'first_name', 'last_name', 'email', 'two_factor_enabled'}
        received_fields = set(user_data.keys())

        if allowed_fields.issubset(received_fields) and (diff_fields := received_fields.difference(allowed_fields)):
            return {'message': f"Unsupported fields were submitted: ({', '.join(diff_fields)})"}

        serializer = UsersSerializer(data={'login': user_login, **user_data}, partial=True)

        if serializer.is_valid():
            serializer.save()
        else:
            return {'message': 'Invalid values for fields', 'errors': serializer.errors}

        if serializer.validated_data['two_factor_enabled']:
            data['qr'] = QRCodeController().create_user_qr(user)

        return {'message': 'User data successfully updated', 'data': data}

    def __validate_user_information(self, user_data: dict) -> None:
        """ Escapes all user input values

        Parameters
        ----------
        user_data : dict

        """
        for key in user_data:
            user_data[key] = escape(user_data[key])

    def get_user_avatar(self, user: Users) -> BytesIO:
        """ Get user avatar as a bytes

        Parameters
        ----------
        user : Users

        Returns
        -------
        BytesIO

        """
        if not user or not (avatar_path := Path(f'{MEDIA_ROOT}/{user.avatar_path}')).is_file():
            avatar_path = f'{MEDIA_ROOT}/{'avatars/default/default_avatar.jpg'}'

        with open(avatar_path, 'rb') as fd:
            return BytesIO(fd.read())

    def update_user_avatar(self, user: Users, new_avatar_path: str) -> None:
        """ Updateding user avatar and removing the old one

        Parameters
        ----------
        user : Users
        new_avatar_path : str

        """
        if (
            (old_avatar_path := Path(f'{MEDIA_ROOT}/{user.avatar_path}')).is_file() and
            old_avatar_path.name != 'default_avatar.jpg'
        ):
            old_avatar_path.unlink()

        serializer = UsersSerializer(data={'login': user.login, 'avatar_path': new_avatar_path}, partial=True)

        if serializer.is_valid():
            serializer.save()
        else:
            raise AuthException("Error occurred while updating user avatar", serializer.errors)

    def set_status(self, user: Users, status: str) -> None:
        """ Sets the user status

        Parameters
        ----------
        user : Users
        status : str

        """
        if status not in ('offline', 'online', 'in-game'):
            return

        serializer = UsersSerializer(data={'login': user.login, 'status': status}, partial=True)

        if serializer.is_valid():
            serializer.save()


class QRCodeController:

    def __init__(self):
        pass

    def save_secret(self, user: Users, secret: str) -> str:
        """

        Parameters
        ----------
        user : Users
        secret : str

        Returns
        -------
        str

        """
        QRMeta.objects.update_or_create(user=user, defaults={'secret': secret})

        return secret

    def get_user_secret(self, user: Users) -> str:
        """ Get user secret from QRMeta table

        Parameters
        ----------
        user : Users

        Returns
        -------
        str

        """
        try:
            return QRMeta.objects.filter(user_id=user.id).first().secret
        except Exception:
            return ''

    def generate_totpauth(self, user: Users) -> str:
        """ Generates the time based one time password auth url for Google Authenticator

        Parameters
        ----------
        user : Users

        Returns
        -------
        str

        """
        if not (secret := self.get_user_secret(user)):
            secret = self.save_secret(
                user=user,
                secret="".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", k=32))
            )

        totp_auth = pyotp.totp.TOTP(secret).provisioning_uri(name=user.login)
        totp_auth_qs = urlencode({
            'issuer': 'ft_transcendence',
            'digits': '6',
            'period': '30'
        })

        return f"{totp_auth}&{totp_auth_qs}"

    def generate_qr_string(self, totp_auth: str) -> str:
        """ Generates the base64 string of the qr code

        Parameters
        ----------
        totp_auth : str

        Returns
        -------
        str

        """
        buffer = BytesIO()

        qrcode.make(totp_auth).save(buffer, format="PNG")

        return base64.b64encode(buffer.getvalue()).decode("utf-8")

    def create_user_qr(self, user: Users) -> str:
        """ Creates the 2fa (Google Authenticator) QR code for specific user

        Parameters
        ----------
        user : Users

        Returns
        -------
        str

        """
        return self.generate_qr_string(self.generate_totpauth(user))

    def verify_otp(self, user: Users, otp: str) -> bool:
        """ Verifies the one-time password inputted by the user

        Parameters
        ----------
        user : Users
        otp : str

        Returns
        -------
        bool

        """
        if not (secret := self.get_user_secret(user)):
            return False

        return pyotp.TOTP(secret).verify(otp)


class FriendsController:

    def __init__(self):
        pass

    def get_all_friends(self, logged_user: Users) -> dict:
        """

        Parameters
        ----------
        logged_user : Users

        Returns
        -------
        dict

        """
        friends = []

        if not logged_user:
            return {'data': {'friends': friends}}

        logged_username = logged_user.login
        friends_records = list(Friends.objects.filter(
            (Q(user=logged_user) | Q(friend=logged_user)) & Q(status='accept')
        ).values('user_id', 'friend_id'))

        for friend in friends_records:
            temp = [friend.pop('user_id'), friend.pop('friend_id')]
            temp.remove(logged_username)
            friends.extend(temp)

        return {'data': {'friends': friends}}

    def get_user_all_friends(self, username: str) -> dict:
        """

        Parameters
        ----------
        username : str

        Returns
        -------
        dict

        """
        friends = []

        if not username or not (user := UserController().get_user_by_username(username)):
            return {'data': {'friends': friends}}

        friends_records = list(Friends.objects.filter(
            (Q(user=user) | Q(friend=user)) & Q(status='accept')
        ).values('user_id', 'friend_id'))

        for friend in friends_records:
            temp = [friend.pop('user_id'), friend.pop('friend_id')]
            temp.remove(username)
            friends.extend(temp)

        return {'data': {'friends': friends}}

    def get_friend_requests(self, logged_user: Users) -> dict:
        """

        Parameters
        ----------
        logged_user : Users

        Returns
        -------
        dict

        """
        return {'data': {'requests':
            list(Friends.objects.filter(friend=logged_user, status='request').values('user_id', 'friend_id'))
        }}

    def send_request(self, logged_user: Users, request_data: dict) -> dict:
        """

        Parameters
        ----------
        logged_user : Users
        request_data : dict

        Returns
        -------
        dict

        """
        if (
            not (friend_username := request_data.get('friend')) or
            not (friend := UserController().get_user_by_username(friend_username))
        ):
            return {'status': 1, 'message': 'No user specified for friend request'}

        if friendship := Friends.objects.filter(
            (Q(user=logged_user) & Q(friend=friend)) | (Q(user=friend) & Q(friend=logged_user))
        ).first():
            match (friendship.status):
                case 'request':
                    return {'message': 'Friend request has already been sent'}
                case 'accept':
                    return {'message': 'You are already friends with this user'}
                case 'reject' | 'removed':
                    friendship.status = 'request'
                    friendship.user = logged_user
                    friendship.friend = friend
                    friendship.save()

                    return {'message': 'Friend request sent successfully'}

        serializer = FriendsSerializer(data={'user_id': logged_user.login, 'friend_id': friend_username,})

        if serializer.is_valid():
            serializer.save()
        else:
            return {'status': 1, 'message': 'An error occurred while sending a friend request'}

        return {'message': 'Friend request sent successfully'}

    def cancel_friend_request(self, logged_user: Users, request_data: dict) -> dict:
        """

        Parameters
        ----------
        logged_user : Users
        request_data : dict

        Returns
        -------
        dict

        """
        if (
            not (friend_username := request_data.get('friend')) or
            not (friend := UserController().get_user_by_username(friend_username))
        ):
            return {'status': 1, 'message': 'No user specified to cancel friend request'}

        if not (friendship := Friends.objects.filter(user=logged_user, friend=friend).first()):
            return {'status': 1, 'message': 'There is no relation to this user'}

        if friendship.status != 'request':
            return {'status': 1, 'message': 'Before canceling a friend request, please make a friend request'}

        friendship.delete()

        return {'message': 'Friend request successfully canceled'}

    def accept_friend_request(self, logged_user: Users, request_data: dict) -> dict:
        """

        Parameters
        ----------
        logged_user : Users
        request_data : dict

        Returns
        -------
        dict

        """
        if (
            not (friend_username := request_data.get('username')) or
            not (friend := UserController().get_user_by_username(friend_username))
        ):
            return {'status': 1, 'message': 'No user specified to accept friend request'}

        if not (friendship := Friends.objects.filter(user=friend, friend=logged_user).first()):
            return {'status': 1, 'message': 'There is no relation to this user'}

        if friendship.status != 'request':
            return {'status': 1, 'message': 'Before accepting a friend request, please make a friend request'}

        friendship.status = 'accept'
        friendship.save()

        return {'message': 'Friend request successfully accepted'}

    def reject_friend_request(self, logged_user: Users, request_data: dict) -> dict:
        """

        Parameters
        ----------
        logged_user : Users
        request_data : dict

        Returns
        -------
        dict

        """
        if (
            not (friend_username := request_data.get('username')) or
            not (friend := UserController().get_user_by_username(friend_username))
        ):
            return {'status': 1, 'message': 'No user specified to reject friend request'}

        if not (friendship := Friends.objects.filter(user=friend, friend=logged_user).first()):
            return {'status': 1, 'message': 'There is no relation to this user'}

        if friendship.status != 'request':
            return {'status': 1, 'message': 'Before rejecting a friend request, please make a friend request'}

        friendship.status = 'reject'
        friendship.save()

        return {'message': 'Friend request successfully rejected'}

    def get_friend_status(self, logged_user: Users, friend_username: str) -> dict:
        """

        Parameters
        ----------
        logged_user : Users
        friend_username : str

        Returns
        -------
        dict

        """
        result = {'data': {'status': ''}}

        if not friend_username or not (friend := UserController().get_user_by_username(friend_username)):
            return result

        if not (friendship := Friends.objects.filter(
            (Q(user=logged_user) & Q(friend=friend)) | (Q(user=friend) & Q(friend=logged_user))
        ).first()):
            result['data']['status'] = 'not-friends'

            return result

        result['data']['status'] = friendship.status

        return result

    def remove_friend(self, logged_user: Users, friend_username: str) -> dict:
        """

        Parameters
        ----------
        logged_user : Users
        friend_username : str

        Returns
        -------
        dict

        """
        if (
            not friend_username or not (friend := UserController().get_user_by_username(friend_username))
        ):
            return {'status': 1, 'message': 'No user specified to remove friend'}

        if not (friendship := Friends.objects.filter(
            (Q(user=logged_user) & Q(friend=friend)) | (Q(user=friend) & Q(friend=logged_user))
        ).first()):
            return {'status': 1, 'message': 'There is no relation to this user'}

        if friendship.status != 'accept':
            return {'status': 1, 'message': 'Before removing a friend request, please make a friend request'}

        friendship.status = 'removed'
        friendship.save()

        return {'message': 'Friend removed successfully'}