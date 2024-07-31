from django.urls import path
from .views import InternalComplaintList

urlpatterns = [
    path('', InternalComplaintList.as_view(), name='internal-complaints-list'),
]