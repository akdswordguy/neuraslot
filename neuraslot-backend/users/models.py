from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.db import models

class MemberManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("Username required")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, email, password, **extra_fields)

class Member(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    first_name = models.CharField(max_length=30, null=True, blank=True)
    last_name = models.CharField(max_length=150, null=True, blank=True)

    faculty_id_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    subject = models.ForeignKey('scheduling.Subject',null=True,blank=True,on_delete=models.SET_NULL,db_column='subject_id')
    contact_number = models.CharField(max_length=20, null=True, blank=True)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Disable useless login tracking if DB doesn't have column
    last_login = None  

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = MemberManager()

    class Meta:
        db_table = "members"
        managed = False

    def __str__(self):
        return self.username
