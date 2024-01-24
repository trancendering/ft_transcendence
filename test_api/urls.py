from django.urls import path
from .views import test_sio

urlpatterns = [
    path("sio/", test_sio, name="test_sio"),
]
