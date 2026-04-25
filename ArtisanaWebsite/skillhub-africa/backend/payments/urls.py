from django.urls import path
from .views import (
    PaymentListView, WalletDetailView, TransactionListView, EscrowAccountDetailView,
    QuoteListView, QuoteDetailView, InvoiceListView, InvoiceDetailView
)

urlpatterns = [
    path('', PaymentListView.as_view(), name='payment-list'),
    path('wallets/<int:pk>/', WalletDetailView.as_view(), name='wallet-detail'),
    path('wallets/<int:wallet_id>/transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('escrow/<int:pk>/', EscrowAccountDetailView.as_view(), name='escrow-detail'),
    path('quotes/', QuoteListView.as_view(), name='quote-list'),
    path('quotes/<int:pk>/', QuoteDetailView.as_view(), name='quote-detail'),
    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
]
