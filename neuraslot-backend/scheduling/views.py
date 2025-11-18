from urllib import request
from rest_framework import generics,status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Class, Subject, FacultyClassAssign, Timetable, Activity, ExamSlot
from django.db import transaction
from .serializers import ClassSerializer, ConflictSerializer, ExamSlotSerializer,ExamSlotCreateSerializer, SubjectSerializer, FacultyClassSerializer, TimetableSerializer, ActivitySerializer
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
    @action(detail=False, methods=['put'], url_path='bulk')
    @action(detail=False, methods=['put'], url_path='bulk')
    def bulk_update(self, request):
        data = request.data
        if not isinstance(data, list) or len(data) == 0:
            return Response({"error": "Expected a non-empty list"}, status=400)

        klass_id = data[0].get("klass")
        existing_rows = {f"{r.day_of_week}-{r.period_number}": r
                        for r in Timetable.objects.filter(klass_id=klass_id)}
        
        to_create = []
        to_update = []

        for row in data:
            key = f"{row['day_of_week']}-{row['period_number']}"
            subject = row.get("subject") or None  # allow null
            
            if key in existing_rows:
                obj = existing_rows[key]
                obj.subject_id = subject
                obj.is_lab = row.get("is_lab", False)
                to_update.append(obj)
            else:
                to_create.append(Timetable(
                    klass_id=klass_id,
                    day_of_week=row["day_of_week"],
                    period_number=row["period_number"],
                    subject_id=subject,
                    is_lab=row.get("is_lab", False)
                ))

        if to_update:
            Timetable.objects.bulk_update(to_update, ["subject_id", "is_lab"])
        if to_create:
            Timetable.objects.bulk_create(to_create)

        updated = Timetable.objects.filter(klass_id=klass_id).order_by("day_of_week", "period_number")
        return Response(TimetableSerializer(updated, many=True).data)


# Activity
class ActivityListView(generics.ListAPIView):
    queryset = Activity.objects.all().order_by('-timestamp')
    serializer_class = ActivitySerializer


# Helper: get class id from section/name
def get_class_id_from_section(section_name):
    try:
        return Class.objects.get(name=section_name).id
    except Class.DoesNotExist:
        return None


class ExamSlotCreateView(APIView):
    def post(self, request):
        serializer = ExamSlotCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        exam_slots = serializer.validated_data.get("examSlots", [])
        detected_conflicts = serializer.validated_data.get("detectedConflicts", [])

        if not exam_slots:
            return Response({"error": "No exam slots provided"}, status=400)

        current_faculty = request.user if request.user.is_authenticated else None
        to_create = []
        skipped_sections = []

        with transaction.atomic():
            for slot in exam_slots:
                class_id = get_class_id_from_section(slot["section"])
                if not class_id:
                    skipped_sections.append(slot["section"])
                    continue

                exam_slot = ExamSlot(
                    section=slot["section"],
                    subject_id=slot["subject"],
                    exam_date=slot["date"],
                    day=slot["day"],
                    period=slot["period"],
                    conflict=detected_conflicts if detected_conflicts else None,
                )
                to_create.append(exam_slot)

            if to_create:
                ExamSlot.objects.bulk_create(to_create)

        log_activity(
            "CREATE", "ExamSlot",
            f"{len(to_create)} exam slots added",
            current_faculty
        )

        return Response({
            "status": "success",
            "created_slots": len(to_create),
            "skipped_sections": skipped_sections,
            "conflicts_logged": len(detected_conflicts),
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        return Response({"message": "ExamSlot Create API Ready"}, status=200)

    def post(self, request):
        serializer = ExamSlotCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        exam_slots = serializer.validated_data.get("examSlots", [])
        detected_conflicts = serializer.validated_data.get("detectedConflicts", [])

        if not exam_slots:
            return Response({"error": "No exam slots provided"}, status=400)

        current_faculty = request.user if request.user.is_authenticated else None
        to_create = []
        skipped_sections = []

        with transaction.atomic():
            for slot in exam_slots:
                class_id = get_class_id_from_section(slot["section"])
                if not class_id:
                    skipped_sections.append(slot["section"])
                    continue

                exam_slot = ExamSlot(
                    section=slot["section"],
                    subject_id=slot["subject"],
                    exam_date=slot["date"],
                    day=slot["day"],
                    period=slot["period"],
                    conflict=detected_conflicts or None,
                )
                to_create.append(exam_slot)

            if to_create:
                ExamSlot.objects.bulk_create(to_create)

        if to_create:
            log_activity(
                action="CREATE",
                entity="ExamSlot",
                description=f"{len(to_create)} exam slots added",
                user=current_faculty
            )


        return Response(
            {
                "status": "success",
                "created_slots": len(to_create),
                "skipped_sections": skipped_sections,
                "conflicts_logged": len(detected_conflicts)
            },
            status=status.HTTP_201_CREATED
        )

    def get(self, request):
        return Response({"message": "ExamSlot Create API Active 📡"}, status=200)