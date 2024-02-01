from django.urls import path
from .views import UserAPIView, LoginAPIView, OAuthCallbackAPIView, LogOutAPIView, home, check_login_status

urlpatterns = [
    path('home', home, name='home'),
    path('api/v1/user', UserAPIView.as_view(), name='user'),
    path('api/v1/check-login', check_login_status, name='check-login'),
    path('api/v1/login', LoginAPIView.as_view(), name='login'),
    path('api/v1/logout', LogOutAPIView.as_view(), name='logout'),
    path('oauth', OAuthCallbackAPIView.as_view(), name='oauth-callback'),
]
