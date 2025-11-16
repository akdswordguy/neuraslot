from rest_framework import serializers
from .models import Class, Conflict, FacultyClassAssign, Notification, ScheduledEvent, SlotBookingRequest,Subject, Timetable

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

class SlotBookingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlotBookingRequest
        fields = '__all__'

class ScheduledEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledEvent
        fields = '__all__'

class ConflictSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conflict
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'