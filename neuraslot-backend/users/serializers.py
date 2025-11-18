from rest_framework import serializers
from .models import Member

class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id", "username", "email", "password",
            "first_name", "last_name",
            "faculty_id_number", "subject", "contact_number",
            "is_staff", "is_superuser",
            "created_at", "updated_at"
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Member.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
