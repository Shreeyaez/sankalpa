from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.db import models
import json

from apps.audit.models import AuditLog
from apps.contractors.models import Contractor
from apps.engineers.models import Engineer
from apps.chairpersons.models import Chairperson
from apps.projects.models import Project

# Add all models you want to track
TRACKED_MODELS = [Contractor, Engineer, Chairperson, Project]

def serialize_instance(instance):
    """Convert model instance to JSON-serializable dict"""
    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.name)
        if hasattr(value, 'pk'):  # ForeignKey
            data[field.name] = value.pk
        elif hasattr(value, 'isoformat'):  # Date/DateTime
            data[field.name] = value.isoformat()
        else:
            data[field.name] = str(value) if value is not None else None
    return data

@receiver(pre_save)
def store_old_data(sender, instance, **kwargs):
    """Store old data before update"""
    if sender not in TRACKED_MODELS:
        return
    
    if instance.pk:  # Only for existing records (updates)
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_data = serialize_instance(old_instance)
        except sender.DoesNotExist:
            instance._old_data = {}

@receiver(post_save)
def log_model_save(sender, instance, created, **kwargs):
    if sender not in TRACKED_MODELS:
        return
    
    # Get current user from thread local storage (we'll set this up next)
    from apps.audit.middleware import get_current_user
    user = get_current_user()
    
    if not user:
        return  # Skip if no authenticated user
    
    try:
        AuditLog.objects.create(
            table_name=sender._meta.db_table,
            record_id=instance.pk,
            action="INSERT" if created else "UPDATE",
            old_data=None if created else json.dumps(getattr(instance, '_old_data', {})),
            new_data=json.dumps(serialize_instance(instance)),
            changed_by=user
        )
    except Exception as e:
        print(f"Audit log creation failed: {e}")

@receiver(post_delete)
def log_model_delete(sender, instance, **kwargs):
    if sender not in TRACKED_MODELS:
        return
    
    from apps.audit.middleware import get_current_user
    user = get_current_user()
    
    if not user:
        return
    
    try:
        AuditLog.objects.create(
            table_name=sender._meta.db_table,
            record_id=instance.pk,
            action="DELETE",
            old_data=json.dumps(serialize_instance(instance)),
            new_data=None,
            changed_by=user
        )
    except Exception as e:
        print(f"Audit log creation failed: {e}")