import jwt
import uuid
import secrets

from django.http import HttpResponseRedirect, JsonResponse, HttpResponse

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from auth.settings import SECRET_KEY, ALLOWED_IMAGE_EXTENSIONS, JWT_COOKIE_NAME, TOTP_COOKIE_NAME

from .permissions import JWTAuthentication
from .main import AuthController, UserController, FriendsController


class LoginView(APIView):
    authentication_classes = []

    def get(self, request):
        request.session['auth_state'] = (state := secrets.token_urlsafe(64)[:64])

        return JsonResponse({'status': 0, 'redirect_uri': AuthController().get_authorization_url(state)})


class CallbackView(APIView):
    authentication_classes = []

    def get(self, request):
        qs = request.query_params
        authCont = AuthController()

        callback_code = qs.get('code')
        callback_state = qs.get('state')

        auth_state = request.session.get('auth_state')

        if not auth_state or auth_state != callback_state:
            return HttpResponseRedirect("/login")

        user = authCont.retrieve_logged_user(
            authCont.exchange_access_token(callback_code, callback_state)
        )

        response = HttpResponseRedirect("/login")

        if user.two_factor_enabled:
            response.set_cookie(
                key=TOTP_COOKIE_NAME,
                value=authCont.create_totp_jwt(user, SECRET_KEY),
                secure=True,
                samesite='Lax'
            )

            return response

        response.set_cookie(
            key=JWT_COOKIE_NAME,
            value=authCont.create_user_jwt(user, SECRET_KEY),
            httponly=True,
            secure=True,
            samesite='Lax'
        )

        return response


class JWTVerifyView(APIView):
    authentication_classes = []

    def post(self, request):
        return JsonResponse({'message': 0, **AuthController().verify_jwt(request.data.get('jwt') or '')})


class TwoFactorVerifyView(APIView):
    authentication_classes = []

    def post(self, request):
        authCont = AuthController()

        authenticated, user = authCont.validate_two_factor(
            request.COOKIES.get(TOTP_COOKIE_NAME),
            request.data.get('otp'),
            SECRET_KEY
        )

        response = JsonResponse({'status': 0, 'authenticated': authenticated})

        if authenticated:
            response.delete_cookie(TOTP_COOKIE_NAME)
            response.set_cookie(
                key=JWT_COOKIE_NAME,
                value=authCont.create_user_jwt(user, SECRET_KEY),
                httponly=True,
                secure=True,
                samesite='Lax'
            )

        return response


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        UserController().set_status(request.user, 'offline')

        response = HttpResponseRedirect('/login')
        response.delete_cookie(JWT_COOKIE_NAME)
        response.delete_cookie('sessionid')

        return response


class AuthenticationCheckView(APIView):
    authentication_classes = []

    def get(self, request):
        authenticated = True

        if not (token := request.COOKIES.get(JWT_COOKIE_NAME)):
            authenticated = False

        try:
            jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except Exception:
            authenticated = False

        return JsonResponse({'status': 0, 'authenticated': authenticated})


class UserAvatarView(APIView):
    parser_classes = [MultiPartParser]
    authentication_classes = [JWTAuthentication]

    def get(self, request, username=''):
        user = request.user
        userCont = UserController()

        if username:
            user = userCont.get_user_by_username(username)

        response = HttpResponse(userCont.get_user_avatar(user))
        response['Content-Type'] = "image/png"
        response['Cache-Control'] = "max-age=0"

        return response

    def put(self, request, username=''):
        if not (request_files := request.FILES) or 'avatar' not in request_files:
            return JsonResponse({'status': 1, 'message': 'No avatar found to upload'})

        avatar = request_files['avatar']

        if (avatar_extension := str(avatar).split('.')[-1]).lower() not in ALLOWED_IMAGE_EXTENSIONS:
            return JsonResponse({
                'status': 1,
                'message':(
                    'Uploaded file has an unsupported extension. '
                    f"(Allowed extensions: {', '.join(ALLOWED_IMAGE_EXTENSIONS)})"
                )
            })

        avatar.name = f"{str(uuid.uuid4())}.{avatar_extension}"

        UserController().update_user_avatar(request.user, avatar)

        return JsonResponse({'status': 0, 'message': 'Avatar successfully updated'})


class UserView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, username=''):
        user = request.user
        userCont = UserController()

        if username:
            user = userCont.get_user_by_username(username)

        return JsonResponse({'status': 0, 'data': userCont.get_user_information(user)})

    def post(self, request, username=''):
        return JsonResponse({'status': 0, **UserController().update_user_information(request.user, request.data)})


class DashboardUsersView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({'status': 0, 'data': UserController().get_dashboard_users(request.user)})


class FriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({'status': 0, **FriendsController().send_request(request.user, request.data)})


class FriendStatusView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, friend):
        return JsonResponse({'status': 0, **FriendsController().get_friend_status(request.user, friend)})


class CancelFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({'status': 0, **FriendsController().cancel_request(request.user, request.data)})


class GetAllFriendRequestView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({'status': 0, **FriendsController().get_friend_requests(request.user)})