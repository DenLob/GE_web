from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('home1', index),
    path('info', index),

]