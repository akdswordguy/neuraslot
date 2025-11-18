from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Member
from .serializers import MemberSerializer
from rest_framework.authtoken.models import Token

@method_decorator(csrf_exempt, name="dispatch")
class UserListCreateView(APIView):
    
    def get(self, request):
        users = Member.objects.filter(is_staff=True)  # Only faculty
        serializer = MemberSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "User registered successfully"}, status=201)
        return Response(serializer.errors, status=400)


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    authentication_classes = []  # Public login
    permission_classes = []     # No permission needed to log in

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=401)

        login(request, user)
        user_data = MemberSerializer(user).data

        return Response({
            "detail": "Login successful",
            "user": user_data
        }, status=200)

@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out"}, status=200)
    
class UserRetrieveUpdateDeleteView(APIView):
    def get_object(self, pk):
        try:
            return Member.objects.get(pk=pk)
        except Member.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({"detail": "User not found"}, status=404)
        serializer = MemberSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({"detail": "User not found"}, status=404)
        serializer = MemberSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if user is None:
            return Response({"detail": "User not found"}, status=404)
        user.delete()
        return Response({"detail": "User deleted"}, status=204)