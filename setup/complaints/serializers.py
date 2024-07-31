
from rest_framework import serializers
from .models import InternalComplaint, ExternalComplaint , ComplainCost
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from auditlog.models import LogEntry

class InternalComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternalComplaint
        fields = '__all__'

class ComplainCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplainCost
        fields = ['id', 'cost', 'type', 'invoice']

class ExternalComplaintSerializer(serializers.ModelSerializer):
    costs = ComplainCostSerializer(many=True)

    class Meta:
        model = ExternalComplaint
        fields = '__all__'

    def create(self, validated_data):
        costs_data = validated_data.pop('costs')
        complaint = ExternalComplaint.objects.create(**validated_data)
        for cost_data in costs_data:
            ComplainCost.objects.create(complaint=complaint, **cost_data)
        return complaint

    def update(self, instance, validated_data):
        costs_data = validated_data.pop('costs', [])
        instance = super().update(instance, validated_data)

        existing_cost_ids = {cost.id for cost in instance.costs.all()}
        incoming_cost_ids = {cost.get('id') for cost in costs_data if cost.get('id')}

        for cost_data in costs_data:
            cost_id = cost_data.get('id')
            if cost_id in existing_cost_ids:
                ComplainCost.objects.filter(id=cost_id).update(**cost_data)
            else:
                new_cost = ComplainCost.objects.create(complaint=instance, **cost_data)
                incoming_cost_ids.add(new_cost.id)

        ComplainCost.objects.filter(complaint=instance).exclude(id__in=incoming_cost_ids).delete()

        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)

            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')
        else:
            raise serializers.ValidationError('Must include "username" and "password".', code='authorization')

        data['user'] = user
        return data
    
class LogEntrySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', default='Neznámy užívateľ')

    class Meta:
        model = LogEntry
        fields = '__all__'