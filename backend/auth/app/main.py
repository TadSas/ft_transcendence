import json
import secrets

from io import BytesIO
from pathlib import Path
from datetime import datetime
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .models import Users
from .exceptions import AuthException
from .config import FTTRANSCENDENCE, FTAPI
from .serializers import UsersSerializer, AuthTokenSerializer

from auth.settings import MEDIA_ROOT


class AuthController:

    def __init__(self):
        pass

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

    def exchange_access_token(self, code: str, state: str) -> str:
        """ Method to exchange code for an access token

        Parameters
        ----------
        code : str
        state : str

        Returns
        -------
        str

        Raises
        ------
        AuthException

        """
        # TODO: Check if access_token stored in dabase expired, then query the new one
        request = Request(
            url=f"{FTAPI.AUTHORIZATION_URL}/oauth/token",
            data=urlencode({
                'grant_type': 'authorization_code',
                'client_id': FTAPI.CLIENT_ID,
                'client_secret': FTAPI.CLIENT_SECRET,
                'code': code,
                'redirect_uri': f"{FTTRANSCENDENCE.PROTOCOL}://{FTTRANSCENDENCE.DOMAIN}/auth/api/callback",
                'state': state,
            }).encode()
        )

        try:
            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())
                access_token = response_data.get('access_token', '')

                serializer = AuthTokenSerializer(data={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'state': state,
                    'access_token': access_token,
                    'token_type': response_data.get('token_type', ''),
                    'expires_in': response_data.get('expires_in', ''),
                    'refresh_token': response_data.get('refresh_token', ''),
                    'scope': response_data.get('scope', ''),
                    'created_at': datetime.fromtimestamp(response_data.get('created_at', '')),
                    'secret_valid_until': datetime.fromtimestamp(response_data.get('secret_valid_until', '')),
                })

                if serializer.is_valid():
                    serializer.save()
                else:
                    raise AuthException("Error occurred while storing auth token", serializer.errors)

            return access_token
        except Exception as ex:
            raise AuthException(str(ex))

    def retrieve_logged_user(self, access_token: str) -> str:
        """ Method for getting access token owner (logged-in user) data

        Parameters
        ----------
        access_token : str

        Returns
        -------
        str

        Raises
        ------
        Exception

        """
        request = Request(url=f"{FTAPI.AUTHORIZATION_URL}/v2/me")
        request.add_header('Authorization', f'Bearer {access_token}')

        try:
            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())
                login = response_data.get('login', '')

                if user := Users.objects.filter(login=login).first():
                    return str(user.id)

                serializer = UsersSerializer(data={
                    'login': login,
                    'email': response_data.get('email', ''),
                    'first_name': response_data.get('first_name', ''),
                    'last_name': response_data.get('last_name', ''),
                })

                if serializer.is_valid():
                    serializer.save()
                else:
                    raise AuthException("Error occurred while storing user data", serializer.errors)

                return serializer.data['id']
        except Exception as ex:
            raise AuthException(str(ex))


class UserController:

    def __init__(self):
        pass

    def get_user_avatar(self, user: Users) -> BytesIO:
        """ Get user avatar as a bytes

        Parameters
        ----------
        user : Users

        Returns
        -------
        BytesIO

        """
        with open(f'{MEDIA_ROOT}/{user.avatar_path}', 'rb') as fd:
            return BytesIO(fd.read())

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

        user_data.pop('id')
        user_data.pop('updated_at')
        user_data.pop('avatar_path')

        user_data['created_at'] = user.created_at.strftime("%d-%m-%Y %H:%M")

        return user_data

    def update_user_avatar(self, user: Users, new_avatar_path: str) -> None:
        """ Updateding user avatar and removing the old one

        Parameters
        ----------
        user : Users
        new_avatar_path : str

        """
        if (old_avatar_path := Path(f'{MEDIA_ROOT}/{user.avatar_path}')).is_file():
            old_avatar_path.unlink()

        serializer = UsersSerializer(data={'login': user.login, 'avatar_path': new_avatar_path}, partial=True)

        if serializer.is_valid():
            serializer.save()
        else:
            raise AuthException("Error occurred while updating user avatar", serializer.errors)
