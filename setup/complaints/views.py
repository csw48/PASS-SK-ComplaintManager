import pandas as pd
from django.shortcuts import render, redirect
from rest_framework.decorators import api_view , action
from rest_framework.response import Response 
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.contrib import messages
from rest_framework import viewsets, generics, status, permissions, status
from .models import InternalComplaint, ExternalComplaint, ComplainCost
from .serializers import InternalComplaintSerializer, ExternalComplaintSerializer, ComplainCostSerializer, RegisterSerializer, LoginSerializer, UserSerializer, LogEntrySerializer
from .forms import InternalComplaintForm, ExternalComplaintForm, ComplainCostForm
import logging

from django.dispatch import receiver
from django.db.models.signals import post_save , pre_save
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType

from django.http import JsonResponse
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponseNotFound
from django.db.models import Count
from django.db.models import Q
import decimal
import pdfplumber
from auditlog.models import LogEntry
from django.views.decorators.csrf import csrf_exempt
import re
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

RESPONSIBLE_MAP = {
    "S.Yüksekol": "Salih Yüksekol",
    "G.Verzi": "Giuseppe Verzi",
    "M.Stach": "Marek Stach",
    "G.Wacławski": "Grzegorz Wacławski",
    "S.Ilič": "Sanja Ilič",
    "Salih Yüksekol": "Salih Yüksekol",
    "Giuseppe Verzi": "NEMECKO Gumy: Giuseppe Verzi",
    "Marek Stach": "POĽSKO Gumy Marek Stach, Łukasz Jachlewski.",
    "Grzegorz Wacławski": "POĽSKO Kovové rúrky Grzegorz Wacławski, Paweł Fejdasz",
    "Sanja Ilič": "BOSNA: Sanja Ilič",
    "Yuksekol": "Salih Yüksekol",
    "S. Yüksekol": "Salih Yüksekol",
    "G. Verzi": "Giuseppe Verzi",
    "M. Stach": "Marek Stach",
    "G. Wacławski": "Grzegorz Wacławski",
    "S. Ilič": "Sanja Ilič",
}

CREATED_BY_MAP = {
    "T.Geletka": "Geletka",
    "P.Staňa": "Staňa",
    "S.Pamula": "Pamula",
    "S.Spielmann": "Spielmann",
    "M.Kaščáková": "Kaščáková",
    "L.Augustin": "Augustin",
    "Geletka": "Geletka",
    "Staňa": "Staňa",
    "Pamula": "Pamula",
    "Spielmann": "Spielmann",
    "Kaščáková": "Kaščáková",
    "Augustin": "Augustin",
    "T. Geletka": "Geletka",
    "P. Staňa": "Staňa",
    "S. Pamula": "Pamula",
    "S. Spielmann": "Spielmann",
    "M. Kaščáková": "Kaščáková",
    "L. Augustin": "Augustin",
}

def translate_keys(data, translation_map):
    return {translation_map.get(k, k): v for k, v in data.items()}

@receiver(pre_save, sender=InternalComplaint)
@receiver(pre_save, sender=ExternalComplaint)
def log_changes(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    changes = []
    for field in instance._meta.fields:
        field_name = field.name
        old_value = getattr(old_instance, field_name)
        new_value = getattr(instance, field_name)
        if old_value != new_value:
            changes.append(f'{field.verbose_name}: "{old_value}" -> "{new_value}"')

    if changes:
        actor = instance.modified_by if hasattr(instance, 'modified_by') and isinstance(instance.modified_by, User) else get_user_from_token(kwargs['request'])
        LogEntry.objects.create(
            actor=actor,
            action=2,  # 2 represents 'Update'
            changes=', '.join(changes),
            timestamp=timezone.now(),
            content_type=ContentType.objects.get_for_model(sender),
            object_pk=instance.pk,
            object_repr=str(instance)
        )

@receiver(post_save, sender=InternalComplaint)
@receiver(post_save, sender=ExternalComplaint)
def log_creation(sender, instance, created, **kwargs):
    if created:
        actor = instance.created_by if hasattr(instance, 'created_by') and isinstance(instance.created_by, User) else get_user_from_token(kwargs['request'])
        LogEntry.objects.create(
            actor=actor,
            action=1,  # 1 represents 'Create'
            changes=f'{sender._meta.verbose_name} ({instance.complaint_number}) created.',
            timestamp=timezone.now(),
            content_type=ContentType.objects.get_for_model(sender),
            object_pk=instance.pk,
            object_repr=str(instance)
        )

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username
        })

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': user.username}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class LogEntryListView(ListAPIView):
    queryset = LogEntry.objects.all().order_by('-timestamp')
    serializer_class = LogEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

