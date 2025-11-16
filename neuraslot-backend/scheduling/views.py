from rest_framework import generics
from .models import Class, Conflict, Notification, ScheduledEvent, SlotBookingRequest, Subject, FacultyClassAssign, Timetable
from .serializers import ClassSerializer, ConflictSerializer, FacultyClassSerializer, NotificationSerializer, ScheduledEventSerializer, SlotBookingRequestSerializer, SubjectSerializer, TimetableSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.response import Response


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
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.all()
        recipient_id = self.request.query_params.get('recipient_id')
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)
        return queryset
class ScheduledEventViewSet(viewsets.ModelViewSet):
    queryset = ScheduledEvent.objects.all()
    serializer_class = ScheduledEventSerializer

    @action(detail=False)
    def today(self, request):
        faculty_id = request.query_params.get('faculty_id')
        today = timezone.now().date()
        events = self.queryset.filter(
            faculty_id=faculty_id,
            event_date=today
        )
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def upcoming(self, request):
        faculty_id = request.query_params.get('faculty_id')
        today = timezone.now().date()
        events = self.queryset.filter(
            faculty_id=faculty_id,
            event_date__gte=today
        ).order_by('event_date', 'period_number')[:10]
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

class NotificationForRecipientListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        recipient_id = self.request.query_params.get('recipient_id')
        if recipient_id is None:
            return Notification.objects.none()
        return Notification.objects.filter(recipient_id=recipient_id)
