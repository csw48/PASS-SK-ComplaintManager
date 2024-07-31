from django.urls import path
from .views import ExternalComplaintList

urlpatterns = [
    path('', ExternalComplaintList.as_view(), name='external-complaints-list'),
]