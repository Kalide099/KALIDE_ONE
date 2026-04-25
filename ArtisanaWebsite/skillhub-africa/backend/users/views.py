from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import models
from django.db.models import Sum
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from projects.models import Project
from projects.serializers import ProjectSerializer
from payments.models import Payment
from payments.serializers import PaymentSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [] # Disable authentication to allow login even with junk tokens in header

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email', '')
        password = serializer.validated_data.get('password', '')
        
        print(f"\n--- [LOGIN ATTEMPT] Email: {email} ---")
        
        user = User.objects.filter(email=email).first()
        
        if not user:
            print(f"[AUTH ERROR] No user found with email: {email}")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
        print(f"[AUTH DEBUG] User found: {user.email}, Is Active: {user.is_active}")
        
        if user.check_password(password):
            print(f"[AUTH SUCCESS] Password matched for {user.email}")
            if not user.is_active:
                print(f"[AUTH ERROR] Account suspended for {user.email}")
                return Response({'error': 'Account is suspended. Contact Admin.'}, status=status.HTTP_403_FORBIDDEN)
                
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            print(f"[AUTH ERROR] Password mismatch for {email}")
            
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminWarnUserView(generics.GenericAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        user = self.get_object()
        reason = request.data.get('reason', 'Violation of Kalide Global Terms and Conditions.')
        # Emulate sending a strict email or notification
        print(f"FRAUD WARNING SENT TO {user.email}: {reason}")
        return Response({'success': True, 'message': f"Strict warning protocol sent to {user.name}."})

class AdminToggleAccessView(generics.GenericAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        status_msg = "Reactivated" if user.is_active else "Suspended"
        return Response({'success': True, 'message': f"User {user.email} is now {status_msg}."})

class AdminSubscriptionUpgradeView(generics.GenericAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        user = self.get_object()
        plan = request.data.get('plan', 'pro')
        from payments.models import SubscriptionPlan, UserSubscription
        from django.utils import timezone
        
        plan_obj, _ = SubscriptionPlan.objects.get_or_create(tier=plan, defaults={'name': f"Kalide {plan.capitalize()}", 'price': 0})
        # Grant 30 days access
        UserSubscription.objects.update_or_create(
            user=user,
            defaults={
                'plan': plan_obj,
                'is_active': True,
                'expires_at': timezone.now() + timezone.timedelta(days=30)
            }
        )
        return Response({'success': True, 'message': f"Granted {plan.upper()} Elite access to {user.email}."})


class AdminProjectListView(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminPaymentListView(generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]


class AnalyticsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        total_users = User.objects.count()
        total_artisans = User.objects.filter(role='artisan').count()
        total_projects = Project.objects.count()
        total_revenue = Payment.objects.filter(status='released').aggregate(total=models.Sum('amount'))['total'] or 0

        return Response({
            'total_users': total_users,
            'total_artisans': total_artisans,
            'total_projects': total_projects,
            'total_revenue': total_revenue,
        })
