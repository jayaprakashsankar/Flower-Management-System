"""
FMS Custom Admin Site Configuration
Fixes: Admin cannot create other Admin accounts (is_staff + is_superuser bug)
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User


class CustomUserAdmin(BaseUserAdmin):
    """
    BUG FIX: Override Django's default UserAdmin to ensure
    is_staff and is_superuser are always properly editable and
    saved when creating new admin/superuser accounts.
    The fieldsets below explicitly include permissions in the
    'add' form so that a superuser can create another superuser
    directly from the admin panel without editing afterwards.
    """
    # Show permission fields directly on the add-user form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'password1', 'password2',
                'first_name', 'last_name', 'email',
                'is_active', 'is_staff', 'is_superuser',  # ← FIX: include here
            ),
        }),
    )
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',  # ← FIX: always present
                'groups', 'user_permissions',
            ),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_active']
    list_filter  = ['is_staff', 'is_superuser', 'is_active']
    list_editable = ['is_staff', 'is_superuser', 'is_active']  # ← edit inline without entering record

    def save_model(self, request, obj, form, change):
        """
        Ensure is_staff is always True when is_superuser is True.
        This was the root bug: Django requires is_staff=True for superusers
        to access the admin panel, but it wasn't always being enforced.
        """
        if obj.is_superuser:
            obj.is_staff = True  # ← ROOT CAUSE FIX
        super().save_model(request, obj, form, change)


# Re-register User with our fixed admin class
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# ─── Admin site branding ──────────────────────────────────────────────────────
admin.site.site_header  = 'FloraChain Administration'
admin.site.site_title   = 'FloraChain Admin'
admin.site.index_title  = 'Multi-Role Agricultural Ecosystem'
