from django.contrib.auth import login, logout
from django.shortcuts import render
from .serializers import CustomUserSerializer
from .models import CustomUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import redirect
from rest_framework.authtoken.models import Token
import requests
import os

# Create your views here.

# 유저 생성후 자동으로 token만들어주는 로직
# from django.conf import settings
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from rest_framework.authtoken.models import Token

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     if created:
#         Token.objects.create(user=instance)


class UserOrTokenAPIView(APIView):
    def get(self, request):
        request_type = request.GET.get('type')
        if request_type == "user":
            return self.api_get_user(request)
        if request_type == "token":
            return self.api_get_token(request)
        return Response({"message": "Invalid type"},
                        status=status.HTTP_400_BAD_REQUEST)

    def api_get_user(self, request):
        return Response({"message": "Get user success",
                         "user": self.get_user_data(request)},
                        status=status.HTTP_200_OK)

    def api_get_token(self, request):
        token_key = self.get_token_key(request)
        if token_key in "Error":
            return Response({"message": "Get token failed",
                             "error": token_key},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Get token success",
                         "token": token_key},
                        status=status.HTTP_200_OK)

    def get_user_data_and_token_key(self, request):
        user_data = self.get_user_data(request)
        token_key = self.get_or_create_token(request)
        return user_data, token_key

    def get_user_data(self, request):
        user_serializer = CustomUserSerializer(request.user)
        return user_serializer.data

    def get_token_key(self, request):
        try:
            token = Token.objects.get(user=request.user)
            return token.key
        except Token.DoesNotExist:
            return "Error: Token.DoesNotExist"

    def create_token(self, request):
        token = Token.objects.create(user=request.user)
        token.save()

    def get_or_create_token(self, request):
        token, created = Token.objects.get_or_create(user=request.user)
        if created:
            token.save()
        return token.key


class LoginAPIView(UserOrTokenAPIView):
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            user_data, token_key = self.get_user_data_and_token_key(request)
            return Response({"message": "Already logged in",
                             "user": user_data,
                             "token": token_key},
                            status=status.HTTP_200_OK)

        client_id = os.getenv('CLIENT_ID')
        redirect_uri = os.getenv('REDIRECT_URI')

        # TODO: 프론트에서 버튼에 직접 url달아서 처리하니 추후 이 부분 로직 변경
        if not client_id or not redirect_uri:
            return Response({"error": "Client ID or Redirect URI is not set in the environment variables."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        login_url = f"https://api.intra.42.fr/oauth/authorize?client_id={
            client_id}&redirect_uri={redirect_uri}&response_type=code"
        return redirect(login_url)


class LogOutAPIView(APIView):
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            logout(request)
            return Response({"message": "Logout successful"},
                            status=status.HTTP_200_OK)
        return Response({"message": "Not logged in"},
                        status=status.HTTP_400_BAD_REQUEST)


# TODO: 유저 생성 로직 고민, 이미 로그인 됐을 때 로직 고민
# TODO: 유저가 로그인 이후에 42로그인만 로그아웃 하는 경우
class OAuthCallbackAPIView(UserOrTokenAPIView):
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            user_data, token_key = self.get_user_data_and_token_key(request)
            return Response({"message": "Already logged in",
                             "user": user_data, "token": token_key},
                            status=status.HTTP_200_OK)

        code = request.GET.get("code")
        error = request.GET.get("error")
        if error is not None:
            error_description = request.GET.get('error_description', '')
            if error == 'access_denied':  # 사용자가 승인을 거절한 경우
                message = "OAuth Authorization Denied by User"
                stat = status.HTTP_401_UNAUTHORIZED
            else:
                message = "OAuth failed"
                stat = status.HTTP_500_INTERNAL_SERVER_ERROR
            return Response({"message": message,
                            "error": error,
                             "error_description": error_description
                             }, status=stat)

        access_token = self.get_access_token_data(code)
        if 'error' in access_token or 'access_token' not in access_token:
            return Response({"error": "Failed to acquire token"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user_info = self.get_user_info(access_token['access_token'])
        if 'error' in user_info:
            return Response({"error": "Failed to fetch user information"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # user가 로그인 하지 않았으니, get_or_create로 유저 로드후 login
        user = self.get_or_create_user(user_info)
        login(request, user)
        token_key = self.get_or_create_token(request)
        return Response({"message": "OAuth successful",
                         "user": self.get_user_data(request),
                         "token": token_key})

    def get_access_token_data(self, code):
        data = {
            "grant_type": "authorization_code",
            "client_id": os.getenv("CLIENT_ID"),
            "client_secret": os.getenv("CLIENT_SECRET"),
            "code": code,
            "redirect_uri": os.getenv("REDIRECT_URI"),
            "scope": "public"
        }
        try:
            response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    def get_user_info(self, access_token):
        try:
            response = requests.get('https://api.intra.42.fr/v2/me',
                                    headers={'Authorization': f'Bearer {access_token}'})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {"error": str(e)}

    def get_or_create_user(self, user_info):
        login = user_info.get('login')
        email = user_info.get('email')
        user, created = CustomUser.objects.get_or_create(
            intraId=login, defaults={'email': email}
        )
        if created:
            user.save()
        return user


def home(request):
    return render(request, 'users/home.html')
