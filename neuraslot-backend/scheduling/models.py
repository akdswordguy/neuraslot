# scheduling/models.py
from django.db import models
from django.conf import settings

from users.models import Member
from django.contrib.postgres.fields import ArrayField

User = settings.AUTH_USER_MODEL



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
    has_lab = models.BooleanField(default=False)
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
    is_lab = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "timetable"
        managed = False
        unique_together = ('klass', 'day_of_week', 'period_number')




from django.db import models
from scheduling.models import Class, Subject  # Adjust imports if needed

class ExamSlot(models.Model):
    section = models.CharField(max_length=50)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    exam_date = models.DateField()
    day = models.CharField(max_length=20)
    period = models.PositiveSmallIntegerField()
    conflict = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "examslot"

    def __str__(self):
        return f"{self.section} - {self.subject.name} ({self.exam_date})"


class Conflict(models.Model):
    conflicting_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    conflicting_subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    conflicting_period = models.PositiveSmallIntegerField()
    conflicting_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "conflict"

    def __str__(self):
        return f"Class {self.conflicting_class} Subject {self.conflicting_subject}"


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


class Activity(models.Model):
    action = models.CharField(max_length=50)
    entity = models.CharField(max_length=50)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(Member, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = "scheduling_activity"
        managed = False