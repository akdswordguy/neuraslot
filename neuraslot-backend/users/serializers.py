# users/serializers.py
from rest_framework import serializers
from .models import Member

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id", "username", "email", "password",
            "first_name", "last_name",
            "is_staff", "is_superuser",
            "faculty_id_number", "department", "contact_number",
            "created_at", "updated_at"
        ]
        extra_kwargs = {
            "password": {"write_only": True},
        }