def view_logs(request):
    logs = LogEntry.objects.all().select_related('actor')
    context = {'logs': logs}
    return render(request, 'view_logs.html', context)

def home(request):
    return render(request, 'home.html')

class InternalComplaintViewSet(viewsets.ModelViewSet):
    queryset = InternalComplaint.objects.all()
    serializer_class = InternalComplaintSerializer

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        log_creation(sender=InternalComplaint, instance=instance, created=True, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save(modified_by=self.request.user)
        log_changes(sender=InternalComplaint, instance=instance, request=self.request)

class ExternalComplaintViewSet(viewsets.ModelViewSet):
    queryset = ExternalComplaint.objects.all()
    serializer_class = ExternalComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user)
        log_creation(sender=ExternalComplaint, instance=instance, created=True, request=self.request)

    def perform_update(self, serializer):
        instance = serializer.save(modified_by=self.request.user)
        log_changes(sender=ExternalComplaint, instance=instance, request=self.request)

class ComplainCostViewSet(viewsets.ModelViewSet):
    queryset = ComplainCost.objects.all()
    serializer_class = ComplainCostSerializer


class BaseComplaintPagination(PageNumberPagination):
    page_size = 150
    page_size_query_param = 'limit'
    max_page_size = 10000

class BaseComplaintList(generics.ListCreateAPIView):
    pagination_class = BaseComplaintPagination
    
    def get_sort_params(self):
        sort_by = self.request.query_params.get('sort_by', 'date')
        sort_order = self.request.query_params.get('sort_order', 'desc')
        return sort_by, sort_order

    def sort_queryset(self, queryset, sort_by, sort_order):
        if sort_order == 'desc':
            queryset = queryset.order_by(f'-{sort_by}')
        else:
            queryset = queryset.order_by(sort_by)
        return queryset

class InternalComplaintList(BaseComplaintList):
    serializer_class = InternalComplaintSerializer

    def get_queryset(self):
        queryset = InternalComplaint.objects.all()
        sort_by, sort_order = self.get_sort_params()
        return self.sort_queryset(queryset, sort_by, sort_order)

class ExternalComplaintList(BaseComplaintList):
    serializer_class = ExternalComplaintSerializer

    def get_queryset(self):
        queryset = ExternalComplaint.objects.all()
        sort_by, sort_order = self.get_sort_params()

        filters = {
            'complaint_number': self.request.query_params.get('complaint_number', None),
            'model_sk': self.request.query_params.get('model_sk', None),
            'model_de': self.request.query_params.get('model_de', None),
            'customer': self.request.query_params.get('customer', None),
            'status': self.request.query_params.get('status', None),
        }

        for key, value in filters.items():
            if value:
                queryset = queryset.filter(**{f"{key}__icontains": value})

        return self.sort_queryset(queryset, sort_by, sort_order)

def select_complaint_type(request):
    if request.method == 'POST':
        complaint_type = request.POST.get('complaint_type')
        if complaint_type == 'internal':
            return redirect('create_internal_complaint')
        elif complaint_type == 'external':
            return redirect('create_external_complaint')
    return render(request, 'select_complaint_type.html')

def create_internal_complaint(request):
    if request.method == 'POST':
        form = InternalComplaintForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')  
    else:
        form = InternalComplaintForm()
    return render(request, 'complaint_form.html', {'form': form, 'type': 'Interná'})

@api_view(['POST'])
def create_external_complaint(request):
    logger.debug('Attempting to create external complaint...')
    if request.method == 'POST':
        form = ExternalComplaintForm(request.POST)
        if form.is_valid():
            complaint_instance = form.save()
            costs_data = request.POST.getlist('costs')
            for cost_data in costs_data:
                cost_form = ComplainCostForm({'complaint': complaint_instance.id, 'cost': cost_data, 'type': 'our_costs'})
                if cost_form.is_valid():
                    cost_form.save()
                else:
                    messages.error(request, f"Invalid cost value: {cost_data}")
                    return render(request, 'complaint_form.html', {'form': form, 'type': 'External'})
            messages.success(request, 'External complaint created successfully.')
            return redirect('external_complaints_view')
        else:
            messages.error(request, 'Form contains errors.')
    else:
        form = ExternalComplaintForm()
    return render(request, 'complaint_form.html', {'form': form, 'type': 'External'})

