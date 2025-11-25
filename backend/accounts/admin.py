from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ["email", "name", "username", "role", "assigned_trainer", "is_staff", "created_at"]
    list_filter = ["role", "is_staff", "is_active", "assigned_trainer"]
    search_fields = ["email", "username", "name"]

    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("role", "name", "track", "profile_image", "assigned_trainer")}),
    )
