from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TimetableViewSet, ClassListCreateView, ClassRetrieveUpdateDeleteView, \
    SubjectListCreateView, SubjectRetrieveUpdateDeleteView, FacultyClassAssignListCreateView, \
    SlotBookingRequestListCreateView, ScheduledEventListCreateView, ConflictListCreateView, \
    NotificationListCreateView

router = DefaultRouter()
router.register(r'timetable', TimetableViewSet, basename='timetable')


urlpatterns = [
    path('classes/', ClassListCreateView.as_view()),
    path('classes/<int:pk>/', ClassRetrieveUpdateDeleteView.as_view()),

    path('subjects/', SubjectListCreateView.as_view()),
    path('subjects/<int:pk>/', SubjectRetrieveUpdateDeleteView.as_view()),

    path('assign/', FacultyClassAssignListCreateView.as_view()),

    path('slotrequest/', SlotBookingRequestListCreateView.as_view()),
    path('scheduledevent/', ScheduledEventListCreateView.as_view()),
    path('conflict/', ConflictListCreateView.as_view()),
    path('notification/', NotificationListCreateView.as_view()),

    path('', include(router.urls)),
]
