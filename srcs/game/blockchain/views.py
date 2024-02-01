from rest_framework.views import APIView
from rest_framework.response import Response
from .executeContract import retrieve_transaction
import os


class TournamentLogView(APIView):
    def get(self, request, format=None):
        return Response(retrieve_transaction())
