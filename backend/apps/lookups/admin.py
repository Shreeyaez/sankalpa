from django.contrib import admin
from .models import (
    PriorityLevel,
    ProjectType,
    RoadType,
    DelayType,
    AlertType,
    BudgetSource,
    FiscalYear,
)

admin.site.register(PriorityLevel)
admin.site.register(ProjectType)
admin.site.register(RoadType)
admin.site.register(DelayType)
admin.site.register(AlertType)
admin.site.register(BudgetSource)
admin.site.register(FiscalYear)
# Register your models here.
