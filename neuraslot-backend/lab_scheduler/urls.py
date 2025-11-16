from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/scheduling/', include('scheduling.urls')),  # later
    path('api/users/', include('users.urls')),  # new
]
