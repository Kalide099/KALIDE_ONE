from django.contrib import admin
from .models import Dispute, DisputeMessage, DisputeEvidence


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'initiator', 'respondent', 'status', 'priority', 'created_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['title', 'description', 'initiator__username', 'respondent__username']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'initiator', 'respondent', 'project')
        }),
        ('Status & Resolution', {
            'fields': ('status', 'priority', 'resolution', 'resolved_by', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DisputeMessage)
class DisputeMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'dispute', 'sender', 'is_admin_message', 'created_at']
    list_filter = ['is_admin_message', 'created_at']
    search_fields = ['dispute__title', 'sender__username', 'message']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Message Details', {
            'fields': ('dispute', 'sender', 'message', 'attachments', 'is_admin_message')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(DisputeEvidence)
class DisputeEvidenceAdmin(admin.ModelAdmin):
    list_display = ['id', 'dispute', 'uploaded_by', 'file_name', 'evidence_type', 'uploaded_at']
    list_filter = ['evidence_type', 'uploaded_at']
    search_fields = ['dispute__title', 'uploaded_by__username', 'file_name']
    readonly_fields = ['uploaded_at']

    fieldsets = (
        ('Evidence Details', {
            'fields': ('dispute', 'uploaded_by', 'file_url', 'file_name', 'evidence_type', 'description')
        }),
        ('Timestamp', {
            'fields': ('uploaded_at',),
            'classes': ('collapse',)
        }),
    )
