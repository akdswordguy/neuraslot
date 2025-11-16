from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    ClassListCreateView,
    ClassRetrieveUpdateDeleteView,
    ConflictListCreateView,
    FacultyClassAssignListCreateView,
    NotificationListCreateView,
    ScheduledEventListCreateView,  
    SlotBookingRequestListCreateView,
    SubjectListCreateView,
    SubjectRetrieveUpdateDeleteView,
    TimetableListCreateView,
    ScheduledEventViewSet,
    NotificationForRecipientListView,
)


router = DefaultRouter()
router.register('scheduledevent', ScheduledEventViewSet, basename='scheduledevent')

urlpatterns = [
    path('classes/', ClassListCreateView.as_view(), name='classes-list-create'),
    path('classes/<int:pk>/', ClassRetrieveUpdateDeleteView.as_view(), name='classes-detail'),
    path('subjects/', SubjectListCreateView.as_view(), name='subjects-list-create'),
    path('subjects/<int:pk>/', SubjectRetrieveUpdateDeleteView.as_view(), name='subjects-detail'),
    path('assign/', FacultyClassAssignListCreateView.as_view(), name='facultyclass-assignments-list-create'),
    path('timetable/', TimetableListCreateView.as_view(), name='timetable-list-create'),
    path('slotrequest/', SlotBookingRequestListCreateView.as_view(), name='slotbookingrequests-list-create'),
    path('scheduledevent/', ScheduledEventListCreateView.as_view(), name='scheduledevents-list-create'),
    path('conflict/', ConflictListCreateView.as_view(), name='conflicts-list-create'),
    path('notification/', NotificationListCreateView.as_view(), name='notifications-list-create'),
    path('notification/for_recipient/', NotificationForRecipientListView.as_view(), name='notifications-for-recipient'),

]

urlpatterns += router.urls
