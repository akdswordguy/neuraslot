from django.urls import path
from .views import UserListCreateView, LoginView, LogoutView, UserRetrieveUpdateDeleteView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),

    path("<int:pk>/", UserRetrieveUpdateDeleteView.as_view()),  # detail route first
    path("", UserListCreateView.as_view()),  # list/create last
]
