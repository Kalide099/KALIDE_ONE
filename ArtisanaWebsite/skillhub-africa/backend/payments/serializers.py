from rest_framework import serializers
from .models import Payment, Wallet, Transaction, EscrowAccount, Quote, Invoice


class PaymentSerializer(serializers.ModelSerializer):
    project = serializers.StringRelatedField()

    class Meta:
        model = Payment
        fields = '__all__'


class WalletSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Wallet
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    wallet = serializers.StringRelatedField()

    class Meta:
        model = Transaction
        fields = '__all__'


class EscrowAccountSerializer(serializers.ModelSerializer):
    project = serializers.StringRelatedField()

    class Meta:
        model = EscrowAccount
        fields = '__all__'


class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'
