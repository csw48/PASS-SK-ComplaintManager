import django_filters
from .models import ExternalComplaint , InternalComplaint
import logging

logger = logging.getLogger(__name__)

class ExternalComplaintFilter(django_filters.FilterSet):
    date_after = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    complaint_number = django_filters.CharFilter(field_name='complaint_number', lookup_expr='icontains')
    customer = django_filters.CharFilter(field_name='customer', lookup_expr='icontains')
    model_sk = django_filters.CharFilter(field_name='model_sk', lookup_expr='icontains')
    model_de = django_filters.CharFilter(field_name='model_de', lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=ExternalComplaint.STATUS_CHOICES)

    class Meta:
        model = ExternalComplaint
        fields = ['complaint_number', 'customer', 'model_sk', 'model_de', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        logger.debug(f'Initialized with data: {self.data}')

class InternalComplaintFilter(django_filters.FilterSet):
    date_after = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    complaint__number = django_filters.CharFilter(lookup_expr='icontains')
    model = django_filters.CharFilter(lookup_expr='icontains')
    part_number = django_filters.CharFilter(lookup_expr='icontains')
    product_number = django_filters.CharFilter(lookup_expr='icontains')
    priority = django_filters.ChoiceFilter(choices=InternalComplaint.PRIORITY_CHOICES)

    class Meta:
        model = InternalComplaint
        fields = ['complaint_number','model','part_number','product_number','priority']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        logger.debug(f'Initialized with data: {self.data}')