@api_view(['GET'])
def get_complaint(request, complaint_number):
    logger.debug(f'Fetching complaint with number: {complaint_number}')
    try:
        internal_complaint = InternalComplaint.objects.get(complaint_number=complaint_number)
        logger.debug('Internal complaint found')
        serializer = InternalComplaintSerializer(internal_complaint)
    except InternalComplaint.DoesNotExist:
        logger.debug('Internal complaint not found, checking external complaints')
        try:
            external_complaint = ExternalComplaint.objects.get(complaint_number=complaint_number)
            logger.debug('External complaint found')
            serializer = ExternalComplaintSerializer(external_complaint)
        except ExternalComplaint.DoesNotExist:
            logger.error(f'Complaint with number {complaint_number} not found')
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
    logger.debug('Returning serialized data')
    return Response(serializer.data)

@api_view(['PUT'])
def update_complaint(request, complaint_number):
    logger.debug(f'Updating complaint with number: {complaint_number}')
    
    data = request.data.copy()
    data = translate_keys(data, RESPONSIBLE_MAP)
    data = translate_keys(data, CREATED_BY_MAP)
    
    try:
        complaint = InternalComplaint.objects.get(complaint_number=complaint_number)
        serializer = InternalComplaintSerializer(complaint, data=data)
    except InternalComplaint.DoesNotExist:
        try:
            complaint = ExternalComplaint.objects.get(complaint_number=complaint_number)
            serializer = ExternalComplaintSerializer(complaint, data=data)
        except ExternalComplaint.DoesNotExist:
            logger.error(f'Complaint with number {complaint_number} not found')
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if serializer.is_valid():
        serializer.save()
        logger.debug('Complaint updated successfully')
        return Response(serializer.data)
    
    logger.error(f'Invalid data for complaint: {serializer.errors}')
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def internal_complaints_view(request):
    sort_by = request.GET.get('sort_by', 'date')
    sort_order = request.GET.get('sort_order', 'desc')

    complaints = InternalComplaint.objects.all()
    if sort_order == 'desc':
        complaints = complaints.order_by(f'-{sort_by}')
    else:
        complaints = complaints.order_by(sort_by)
    
    context = {
        'complaints': complaints,
        'sort_by': sort_by,
        'sort_order': sort_order,
    }
    
    return render(request, 'complaints/internal_complaints.html', context)

def external_complaints_view(request):
    sort_by = request.GET.get('sort_by', 'date')
    sort_order = request.GET.get('sort_order', 'desc')

    complaints = ExternalComplaint.objects.all()
    if sort_order == 'desc':
        complaints = complaints.order_by(f'-{sort_by}')
    else:
        complaints = complaints.order_by(sort_by)

    context = {
        'complaints': complaints,
        'sort_by': sort_by,
        'sort_order': sort_order,
    }

    return render(request, 'complaints/external_complaints.html', context)

@api_view(['PUT'])
def highlight_complaint(request, complaint_number):
    try:
        complaint = ExternalComplaint.objects.get(complaint_number=complaint_number)
    except ExternalComplaint.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if 'invoices_our_costs_highlighted' in request.data:
        complaint.invoices_our_costs_highlighted = request.data['invoices_our_costs_highlighted']
    
    if 'invoices_without_costs_highlighted' in request.data:
        complaint.invoices_without_costs_highlighted = request.data['invoices_without_costs_highlighted']
    
    if 'highlighted' in request.data:
        complaint.highlighted = request.data['highlighted']
    
    complaint.save()
    serializer = ExternalComplaintSerializer(complaint)
    return Response(serializer.data)

