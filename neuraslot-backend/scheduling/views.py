from rest_framework import generics
from .models import Class, Conflict, Notification, ScheduledEvent, SlotBookingRequest, Subject, FacultyClassAssign, Timetable
from .serializers import ClassSerializer, ConflictSerializer, FacultyClassSerializer, NotificationSerializer, ScheduledEventSerializer, SlotBookingRequestSerializer, SubjectSerializer, TimetableSerializer


class ClassListCreateView(generics.ListCreateAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer


class ClassRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer


class SubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class SubjectRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class FacultyClassAssignListCreateView(generics.ListCreateAPIView):
    queryset = FacultyClassAssign.objects.all()
    serializer_class = FacultyClassSerializer

class TimetableListCreateView(generics.ListCreateAPIView):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer

class SlotBookingRequestListCreateView(generics.ListCreateAPIView):
    queryset = SlotBookingRequest.objects.all()
    serializer_class = SlotBookingRequestSerializer


class ScheduledEventListCreateView(generics.ListCreateAPIView):
    queryset = ScheduledEvent.objects.all()
    serializer_class = ScheduledEventSerializer


class ConflictListCreateView(generics.ListCreateAPIView):
    queryset = Conflict.objects.all()
    serializer_class = ConflictSerializer


class NotificationListCreateView(generics.ListCreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer