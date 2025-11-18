from rest_framework import serializers
from .models import Class, Conflict, FacultyClassAssign, Notification, Subject, Timetable, Activity, ExamSlot


class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class FacultyClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyClassAssign
        fields = '__all__'


class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = '__all__'



class ConflictSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conflict
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            "id", "action", "entity", "description",
            "timestamp", "user_name"
        ]

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.first_name or "User"
        return "System"
    

class ExamSlotSerializer(serializers.Serializer):
    date = serializers.DateField()
    section = serializers.CharField(max_length=50)
    period = serializers.IntegerField(min_value=1, max_value=8)
    day = serializers.CharField(max_length=20)
    subject = serializers.IntegerField()

class ExamSlotCreateSerializer(serializers.Serializer):
    examSlots = ExamSlotSerializer(many=True)
    detectedConflicts = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )
