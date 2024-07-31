from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from complaints import views
from rest_framework.authtoken import views as drf_views
from complaints.views import update_complaint, get_complaint, ExternalComplaintList, InternalComplaintList, select_complaint_type, create_external_complaint, create_internal_complaint, highlight_complaint, internal_complaints_view, external_complaints_view, home, ExternalComplaintViewSet, ComplainCostViewSet, upload_invoice, get_all_models, get_model_complaints_count, get_model_complaints_reasons, upload_file, ExternalComplaintRetrieveUpdateDestroy, InternalComplaintRetrieveUpdateDestroy, UserCreateView, LoginView, UserListView,view_logs,LogEntryListView

router = DefaultRouter()
router.register(r'external-complaints', ExternalComplaintViewSet)
router.register(r'complain-costs', ComplainCostViewSet)

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/external-complaints/', ExternalComplaintList.as_view(), name='external_complaints'),
    path('api/internal-complaints/', InternalComplaintList.as_view(), name='internal_complaints'),
    path('complaint/new/', select_complaint_type, name='select_complaint_type'),
    path('complaint/new/external/', create_external_complaint, name='create_external_complaint'),
    path('complaint/new/internal/', create_internal_complaint, name='create_internal_complaint'),
    path('api/highlight-complaint/<str:complaint_number>/', highlight_complaint, name='highlight_complaint'),
    path('api/get-complaint/<str:complaint_number>/', views.get_complaint, name='get_complaint'),
    path('api/update-complaint/<str:complaint_number>/', views.update_complaint, name='update_complaint'),
    path('complaints/internal/', internal_complaints_view, name='internal_complaints_view'),
    path('complaints/external/', external_complaints_view, name='external_complaints_view'),
    path('api/complain-costs/<int:pk>/upload/', upload_invoice, name='upload-invoice'),
    path('api/complain-costs/<int:pk>/remove-invoice/', views.remove_invoice, name='remove-invoice'),
    path('api/statistics/all-models/', get_all_models, name='all_models'),
    path('api/statistics/model-complaints/<str:model>/', get_model_complaints_count, name='model_complaints_count'),
    path('api/statistics/model-complaints-reasons/<str:model>/', get_model_complaints_reasons, name='model_complaints_reasons'),
    path('upload/', upload_file, name='upload_file'),
    path('api/delete-complaint/<str:complaint_number>/', ExternalComplaintRetrieveUpdateDestroy.as_view(), name='delete-complaint'),
    path('api/delete-internal-complaint/<str:complaint_number>/', InternalComplaintRetrieveUpdateDestroy.as_view(), name='delete-internal-complaint'),
    path('api/register/', UserCreateView.as_view(), name='register'),
    path('api/token-auth/', drf_views.obtain_auth_token, name='token_auth'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/users/', UserListView.as_view(), name='users'),
    path('logs/', view_logs, name='view_logs'),
    path('api/logs/', LogEntryListView.as_view(), name='log-entry-list'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)