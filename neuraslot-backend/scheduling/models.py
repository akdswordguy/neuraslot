# scheduling/models.py
from django.db import models
from django.conf import settings

from users.models import Member

User = settings.AUTH_USER_MODEL  # 'accounts.User'

class Class(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "classes"
        managed = False

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    credit_score = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subject"
        managed = False

    def __str__(self):
        return self.name


# scheduling/models.py

class FacultyClassAssign(models.Model):
    id = models.BigAutoField(primary_key=True)
    faculty = models.ForeignKey(Member, db_column='faculty_id', on_delete=models.CASCADE)
    klass = models.ForeignKey(Class, db_column='class_id', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "facultyclassassign"
        managed = False   # because table already exists
        unique_together = ('faculty', 'klass')


class Timetable(models.Model):
    klass = models.ForeignKey(Class, db_column='class_id', on_delete=models.CASCADE)
    day_of_week = models.PositiveSmallIntegerField()  # 1-7
    period_number = models.PositiveSmallIntegerField()
    subject = models.ForeignKey(Subject, null=True, blank=True, on_delete=models.SET_NULL)
    faculty = models.ForeignKey(Member, db_column='faculty_id', null=True, blank=True, on_delete=models.SET_NULL)
    is_lab = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "timetable"
        managed = False
        unique_together = ('klass', 'day_of_week', 'period_number')


# Booking types and status as simple strings with choices:
BOOKING_TYPES = (
    ('LAB_THEORY', 'Lab Theory'),
    ('EXAM', 'Exam'),
)

REQUEST_STATUS = (
    ('PENDING', 'Pending'),
    ('APPROVED', 'Approved'),
    ('REJECTED', 'Rejected'),
    ('CANCELLED', 'Cancelled'),
)


class SlotBookingRequest(models.Model):
    faculty = models.ForeignKey(Member, db_column='faculty_id', on_delete=models.CASCADE)
    klass = models.ForeignKey(Class, db_column='class_id', on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    requested_date = models.DateField()
    requested_period = models.PositiveSmallIntegerField()
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPES)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='PENDING')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "slotbookingrequest"
        managed = False


EVENT_TYPES = (
    ('LAB_THEORY', 'Lab Theory'),
    ('LAB_EXAM', 'Lab Exam'),
    ('DISPLACED_LAB_THEORY', 'Displaced Lab Theory'),
)


class ScheduledEvent(models.Model):
    klass = models.ForeignKey(Class, db_column='class_id', on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.RESTRICT)
    faculty = models.ForeignKey(Member, db_column='faculty_id', on_delete=models.RESTRICT)
    event_date = models.DateField()
    period_number = models.PositiveSmallIntegerField()
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    original_timetable_slot = models.ForeignKey(Timetable, null=True, blank=True, on_delete=models.SET_NULL)
    related_slot_booking_request = models.OneToOneField(SlotBookingRequest, null=True, blank=True, on_delete=models.SET_NULL)
    exam_group_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "scheduledevent"
        managed = False
        unique_together = ('klass', 'event_date', 'period_number')


class Conflict(models.Model):
    exam_group_id = models.UUIDField()
    conflicting_class = models.ForeignKey(Class, db_column='conflicting_class_id', on_delete=models.CASCADE)
    conflicting_subject = models.ForeignKey(Subject, db_column='conflicting_subject_id', on_delete=models.CASCADE)
    conflicting_period = models.PositiveSmallIntegerField()
    conflicting_date = models.DateField()
    suggested_reschedule_date = models.DateField(null=True, blank=True)
    suggested_reschedule_period = models.PositiveSmallIntegerField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "conflict"
        managed = False


class Notification(models.Model):
    recipient = models.ForeignKey(Member, db_column='recipient_id', on_delete=models.CASCADE)
    message = models.TextField()
    notification_type = models.CharField(max_length=40)
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notification"
        managed = False
