from rest_framework import generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Class, Subject, FacultyClassAssign, Timetable, Activity
from .serializers import ClassSerializer, SubjectSerializer, FacultyClassSerializer, TimetableSerializer, ActivitySerializer
from .utils import log_activity


# CLASS CRUD
class ClassListCreateView(generics.ListCreateAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    def perform_create(self, serializer):
        obj = serializer.save()
        log_activity("CREATE", "Class", f"{obj.name} created", self.request.user)

class ClassRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity("UPDATE", "Class", f"{obj.name} updated", self.request.user)

    def perform_destroy(self, instance):
        log_activity("DELETE", "Class", f"{instance.name} deleted", self.request.user)
        instance.delete()


# SUBJECT CRUD
class SubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def perform_create(self, serializer):
        obj = serializer.save()
        log_activity("CREATE", "Subject", f"{obj.name} created", self.request.user)


class SubjectRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def perform_update(self, serializer):
        obj = serializer.save()
        log_activity("UPDATE", "Subject", f"{obj.name} updated", self.request.user)

    def perform_destroy(self, instance):
        log_activity("DELETE", "Subject", f"{instance.name} deleted", self.request.user)
        instance.delete()


# FACULTY ASSIGNMENT CRUD
class FacultyClassAssignListCreateView(generics.ListCreateAPIView):
    queryset = FacultyClassAssign.objects.all()
    serializer_class = FacultyClassSerializer

    def perform_create(self, serializer):
        obj = serializer.save()
        log_activity("CREATE", "FacultyAssign", f"Faculty assigned to class {obj.klass}", self.request.user)


class FacultyClassAssignDetailView(generics.DestroyAPIView):
    queryset = FacultyClassAssign.objects.all()
    serializer_class = FacultyClassSerializer

    def perform_destroy(self, instance):
        log_activity("DELETE", "FacultyAssign", f"Faculty unassigned from class {instance.klass}", self.request.user)
        instance.delete()


# TIMETABLE CRUD
class TimetableViewSet(ModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer

    @action(detail=True, methods=['get'])
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

        log_activity("UPDATE", "Timetable", f"Timetable updated for class {klass}", request.user)
        return Response(TimetableSerializer(objs, many=True).data)


# Activity
class ActivityListView(generics.ListAPIView):
    queryset = Activity.objects.all().order_by('-timestamp')
    serializer_class = ActivitySerializer
