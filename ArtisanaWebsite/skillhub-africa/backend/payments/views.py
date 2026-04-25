from rest_framework import generics
from .models import Payment, Wallet, Transaction, EscrowAccount, Quote, Invoice
from .serializers import PaymentSerializer, WalletSerializer, TransactionSerializer, EscrowAccountSerializer, QuoteSerializer, InvoiceSerializer


class PaymentListView(generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class WalletDetailView(generics.RetrieveAPIView):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer


class TransactionListView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        wallet_id = self.kwargs['wallet_id']
        return Transaction.objects.filter(wallet_id=wallet_id)


class EscrowAccountDetailView(generics.RetrieveUpdateAPIView):
    queryset = EscrowAccount.objects.all()
    serializer_class = EscrowAccountSerializer


class QuoteListView(generics.ListCreateAPIView):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer


class QuoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer


class InvoiceListView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
