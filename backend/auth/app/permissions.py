import jwt

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication

from auth.settings import SECRET_KEY, JWT_COOKIE_NAME

from .models import Users


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        if not (token := request.COOKIES.get(JWT_COOKIE_NAME)):
            raise AuthenticationFailed({'authenticated': False})

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = Users.objects.filter(id=payload.get('id')).first()
        except Exception:
            raise AuthenticationFailed({'authenticated': False})

        return (user, None)
