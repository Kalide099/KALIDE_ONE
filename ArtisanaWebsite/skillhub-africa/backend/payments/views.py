from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Payment, Wallet, Transaction, EscrowAccount, Quote, Invoice
from .serializers import PaymentSerializer, WalletSerializer, TransactionSerializer, EscrowAccountSerializer, QuoteSerializer, InvoiceSerializer


class CreateCheckoutSessionView(APIView):
    """
    Mock Stripe Checkout Session endpoint.
    """
    def post(self, request):
        amount = request.data.get('amount')
        project_id = request.data.get('project_id')
        
        if not amount or not project_id:
            return Response({'error': 'Amount and project_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock URL
        checkout_url = f"/checkout/success?session_id=mock_session_123&project_id={project_id}"
        
        return Response({'url': checkout_url}, status=status.HTTP_200_OK)


class PayoutRequestView(APIView):
    """
    Mock endpoint for mobile money payout requests.
    """
    def post(self, request):
        amount = request.data.get('amount')
        phone = request.data.get('phoneNumber')
        provider = request.data.get('provider')
        
        if not amount or not phone:
            return Response({'error': 'Amount and phone number required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'success': True, 'message': 'Payout request queued successfully.'}, status=status.HTTP_200_OK)


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
