from django.urls import path
from .views import RegisterView, AdminLoginView, FacultyLoginView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/admin/', AdminLoginView.as_view(), name='admin-login'),
    path('login/faculty/', FacultyLoginView.as_view(), name='faculty-login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
