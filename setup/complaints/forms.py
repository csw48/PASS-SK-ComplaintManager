from django import forms
from .models import InternalComplaint, ExternalComplaint, ComplainCost

class InternalComplaintForm(forms.ModelForm):
    class Meta:
        model = InternalComplaint
        fields = '__all__'

class ExternalComplaintForm(forms.ModelForm):
    date = forms.DateField(input_formats=['%Y-%m-%d'], widget=forms.DateInput(format='%Y-%m-%d'))
    response_date = forms.DateField(required=False, input_formats=['%Y-%m-%d'], widget=forms.DateInput(format='%Y-%m-%d'))

    class Meta:
        model = ExternalComplaint
        fields = '__all__'

class ExternalComplaintForm(forms.ModelForm):
    class Meta:
        model = ExternalComplaint
        fields = '__all__'

class ComplainCostForm(forms.ModelForm):
    class Meta:
        model = ComplainCost
        fields = ['complaint', 'cost', 'type']