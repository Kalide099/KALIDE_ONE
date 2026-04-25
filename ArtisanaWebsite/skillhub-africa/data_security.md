# SkillHub Africa - Data Security & Privacy

## Data Security Architecture

### Sensitive Data Classification

#### Level 1: Public Data
- Usernames, profile pictures
- Project titles and descriptions
- Service descriptions
- Public reviews and ratings
- Category and skill information

#### Level 2: Internal Data
- Email addresses (hashed for public searches)
- Phone numbers
- Project budgets and pricing
- Payment amounts (aggregated)
- User activity logs

#### Level 3: Confidential Data
- Full payment information
- Bank account details
- Social security/tax IDs
- Private messages
- Dispute details
- Fraud investigation data

#### Level 4: Restricted Data
- Encryption keys
- Admin access logs
- Security incident reports
- Raw audit logs

## Encryption Strategy

### Database-Level Encryption

#### 1. Field-Level Encryption for Sensitive Data
```sql
-- Create encryption extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted fields in key tables
ALTER TABLE users_user ADD COLUMN encrypted_ssn bytea;
ALTER TABLE payments_payment ADD COLUMN encrypted_card_data bytea;
ALTER TABLE disputes_dispute ADD COLUMN encrypted_evidence bytea;
```

#### 2. Encryption Functions
```sql
-- Encryption key management (store in secure key vault)
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data text, key_uuid uuid)
RETURNS bytea AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key_uuid::text);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data bytea, key_uuid uuid)
RETURNS text AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, key_uuid::text);
END;
$$ LANGUAGE plpgsql;
```

### Application-Level Encryption

#### 1. User Passwords
- Django's PBKDF2 with SHA256
- 260,000 iterations minimum
- Salt automatically generated

#### 2. API Data Encryption
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}

# Custom encryption middleware
class DataEncryptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Decrypt incoming sensitive data
        if hasattr(request, 'data') and 'encrypted_payload' in request.data:
            request.data = self.decrypt_payload(request.data['encrypted_payload'])

        response = self.get_response(request)

        # Encrypt outgoing sensitive data
        if hasattr(response, 'data'):
            response.data = self.encrypt_response_data(response.data)

        return response
```

#### 3. File Storage Encryption
```python
# AWS S3 encryption configuration
class EncryptedS3Storage(S3Boto3Storage):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.encryption_key = os.getenv('S3_ENCRYPTION_KEY')

    def _save(self, name, content):
        # Encrypt file content before upload
        encrypted_content = self.encrypt_content(content.read())
        content.seek(0)
        content.write(encrypted_content)
        return super()._save(name, content)

    def encrypt_content(self, content):
        # Use AES-256-GCM encryption
        key = base64.b64decode(self.encryption_key)
        cipher = AES.new(key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(content)
        return cipher.nonce + tag + ciphertext
```

## Secure Data Storage

### File Storage Security

#### 1. Document Storage
```python
# models.py - Secure file handling
class SecureDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='secure_documents/')
    file_hash = models.CharField(max_length=128)  # SHA-256 hash
    encryption_key = models.UUIDField(default=uuid.uuid4)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.file:
            # Calculate file hash
            self.file_hash = hashlib.sha256(self.file.read()).hexdigest()
            self.file.seek(0)

            # Encrypt file before saving
            encrypted_content = encrypt_file(self.file.read(), self.encryption_key)
            self.file.save(self.file.name, ContentFile(encrypted_content))

        super().save(*args, **kwargs)
```

#### 2. Image Storage
```python
# Image processing with security
from PIL import Image
import io

def process_secure_image(image_file):
    """Process uploaded images with security checks"""
    try:
        # Validate image format
        image = Image.open(image_file)
        image.verify()  # Check for corruption

        # Resize if too large
        max_size = (2048, 2048)
        image.thumbnail(max_size, Image.LANCZOS)

        # Convert to secure format
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85)
        output.seek(0)

        return output
    except Exception as e:
        raise ValidationError("Invalid image file")
```

### Database Security

#### 1. Row-Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE payments_payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes_dispute ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_fraudalert ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY payment_access_policy ON payments_payment
    FOR ALL USING (
        payer_id = current_user_id() OR
        payee_id = current_user_id() OR
        EXISTS (SELECT 1 FROM users_user WHERE id = current_user_id() AND is_staff = true)
    );

CREATE POLICY dispute_access_policy ON disputes_dispute
    FOR ALL USING (
        initiator_id = current_user_id() OR
        respondent_id = current_user_id() OR
        EXISTS (SELECT 1 FROM users_user WHERE id = current_user_id() AND is_staff = true)
    );
```

