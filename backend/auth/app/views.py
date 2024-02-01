import jwt
import uuid
import secrets
import datetime

from django.http import HttpResponseRedirect, JsonResponse, HttpResponse

from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from auth.settings import SECRET_KEY, ALLOWED_IMAGE_EXTENSIONS, JWT_COOKIE_NAME

from .permissions import JWTAuthentication
from .main import AuthController, UserController


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

        user_id = authCont.retrieve_logged_user(
            authCont.exchange_access_token(callback_code, callback_state)
        )

        payload = {
            'id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        response = HttpResponseRedirect("/login#2fa")
        response.set_cookie(key=JWT_COOKIE_NAME, value=token, httponly=True, secure=True, samesite='Lax')

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

    def get(self, request):
        response = HttpResponse(UserController().get_user_avatar(request.user))
        response['Content-Type'] = "image/png"
        response['Cache-Control'] = "max-age=0"

        return response

    def put(self, request):
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

    def get(self, request):
        return JsonResponse({'status': 0, 'data': UserController().get_user_information(request.user)})

    def post(self, request):
        return JsonResponse({'status': 0, **UserController().update_user_information(request.user, request.data)})
