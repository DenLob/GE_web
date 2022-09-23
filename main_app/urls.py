from django.urls import path

from .views import GetPallets, SendImage, GetStatistics

urlpatterns = [
    path('get-statistics', GetStatistics.as_view()),
    path('get-pallets', GetPallets.as_view()),
    path('get-img', SendImage.as_view())
]
