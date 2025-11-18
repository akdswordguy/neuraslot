from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'timetable', TimetableViewSet, basename='timetable')

urlpatterns = [
    path('classes/', ClassListCreateView.as_view()),
    path('classes/<int:pk>/', ClassRetrieveUpdateDeleteView.as_view()),
    
    path('subjects/', SubjectListCreateView.as_view()),
    path('subjects/<int:pk>/', SubjectRetrieveUpdateDeleteView.as_view()),
    
    path('assign/', FacultyClassAssignListCreateView.as_view()),
    path('assign/<int:pk>/', FacultyClassAssignDetailView.as_view()),

    path('activity/', ActivityListView.as_view()),
    path('exam/create/', ExamSlotCreateView.as_view(), name='exam_create'), 
    path('', include(router.urls)),
]