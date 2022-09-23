from django.contrib import admin

# Register your models here.
from .models import *

admin.site.register(Zone)
admin.site.register(Line)
admin.site.register(TypePlant)
admin.site.register(Pallet)
admin.site.register(Plant)
admin.site.register(Deviations)
admin.site.register(DeviationsPlants)
admin.site.register(AccidentDeviation)
admin.site.register(Camera)
