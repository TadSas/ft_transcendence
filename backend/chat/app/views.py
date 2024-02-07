from django.http import JsonResponse

from rest_framework.views import APIView

from .permissions import JWTAuthentication


class CreateRoomView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({})