import jwt
import secrets
import datetime

from django.shortcuts import redirect
from django.http import JsonResponse, HttpResponse

from rest_framework.views import APIView

from auth.settings import SECRET_KEY

from .main import AuthController
from .permissions import JWTAuthentication


class LoginView(APIView):
    authentication_classes = []

    def get(self, request):
        request.session['auth_state'] = (state := secrets.token_urlsafe(64)[:64])

        return JsonResponse({'redirect_uri': AuthController().get_authorization_url(state)})


class CallbackView(APIView):
    authentication_classes = []

    def get(self, request):
        qs = request.query_params
        authCont = AuthController()

        callback_code = qs.get('code')
        callback_state = qs.get('state')

        auth_state = request.session.get('auth_state')

        if not auth_state or auth_state != callback_state:
            return redirect("/login")

        user_id = authCont.retrieve_logged_user(
            authCont.exchange_access_token(callback_code, callback_state)
        )

        payload = {
            'id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        response = redirect("/login")
        response.set_cookie(key='jwt', value=token, httponly=True)

        return response


class LogoutView(APIView):
    authentication_classes = []

    def get(self, request):
        return JsonResponse({'detail': 'Successfully logged out.'})


class AuthenticationCheckView(APIView):
    authentication_classes = []

    def get(self, request):
        authenticated = True

        if not (token := request.COOKIES.get('jwt')):
            authenticated = False

        try:
            jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except Exception:
            authenticated = False

        return JsonResponse({'authenticated': authenticated})


class UserAvatarView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        response = HttpResponse(AuthController().get_user_avatar())
        response['Content-Type'] = "image/png"
        response['Cache-Control'] = "max-age=0"

        return response


class UserView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({'data': AuthController().get_user_information(request.user)})
