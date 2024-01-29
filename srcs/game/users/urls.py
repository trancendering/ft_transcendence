from django.urls import path
from .views import UserOrTokenAPIView, LoginAPIView, OAuthCallbackAPIView, home

urlpatterns = [
    # path('login/', LoginView.as_view(), name='login-url'),
    path('home/', home, name='home'),
    path('api/v1/user-or-token/', UserOrTokenAPIView.as_view(), name='user-or-token'),
    path('login-url/', LoginAPIView.as_view(), name='login-url'),
    path('oauth/', OAuthCallbackAPIView.as_view(), name='oauth-callback'),
]