@api_view(['PUT'])
def upload_invoice(request, pk):
    try:
        cost = ComplainCost.objects.get(pk=pk)
    except ComplainCost.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if 'invoice' in request.FILES:
        cost.invoice = request.FILES['invoice']
        cost.save()
        return Response({'invoice': cost.invoice.url}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PUT'])
def remove_invoice(request, pk):
    try:
        cost = ComplainCost.objects.get(pk=pk)
        cost.invoice.delete(save=False)  # Delete the file from storage
        cost.invoice = None
        cost.save()
        return Response({'message': 'Invoice removed successfully.'}, status=status.HTTP_200_OK)
    except ComplainCost.DoesNotExist:
        return HttpResponseNotFound()

@api_view(['GET'])
def get_all_models(request):
    models = ExternalComplaint.objects.values_list('model_sk', flat=True).distinct()
    models_de = ExternalComplaint.objects.values_list('model_de', flat=True).distinct()
    internal_models = InternalComplaint.objects.values_list('model', flat=True).distinct()

    all_models = set(models) | set(models_de) | set(internal_models)
    return Response(list(all_models))

@api_view(['GET'])
def get_model_complaints_count(request, model):
    external_count = ExternalComplaint.objects.filter(Q(model_sk=model) | Q(model_de=model)).count()
    internal_count = InternalComplaint.objects.filter(model=model).count()
    total_count = external_count + internal_count
    return Response({'model': model, 'count': total_count})

@api_view(['GET'])
def get_model_complaints_reasons(request, model):
    external_complaints = ExternalComplaint.objects.filter(Q(model_sk=model) | Q(model_de=model)).values('reason').annotate(count=Count('reason'))
    internal_complaints = InternalComplaint.objects.filter(model=model).values('reason').annotate(count=Count('reason'))
    
    reasons = {}
    for complaint in external_complaints:
        reason = complaint['reason']
        count = complaint['count']
        if reason in reasons:
            reasons[reason] += count
        else:
            reasons[reason] = count

    for complaint in internal_complaints:
        reason = complaint['reason']
        count = complaint['count']
        if reason in reasons:
            reasons[reason] += count
        else:
            reasons[reason] = count

    reasons_list = [{'reason': reason, 'count': count} for reason, count in reasons.items()]
    return Response(reasons_list)

def parse_costs(cost_str):
    if cost_str:
        costs = re.split(r'\s+', cost_str)
        parsed_costs = []
        for cost in costs:
            cost = cost.replace(',', '.').strip()
            try:
                parsed_cost = decimal.Decimal(cost).quantize(decimal.Decimal('0.01'))
                parsed_costs.append(parsed_cost)
            except decimal.InvalidOperation as e:
                logger.error(f"Error converting cost '{cost}' to decimal: {e}")
        return parsed_costs
    return []

def parse_costs(cost_str):
    if cost_str:
        costs = re.split(r'\s+', cost_str)
        parsed_costs = []
        for cost in costs:
            cost = cost.replace(',', '.').strip()
            try:
                parsed_cost = decimal.Decimal(cost).quantize(decimal.Decimal('0.01'))
                parsed_costs.append(parsed_cost)
            except decimal.InvalidOperation as e:
                logger.error(f"Error converting cost '{cost}' to decimal: {e}")
        return parsed_costs
    return []

class ExternalComplaintRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExternalComplaint.objects.all()
    serializer_class = ExternalComplaintSerializer
    lookup_field = 'complaint_number'  # Použitie complaint_number namiesto pk

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.costs.all().delete()  # Vymažeme priradené náklady
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class InternalComplaintRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = InternalComplaint.objects.all()
    serializer_class = InternalComplaintSerializer
    lookup_field = 'complaint_number'  # Použitie complaint_number namiesto pk

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@csrf_exempt
def upload_file(request):
    if request.method == 'POST':
        internal_file = request.FILES.get('internal_file')
        external_file = request.FILES.get('external_file')

        try:
            # Process the internal PDF file
            if internal_file:
                internal_data = []
                with pdfplumber.open(internal_file) as pdf:
                    for page_num, page in enumerate(pdf.pages):
                        tables = page.extract_tables()
                        for table_num, table in enumerate(tables):
                            if table:
                                internal_data.extend(table)
                                print(f"Page {page_num + 1} Table {table_num + 1} data: {table}")

                # Convert internal data to DataFrame
                if internal_data:
                    internal_df = pd.DataFrame(internal_data[1:], columns=internal_data[0])
                else:
                    return JsonResponse({'error': 'No internal data found'}, status=400)

                # Convert dates to proper format
                internal_df['Dátum'] = pd.to_datetime(internal_df['Dátum'], errors='coerce', format='%m/%d/%y').dt.strftime('%Y-%m-%d')

                # Debugging: Print internal DataFrame heads to ensure all columns are included
                print("Internal DataFrame head:")
                print(internal_df.head())

                # Mapping internal complaints columns
                internal_columns_map = {
                    'Číslo reklamácie': 'complaint_number',
                    'Model': 'model',
                    'Dátum': 'date',
                    'Číslo súčiastky': 'part_number',
                    'Číslo výrobku': 'product_number',
                    'Priorita': 'priority',
                    'Dôvod': 'reason',
                    'Aktivity PASS SK': 'activities_pass_sk',
                    'Zodpovedný': 'responsible',
                    'Vytvoril': 'created_by',
                    'Počet kusov': 'quantity',
                    'Stav reklamácie': 'complaint_status',
                    'Poznámka': 'note'
                }

                # Import internal complaints
                for index, row in internal_df.iterrows():
                    data = {}
                    for pdf_col, model_field in internal_columns_map.items():
                        data[model_field] = row.get(pdf_col, None)
                    if data['complaint_number'] and data['model'] and data['date'] and data['part_number']:
                        if pd.isna(data['date']):
                            data['date'] = None
                        InternalComplaint.objects.create(**data)
                    else:
                        print(f"Skipped internal complaint at row {index} due to missing required fields")

            # Process the external PDF file
            if external_file:
                external_data = []
                with pdfplumber.open(external_file) as pdf:
                    for page_num, page in enumerate(pdf.pages):
                        tables = page.extract_tables()
                        for table_num, table in enumerate(tables):
                            if table:
                                external_data.extend(table)
                                print(f"Page {page_num + 1} Table {table_num + 1} data: {table}")

                # Convert external data to DataFrame
                if external_data:
                    external_df = pd.DataFrame(external_data[1:], columns=external_data[0])
                else:
                    return JsonResponse({'error': 'No external data found'}, status=400)

                # Convert dates to proper format
                external_df['Dátum'] = pd.to_datetime(external_df['Dátum'], errors='coerce', format='%m/%d/%y').dt.strftime('%Y-%m-%d')
                if 'Dátum odpovede' in external_df.columns:
                    external_df['Dátum odpovede'] = pd.to_datetime(external_df['Dátum odpovede'], errors='coerce', format='%m/%d/%y').dt.strftime('%Y-%m-%d')

                # Debugging: Print external DataFrame heads to ensure all columns are included
                print("External DataFrame head:")
                print(external_df.head())

                # Mapping external complaints columns
                external_columns_map = {
                    'Číslo reklamácie': 'complaint_number',
                    'Model SK': 'model_sk',
                    'Model DE': 'model_de',
                    'Zakazník': 'customer',
                    'PASS': 'pass_value',
                    'Dátum': 'date',
                    'Počet ks': 'quantity',
                    'Dôvod': 'reason',
                    'Aktivity': 'activities',
                    'poznámka': 'status',  # Map 'poznámka' to 'status'
                    'Dátum odpovede': 'response_date',
                    'pozn': 'extra_note',
                    'Overenie nápravných opatrení': 'correction_verification'
                }

                # Ensure 'Stav' is included in the DataFrame
                if 'Stav' not in external_df.columns:
                    external_df['Stav'] = None

                # Import external complaints
                for index, row in external_df.iterrows():
                    data = {}
                    for pdf_col, model_field in external_columns_map.items():
                        data[model_field] = row.get(pdf_col, None)
                    
                    # Set 'status' field correctly
                    data['status'] = row.get('Stav') or row.get('poznámka') or row.get('status')

                    # Convert cost fields to proper decimal format
                    cost_fields = ['Faktúry v €', 'Bez našich nákladov', 'Spolu']
                    costs = {'our_costs': [], 'without_costs': []}
                    total_costs = decimal.Decimal(0)

                    for cost_field in cost_fields:
                        if cost_field in row and pd.notna(row[cost_field]):
                            cost_values = str(row[cost_field]).replace(',', '.').split()
                            for value in cost_values:
                                value = value.replace(',', '.')
                                if value == '' or value == '“”' or value == '“' or value == '”':
                                    value = '0'
                                try:
                                    value = decimal.Decimal(value)
                                except decimal.InvalidOperation:
                                    value = decimal.Decimal(0)
                                if cost_field == 'Faktúry v €':
                                    costs['our_costs'].append(value)
                                elif cost_field == 'Bez našich nákladov':
                                    costs['without_costs'].append(value)
                                elif cost_field == 'Spolu':
                                    total_costs += value

                    # Check for required fields
                    missing_fields = [field for field in ['complaint_number', 'model_sk', 'date', 'status'] if not data.get(field)]
                    if not missing_fields:
                        if pd.isna(data['date']):
                            data['date'] = None
                        if 'response_date' in data and pd.isna(data['response_date']):
                            data['response_date'] = None
                        complaint = ExternalComplaint.objects.create(**data)
                        complaint.total = total_costs
                        complaint.save()

                        # Handle related costs
                        for cost in costs['our_costs']:
                            ComplainCost.objects.create(
                                complaint=complaint,
                                cost=cost,
                                type='our_costs'
                            )
                        for cost in costs['without_costs']:
                            ComplainCost.objects.create(
                                complaint=complaint,
                                cost=cost,
                                type='without_costs'
                            )

                    else:
                        print(f"Skipped external complaint at row {index} due to missing fields: {missing_fields}")

            return JsonResponse({'message': 'Files uploaded and data imported successfully'})
        except Exception as e:
            import traceback
            print("Exception details:", traceback.format_exc())
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request'}, status=400)