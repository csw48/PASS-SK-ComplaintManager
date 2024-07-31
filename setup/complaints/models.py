from auditlog.registry import auditlog
from auditlog.models import AuditlogHistoryField
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone
from django.db import models
from datetime import date
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

class LogEntry(models.Model):
    ACTIONS = (
        (1, 'Create'),
        (2, 'Update'),
        (3, 'Delete'),
    )
    
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='complaint_log_entries')
    action = models.PositiveSmallIntegerField(choices=ACTIONS)
    changes = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='complaint_log_entries')
    object_pk = models.TextField()
    object_repr = models.TextField()

    @property
    def actor_name(self):
        return self.actor.username if self.actor else 'Neznámy užívateľ'

    def get_action_display(self):
        return dict(self.ACTIONS).get(self.action, 'Unknown')

class InternalComplaint(models.Model):
    model = models.CharField(max_length=255, verbose_name='Model', blank=True, null=True)
    date = models.DateField(verbose_name='Dátum', blank=True, null=True, default=date.today)
    complaint_number = models.CharField(max_length=255, verbose_name='Číslo reklamácie', unique=True)
    part_number = models.CharField(max_length=255, verbose_name='Číslo súčiastky', blank=True, null=True)
    product_number = models.CharField(max_length=255, verbose_name='Číslo výrobku', blank=True, null=True)
    PRIORITY_CHOICES = (
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
    )
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, verbose_name='Priorita', blank=True, null=True)
    reason = models.TextField(max_length=255, verbose_name='Dôvod', blank=True, null=True)
    activities_pass_sk = models.TextField(verbose_name='Aktivity PASS SK', blank=True, null=True, max_length=255)
    RESPONSIBLE_CHOICES = (
        ('Salih Yüksekol', 'Dodávateľske NEMECKO: Salih Yüksekol'),
        ('Giuseppe Verzi', 'NEMECKO Plasty: Giuseppe Verzi'),
        ('Giuseppe Verzi', 'NEMECKO Polyamidy: Giuseppe Verzi'),
        ('Giuseppe Verzi', 'NEMECKO Gumy: Giuseppe Verzi'),
        ('Marek Stach', 'POĽSKO Gumy Marek Stach, Łukasz Jachlewski.'),
        ('Grzegorz Wacławski', 'POĽSKO Kovové rúrky Grzegorz Wacławski, Paweł Fejdasz'),
        ('Sanja Ilič', 'BOSNA: Sanja Ilič'),
    )
    responsible = models.CharField(max_length=255, choices=RESPONSIBLE_CHOICES, verbose_name='Zodpovedný', blank=True, null=True)

    CREATED_BY_CHOICES = (
        ('Geletka', 'Geletka'),
        ('Staňa', 'Staňa'),
        ('Pamula', 'Pamula'),
        ('Spielmann', 'Spielmann'),
        ('Kaščáková', 'Kaščáková'),
        ('Augustin', 'Augustin'),
    )
    created_by = models.CharField(max_length=255, choices=CREATED_BY_CHOICES, verbose_name='Vytvoril', blank=True, null=True)
    quantity = models.CharField(max_length=255, verbose_name='Počet kusov', blank=True, null=True)
    complaint_status = models.CharField(max_length=255, verbose_name='Stav reklamácie', blank=True, null=True)
    note = models.TextField(verbose_name='Poznámka', max_length=255,  blank=True, null=True)
    modified_by = models.ForeignKey(User, related_name='modified_internal_complaints', on_delete=models.SET_NULL, null=True, blank=True)
    made_by = models.ForeignKey(User, related_name='made_internal_complaints', on_delete=models.SET_NULL, null=True, blank=True)

    history = AuditlogHistoryField()

    def is_internal(self):
        return True

    def __str__(self):
        return f"Reklamácia č. {self.complaint_number}"
    
    class Meta:
        ordering = ['-date']

auditlog.register(InternalComplaint)

class ExternalComplaint(models.Model):
    model_sk = models.CharField(max_length=255, verbose_name='Model SK', blank=True, null=True)
    model_de = models.CharField(max_length=255, verbose_name='Model DE', blank=True, null=True)
    customer = models.CharField(max_length=255, verbose_name='Zákazník', blank=True, null=True)
    pass_value = models.CharField(max_length=255, choices=[('1', '1'), ('2', '2'), ('3', '3')], verbose_name='PASS', blank=True, null=True)
    date = models.DateField(verbose_name='Dátum', blank=True, null=True, default=date.today)
    complaint_number = models.CharField(max_length=255, verbose_name='Číslo reklamácie', unique=True)
    quantity = models.CharField(max_length=255, verbose_name='Počet kusov', blank=True, null=True)
    reason = models.TextField(verbose_name='Dôvod', blank=True, null=True, max_length=255)
    activities = models.TextField(verbose_name='Aktivity', blank=True, null=True, max_length=255)
    STATUS_CHOICES = (
        ('Akceptovaná', 'Akceptovaná'),
        ('Neakceptovaná', 'Neakceptovaná'),
        ('V procese', 'V procese'),
        ('Stornovaná', 'Stornovaná'),
    )
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, verbose_name='Stav', blank=True, null=True)
    response_date = models.DateField(verbose_name='Dátum odpovede', blank=True, null=True)
    extra_note = models.TextField(verbose_name='Poznámka', blank=True, null=True, max_length=255)
    correction_verification = models.TextField(verbose_name='Overenie nápravných opatrení',max_length=255, blank=True, null=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Celkové náklady', blank=True, null=True)
    highlighted = models.BooleanField(default=False)
    modified_by = models.ForeignKey(User, related_name='modified_external_complaints', on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='created_external_complaints', on_delete=models.SET_NULL, null=True, blank=True)

    history = AuditlogHistoryField()
    
    def is_internal(self):
        return False

    def __str__(self):
        return f"Reklamácia č. {self.complaint_number}"
    
    class Meta:
        ordering = ['-date']

auditlog.register(ExternalComplaint)

class ComplaintFile(models.Model):
    internal_complaint = models.ForeignKey(InternalComplaint, related_name='files', on_delete=models.CASCADE, null=True, blank=True)
    external_complaint = models.ForeignKey(ExternalComplaint, related_name='files', on_delete=models.CASCADE, null=True, blank=True)
    file = models.FileField(upload_to='uploads/', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name

class ComplainCost(models.Model):
    COMPLAINT_COST_TYPES = (
        ('our_costs', 'Our Costs'),
        ('without_costs', 'Without Costs')
    )

    complaint = models.ForeignKey('ExternalComplaint', related_name='costs', on_delete=models.CASCADE)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=15, choices=COMPLAINT_COST_TYPES)
    invoice = models.FileField(upload_to='invoices/', null=True, blank=True)

    def __str__(self):
        return f"ComplainCost - Complaint: {self.complaint.complaint_number}, Cost: {self.cost}"

    