from rest_framework import generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import  Class, Conflict, Notification, ScheduledEvent, SlotBookingRequest, Subject, FacultyClassAssign, Timetable
from .serializers import (
    ClassSerializer, ConflictSerializer, FacultyClassSerializer, 
    NotificationSerializer, ScheduledEventSerializer, SlotBookingRequestSerializer,
    SubjectSerializer, TimetableSerializer
)



# CLASS CRUD
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



# FACULTY ASSIGN CRUD
class FacultyClassAssignListCreateView(generics.ListCreateAPIView):
    queryset = FacultyClassAssign.objects.all()
    serializer_class = FacultyClassSerializer


class FacultyClassAssignDetailView(generics.DestroyAPIView):
    queryset = FacultyClassAssign.objects.all()
    serializer_class = FacultyClassSerializer

 

# TIMETABLE CRUD + Bulk Update
class TimetableViewSet(ModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer

    # Disable default update
    def update(self, request, *args, **kwargs):
        return Response({"error": "Use /bulk/"}, status=405)

    @action(detail=True, methods=['get'], url_path='')
    def get_class_timetable(self, request, pk=None):
        rows = Timetable.objects.filter(klass_id=pk).order_by('day_of_week', 'period_number')
        return Response(TimetableSerializer(rows, many=True).data)

    @action(detail=False, methods=['put'], url_path='bulk')
    def bulk_update(self, request):
        ser = TimetableSerializer(data=request.data, many=True)
        ser.is_valid(raise_exception=True)

        klass = ser.validated_data[0]['klass']

        Timetable.objects.filter(klass=klass).delete()
        objs = ser.save()
  
        return Response(TimetableSerializer(objs, many=True).data)




# Remaining models if you want logs later
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
