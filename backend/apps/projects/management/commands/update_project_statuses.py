"""
Management command to update all project statuses based on dates.
Run this daily via cron or scheduler.

Usage:
    python manage.py update_project_statuses
"""

from django.core.management.base import BaseCommand
from apps.projects.models import Project


class Command(BaseCommand):
    help = 'Update all project statuses based on current dates'

    def handle(self, *args, **options):
        projects = Project.objects.all()
        updated_count = 0
        
        for project in projects:
            old_status = project.status
            project.update_status()
            
            if project.status != old_status:
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated {project.project_code}: {old_status} → {project.status}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nCompleted! Updated {updated_count} out of {projects.count()} projects.'
            )
        )