#### 2. Data Masking for Logs
```python
# Logging utility with data masking
class SecureLogger:
    SENSITIVE_FIELDS = ['password', 'ssn', 'card_number', 'bank_account']

    @staticmethod
    def mask_sensitive_data(data):
        if isinstance(data, dict):
            masked = {}
            for key, value in data.items():
                if any(field in key.lower() for field in SecureLogger.SENSITIVE_FIELDS):
                    masked[key] = '***MASKED***'
                else:
                    masked[key] = SecureLogger.mask_sensitive_data(value)
            return masked
        elif isinstance(data, list):
            return [SecureLogger.mask_sensitive_data(item) for item in data]
        else:
            return data

    @classmethod
    def log_api_request(cls, request, response_data=None):
        safe_data = cls.mask_sensitive_data(request.data)
        logger.info(f"API Request: {request.method} {request.path}", extra={
            'user_id': getattr(request.user, 'id', None),
            'ip_address': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT'),
            'request_data': safe_data,
            'response_status': getattr(response, 'status_code', None)
        })
```

## Audit Logging System

### Comprehensive Audit Trail

#### 1. Audit Log Table Structure
```sql
-- Enhanced audit logging
CREATE TABLE audit_auditlog (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id),
    session_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,  -- Geolocation data
    risk_score DECIMAL(3,2),  -- Calculated risk score
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(128)  -- Data integrity hash
);
```

#### 2. Audit Triggers
```sql
-- Automatic audit logging trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB;
    new_row JSONB;
    changes JSONB;
BEGIN
    -- Get old and new row data
    old_row := to_jsonb(OLD);
    new_row := to_jsonb(NEW);

    -- Calculate changes
    changes := jsonb_object_agg(key, jsonb_build_array(old_row->key, new_row->key))
    FROM jsonb_object_keys(new_row) AS key
    WHERE old_row->key IS DISTINCT FROM new_row->key;

    -- Insert audit record
    INSERT INTO audit_auditlog (
        user_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        current_user_id(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN old_row ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN new_row ELSE NULL END,
        inet_client_addr(),
        current_user_agent()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users_user
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON payments_payment
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

#### 3. Audit Log Analysis
```python
# Audit log analysis utilities
class AuditAnalyzer:
    @staticmethod
    def detect_suspicious_activity(user_id, hours=24):
        """Detect potentially suspicious user activity"""
        cutoff_time = timezone.now() - timedelta(hours=hours)

        suspicious_patterns = AuditLog.objects.filter(
            user_id=user_id,
            timestamp__gte=cutoff_time
        ).aggregate(
            login_attempts=Count('id', filter=Q(action='LOGIN_ATTEMPT')),
            failed_payments=Count('id', filter=Q(action='PAYMENT_FAILED')),
            password_changes=Count('id', filter=Q(action='PASSWORD_CHANGE')),
            location_changes=Count('id', filter=Q(action='LOCATION_UPDATE'))
        )

        # Calculate risk score
        risk_score = (
            suspicious_patterns['login_attempts'] * 0.1 +
            suspicious_patterns['failed_payments'] * 0.3 +
            suspicious_patterns['password_changes'] * 0.4 +
            suspicious_patterns['location_changes'] * 0.2
        )

        return risk_score

    @staticmethod
    def get_data_access_log(resource_type, resource_id, days=30):
        """Get access log for specific resource"""
        cutoff_date = timezone.now() - timedelta(days=days)

        return AuditLog.objects.filter(
            resource_type=resource_type,
            resource_id=resource_id,
            timestamp__gte=cutoff_date
        ).select_related('user').order_by('-timestamp')
```

## Access Control & Authentication

### Role-Based Access Control (RBAC)

#### 1. Permission System
```python
# permissions.py
from rest_framework.permissions import BasePermission

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user

class ProjectPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Clients can view their own projects
        if request.user.user_type == 'client' and obj.client.user == request.user:
            return True

        # Workers can view projects they've booked
        if request.user.user_type == 'worker':
            return Booking.objects.filter(
                project=obj,
                worker__user=request.user,
                status__in=['accepted', 'active', 'completed']
            ).exists()

        # Admins can view all
        return request.user.is_staff
```

#### 2. API Rate Limiting
```python
# throttling.py
from rest_framework.throttling import UserRateThrottle

class BurstRateThrottle(UserRateThrottle):
    scope = 'burst'
    rate = '60/minute'

class SustainedRateThrottle(UserRateThrottle):
    scope = 'sustained'
    rate = '1000/hour'

# For sensitive operations
class SensitiveOperationThrottle(UserRateThrottle):
    scope = 'sensitive'
    rate = '10/hour'
```

### Multi-Factor Authentication (MFA)

#### 1. MFA Implementation
```python
# mfa.py
import pyotp
from django.core.cache import cache

