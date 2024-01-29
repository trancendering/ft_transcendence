from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):

    intraId = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    # 선호 언어 필드 추가
    preferred_language = models.CharField(
        max_length=2,
        choices=[
            ('en', 'English'),
            ('ko', '한국어'),
            ('zh', '中文'),
        ],
        default='ko',
    )

    def __str__(self):
        return self.intraId
