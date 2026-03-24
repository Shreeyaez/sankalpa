from django.contrib import admin
from .models import MeasurementBook, MeasurementItem, Material, MaterialItem, AbstractCost, AbstractCostItem

admin.site.register(MeasurementBook)
admin.site.register(MeasurementItem)
admin.site.register(Material)
admin.site.register(MaterialItem)
admin.site.register(AbstractCost)
admin.site.register(AbstractCostItem)

# Register your models here.