class MFAHandler:
    @staticmethod
    def generate_secret(user):
        """Generate TOTP secret for user"""
        secret = pyotp.random_base32()
        cache.set(f"mfa_secret_{user.id}", secret, timeout=300)  # 5 minutes
        return secret

    @staticmethod
    def verify_code(user, code):
        """Verify MFA code"""
        secret = cache.get(f"mfa_secret_{user.id}")
        if not secret:
            return False

        totp = pyotp.TOTP(secret)
        return totp.verify(code)

    @staticmethod
    def enable_mfa(user, code):
        """Enable MFA for user after verification"""
        if MFAHandler.verify_code(user, code):
            user.mfa_enabled = True
            user.mfa_secret = cache.get(f"mfa_secret_{user.id}")
            user.save()
            cache.delete(f"mfa_secret_{user.id}")
            return True
        return False
```

## Data Privacy Compliance

### GDPR Compliance

#### 1. Data Subject Rights
```python
# privacy.py
class DataPrivacyManager:
    @staticmethod
    def export_user_data(user):
        """Export all user data for GDPR Article 15"""
        data = {
            'profile': UserProfileSerializer(user).data,
            'projects': ProjectSerializer(user.projects.all(), many=True).data,
            'bookings': BookingSerializer(user.bookings.all(), many=True).data,
            'reviews': ReviewSerializer(user.reviews.all(), many=True).data,
            'payments': PaymentSerializer(user.payments.all(), many=True).data,
        }
        return json.dumps(data, indent=2)

    @staticmethod
    def delete_user_data(user):
        """Anonymize/delete user data for GDPR Article 17"""
        # Soft delete - anonymize data
        user.email = f"deleted_{user.id}@anonymous.local"
        user.first_name = "Deleted"
        user.last_name = "User"
        user.is_active = False
        user.save()

        # Anonymize related data
        user.profile.bio = ""
        user.profile.phone = ""
        user.profile.save()

        # Log deletion for audit
        AuditLog.objects.create(
            user_id=user.id,
            action='DATA_DELETION',
            resource_type='user',
            resource_id=user.id,
            old_values={'deleted': False},
            new_values={'deleted': True}
        )
```

#### 2. Consent Management
```python
# models.py
class UserConsent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    consent_type = models.CharField(max_length=50)  # 'marketing', 'analytics', etc.
    granted = models.BooleanField(default=False)
    granted_at = models.DateTimeField(null=True)
    revoked_at = models.DateTimeField(null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()

    class Meta:
        unique_together = ['user', 'consent_type']
```

## Security Monitoring & Incident Response

### Real-time Security Monitoring

#### 1. Suspicious Activity Detection
```python
# security_monitor.py
class SecurityMonitor:
    @staticmethod
    def check_login_anomaly(user, ip_address, user_agent):
        """Check for suspicious login patterns"""
        recent_logins = AuditLog.objects.filter(
            user=user,
            action='LOGIN_SUCCESS',
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).values('ip_address', 'user_agent')

        # Check for new IP
        known_ips = {login['ip_address'] for login in recent_logins}
        if ip_address not in known_ips:
            FraudAlert.objects.create(
                user=user,
                alert_type='NEW_LOGIN_LOCATION',
                severity='medium',
                description=f"Login from new IP: {ip_address}"
            )

        # Check for rapid login attempts
        recent_attempts = AuditLog.objects.filter(
            user=user,
            action__in=['LOGIN_ATTEMPT', 'LOGIN_SUCCESS', 'LOGIN_FAILED'],
            timestamp__gte=timezone.now() - timedelta(minutes=30)
        ).count()

        if recent_attempts > 10:
            FraudAlert.objects.create(
                user=user,
                alert_type='RAPID_LOGIN_ATTEMPTS',
                severity='high',
                description=f"{recent_attempts} login attempts in 30 minutes"
            )

    @staticmethod
    def monitor_payment_anomaly(payment):
        """Monitor for suspicious payment patterns"""
        # Check payment amount vs user history
        avg_payment = Payment.objects.filter(
            payer=payment.payer
        ).aggregate(avg=Avg('amount'))['avg'] or 0

        if payment.amount > avg_payment * 3:  # 3x average
            FraudAlert.objects.create(
                user=payment.payer,
                alert_type='UNUSUAL_PAYMENT_AMOUNT',
                severity='medium',
                description=f"Payment amount ${payment.amount} is unusually high"
            )
```

#### 2. Automated Incident Response
```python
# incident_response.py
class IncidentResponder:
    @staticmethod
    def handle_fraud_alert(alert):
        """Automated response to fraud alerts"""
        if alert.severity == 'critical':
            # Immediate account suspension
            alert.user.is_active = False
            alert.user.save()

            # Notify security team
            send_security_alert(alert)

        elif alert.severity == 'high':
            # Require additional verification
            alert.user.require_mfa = True
            alert.user.save()

            # Send verification email
            send_verification_email(alert.user)

        # Log incident response
        AuditLog.objects.create(
            user_id=alert.user.id,
            action='INCIDENT_RESPONSE',
            resource_type='fraud_alert',
            resource_id=alert.id,
            new_values={'response': f"Auto-response for {alert.severity} alert"}
        )
```

This comprehensive security architecture ensures that SkillHub Africa maintains the highest standards of data protection, privacy compliance, and security monitoring throughout the platform.