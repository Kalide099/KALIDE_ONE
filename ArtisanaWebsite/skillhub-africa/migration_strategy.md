# SkillHub Africa - Django Migration Strategy

## Migration Planning & Execution

### Phase 1: Core User Management

#### 0001_initial.py
```python
# Generated migration for core user models
from django.db import migrations, models
import django.contrib.auth.models
import django.contrib.auth.validators
import django.core.validators
import django.utils.timezone
import uuid

class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # Extend Django's User model
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('username', models.CharField(max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()])),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('first_name', models.CharField(max_length=150, blank=True)),
                ('last_name', models.CharField(max_length=150, blank=True)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('user_type', models.CharField(max_length=20, choices=[('client', 'Client'), ('worker', 'Worker'), ('admin', 'Admin')])),
                ('phone', models.CharField(max_length=20, blank=True)),
                ('profile_image', models.URLField(blank=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('verification_date', models.DateTimeField(blank=True, null=True)),
                ('country', models.CharField(max_length=100, blank=True)),
                ('city', models.CharField(max_length=100, blank=True)),
                ('timezone', models.CharField(max_length=50, default='UTC')),
                ('language', models.CharField(max_length=10, default='en')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'users_user',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        # Client Profiles
        migrations.CreateModel(
            name='ClientProfile',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('company_name', models.CharField(max_length=255, blank=True)),
                ('company_size', models.CharField(max_length=50, blank=True)),
                ('industry', models.CharField(max_length=100, blank=True)),
                ('website', models.URLField(blank=True)),
                ('description', models.TextField(blank=True)),
                ('total_projects_posted', models.IntegerField(default=0)),
                ('total_spent', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('preferred_payment_method', models.CharField(max_length=50, blank=True)),
                ('billing_address', models.JSONField(blank=True, null=True)),
                ('tax_id', models.CharField(max_length=100, blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'users_clientprofile',
            },
        ),
        # Worker Profiles
        migrations.CreateModel(
            name='WorkerProfile',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('bio', models.TextField(blank=True)),
                ('experience_years', models.IntegerField(default=0)),
                ('hourly_rate', models.DecimalField(decimal_places=2, max_digits=8, blank=True, null=True)),
                ('daily_rate', models.DecimalField(decimal_places=2, max_digits=8, blank=True, null=True)),
                ('availability_status', models.CharField(default='available', max_length=20, choices=[('available', 'Available'), ('busy', 'Busy'), ('offline', 'Offline')])),
                ('rating', models.DecimalField(decimal_places=2, default=0, max_digits=3, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(5)])),
                ('total_reviews', models.IntegerField(default=0)),
                ('total_earnings', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('total_projects_completed', models.IntegerField(default=0)),
                ('completion_rate', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('response_time_hours', models.IntegerField(blank=True, null=True)),
                ('languages', models.JSONField(default=list, blank=True)),
                ('portfolio_url', models.URLField(blank=True)),
                ('linkedin_url', models.URLField(blank=True)),
                ('github_url', models.URLField(blank=True)),
                ('is_available_for_teams', models.BooleanField(default=True)),
                ('preferred_work_types', models.JSONField(default=list, blank=True)),
                ('location_lat', models.DecimalField(decimal_places=8, max_digits=10, blank=True, null=True)),
                ('location_lng', models.DecimalField(decimal_places=8, max_digits=11, blank=True, null=True)),
                ('location_address', models.CharField(max_length=500, blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'users_workerprofile',
            },
        ),
    ]
```

#### 0002_skills_and_categories.py
```python
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        # Categories
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('description', models.TextField(blank=True)),
                ('icon', models.CharField(max_length=100, blank=True)),
                ('color', models.CharField(max_length=7, blank=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='services.category')),
                ('is_active', models.BooleanField(default=True)),
                ('display_order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_category',
            },
        ),
        # Skills
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.category')),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_skill',
            },
        ),
        # Worker Skills
        migrations.CreateModel(
            name='WorkerSkill',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('worker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.workerprofile')),
                ('skill', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.skill')),
                ('proficiency_level', models.CharField(default='intermediate', max_length=20, choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('expert', 'Expert')])),
                ('years_experience', models.IntegerField(default=0)),
                ('is_primary', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'users_workerskills',
                'unique_together': {('worker', 'skill')},
            },
        ),
    ]
```

### Phase 2: Services & Bundles

#### 0003_services_and_bundles.py
```python
from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):
    dependencies = [
        ('services', '0002_skills_and_categories'),
    ]

    operations = [
        # Services
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('worker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.workerprofile')),
                ('title', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=280, unique=True)),
                ('description', models.TextField()),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.category')),
                ('base_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('price_type', models.CharField(default='hourly', max_length=20, choices=[('hourly', 'Hourly'), ('daily', 'Daily'), ('fixed', 'Fixed'), ('quote', 'Quote')])),
                ('delivery_time_days', models.IntegerField()),
                ('revisions_included', models.IntegerField(default=0)),
                ('requirements', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('total_orders', models.IntegerField(default=0)),
                ('rating', models.DecimalField(decimal_places=2, default=0, max_digits=3, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(5)])),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_service',
            },
        ),
        # Service Images
        migrations.CreateModel(
            name='ServiceImage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.service')),
                ('image_url', models.URLField()),
                ('alt_text', models.CharField(max_length=255, blank=True)),
                ('display_order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_serviceimage',
            },
        ),
        # Service Packages
        migrations.CreateModel(
            name='ServicePackage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.service')),
                ('package_type', models.CharField(max_length=20, choices=[('basic', 'Basic'), ('standard', 'Standard'), ('premium', 'Premium')])),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('delivery_time_days', models.IntegerField()),
                ('revisions_included', models.IntegerField(default=0)),
                ('features', models.JSONField(default=list, blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_servicepackage',
            },
        ),
        # Bundles
        migrations.CreateModel(
            name='Bundle',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=280, unique=True)),
                ('description', models.TextField()),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.category')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('team_size', models.IntegerField()),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('estimated_duration_days', models.IntegerField()),
                ('complexity_level', models.CharField(default='medium', max_length=20, choices=[('simple', 'Simple'), ('medium', 'Medium'), ('complex', 'Complex')])),
                ('is_active', models.BooleanField(default=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('total_bookings', models.IntegerField(default=0)),
                ('rating', models.DecimalField(decimal_places=2, default=0, max_digits=3, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(5)])),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_bundle',
            },
        ),
        # Bundle Roles
        migrations.CreateModel(
            name='BundleRole',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('bundle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.bundle')),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('required_skills', models.JSONField(default=list, blank=True)),
                ('experience_level', models.CharField(default='intermediate', max_length=20, choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('expert', 'Expert')])),
                ('estimated_hours', models.IntegerField()),
                ('hourly_rate', models.DecimalField(decimal_places=2, max_digits=8)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_bundlerole',
            },
        ),
        # Bundle Members
        migrations.CreateModel(
            name='BundleMember',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('bundle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.bundle')),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.bundlerole')),
                ('worker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.workerprofile')),
                ('is_confirmed', models.BooleanField(default=False)),
                ('joined_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'services_bundlemember',
                'unique_together': {('bundle', 'role', 'worker')},
            },
        ),
    ]
```

### Phase 3: Projects & Bookings

#### 0004_projects_and_bookings.py
```python
from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):
    dependencies = [
        ('services', '0003_services_and_bundles'),
    ]

    operations = [
        # Projects
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=280, unique=True)),
                ('description', models.TextField()),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.clientprofile')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='services.category')),
                ('project_type', models.CharField(default='individual', max_length=20, choices=[('individual', 'Individual'), ('bundle', 'Bundle')])),
                ('status', models.CharField(default='draft', max_length=30, choices=[
                    ('draft', 'Draft'), ('posted', 'Posted'), ('in_progress', 'In Progress'),
                    ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('disputed', 'Disputed')
                ])),
                ('priority', models.CharField(default='medium', max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')])),
                ('budget_min', models.DecimalField(decimal_places=2, max_digits=10, blank=True, null=True)),
                ('budget_max', models.DecimalField(decimal_places=2, max_digits=10, blank=True, null=True)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('estimated_duration_days', models.IntegerField(blank=True, null=True)),
                ('deadline', models.DateField(blank=True, null=True)),
                ('requirements', models.TextField(blank=True)),
                ('attachments', models.JSONField(default=list, blank=True)),
                ('location_required', models.BooleanField(default=False)),
                ('remote_allowed', models.BooleanField(default=True)),
                ('skills_required', models.JSONField(default=list, blank=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('total_proposals', models.IntegerField(default=0)),
                ('total_views', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('posted_at', models.DateTimeField(blank=True, null=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'projects_project',
            },
        ),
        # Project Tasks
        migrations.CreateModel(
            name='ProjectTask',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('assigned_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.workerprofile')),
                ('status', models.CharField(default='pending', max_length=20, choices=[
                    ('pending', 'Pending'), ('in_progress', 'In Progress'),
                    ('completed', 'Completed'), ('cancelled', 'Cancelled')
                ])),
                ('priority', models.CharField(default='medium', max_length=10, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')])),
                ('estimated_hours', models.IntegerField(blank=True, null=True)),
                ('actual_hours', models.IntegerField(blank=True, null=True)),
                ('due_date', models.DateField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'projects_projecttask',
            },
        ),
        # Milestones
        migrations.CreateModel(
            name='Milestone',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('due_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(default='pending', max_length=20, choices=[
                    ('pending', 'Pending'), ('in_progress', 'In Progress'),
                    ('completed', 'Completed'), ('overdue', 'Overdue')
                ])),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('requires_approval', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'projects_milestone',
            },
        ),
        # Bookings
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('booking_type', models.CharField(max_length=20, choices=[('individual', 'Individual'), ('bundle', 'Bundle')])),
                ('worker', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.workerprofile')),
                ('bundle', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='services.bundle')),
                ('status', models.CharField(default='proposed', max_length=30, choices=[
                    ('proposed', 'Proposed'), ('accepted', 'Accepted'), ('active', 'Active'),
                    ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('disputed', 'Disputed')
                ])),
                ('proposed_rate', models.DecimalField(decimal_places=2, max_digits=8, blank=True, null=True)),
                ('agreed_rate', models.DecimalField(decimal_places=2, max_digits=8, blank=True, null=True)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('start_date', models.DateField(blank=True, null=True)),
                ('end_date', models.DateField(blank=True, null=True)),
                ('terms', models.TextField(blank=True)),
                ('special_requirements', models.TextField(blank=True)),
                ('proposed_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('accepted_at', models.DateTimeField(blank=True, null=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'bookings_booking',
            },
        ),
        # Booking Members
        migrations.CreateModel(
            name='BookingMember',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bookings.booking')),
                ('worker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.workerprofile')),
                ('role', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='services.bundlerole')),
                ('status', models.CharField(default='assigned', max_length=20, choices=[
                    ('assigned', 'Assigned'), ('active', 'Active'), ('completed', 'Completed')
                ])),
                ('assigned_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'bookings_bookingmember',
                'unique_together': {('booking', 'worker')},
            },
        ),
    ]
```

### Phase 4: Communication & Reviews

#### 0005_communication_and_reviews.py
```python
from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0004_projects_and_bookings'),
    ]

    operations = [
        # Conversations
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('participants', models.JSONField()),
                ('subject', models.CharField(max_length=255, blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('last_message_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'messaging_conversation',
            },
        ),
        # Messages
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='messaging.conversation')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('message_type', models.CharField(default='text', max_length=20, choices=[
                    ('text', 'Text'), ('image', 'Image'), ('file', 'File'), ('system', 'System')
                ])),
                ('content', models.TextField(blank=True)),
                ('file_url', models.URLField(blank=True)),
                ('file_name', models.CharField(max_length=255, blank=True)),
                ('file_size', models.IntegerField(blank=True, null=True)),
                ('is_read', models.BooleanField(default=False)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'messaging_message',
            },
        ),
        # Message Recipients
        migrations.CreateModel(
            name='MessageRecipient',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='messaging.message')),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('is_read', models.BooleanField(default=False)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'messaging_messagerecipient',
                'unique_together': {('message', 'recipient')},
            },
        ),
        # Reviews
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('reviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews_given', to='users.user')),
                ('reviewee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews_received', to='users.user')),
                ('booking', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='bookings.booking')),
                ('rating', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('title', models.CharField(max_length=255, blank=True)),
                ('comment', models.TextField(blank=True)),
                ('review_type', models.CharField(max_length=20, choices=[
                    ('client_to_worker', 'Client to Worker'), ('worker_to_client', 'Worker to Client')
                ])),
                ('is_public', models.BooleanField(default=True)),
                ('response', models.TextField(blank=True)),
                ('response_at', models.DateTimeField(blank=True, null=True)),
                ('helpful_votes', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'reviews_review',
            },
        ),
        # Review Categories
        migrations.CreateModel(
            name='ReviewCategory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reviews.review')),
                ('category', models.CharField(max_length=50)),
                ('rating', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'reviews_reviewcategory',
            },
        ),
    ]
```

### Phase 5: Payments & Wallets

#### 0006_payments_and_wallets.py
```python
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('reviews', '0005_communication_and_reviews'),
    ]

    operations = [
        # Wallets
        migrations.CreateModel(
            name='Wallet',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('balance', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'payments_wallet',
            },
        ),
        # Escrow Accounts
        migrations.CreateModel(
            name='EscrowAccount',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('project', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('held_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('released_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('status', models.CharField(default='active', max_length=20, choices=[
                    ('active', 'Active'), ('released', 'Released'), ('refunded', 'Refunded'), ('disputed', 'Disputed')
                ])),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'payments_escrowaccount',
            },
        ),
        # Payments
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('escrow', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='payments.escrowaccount')),
                ('milestone', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='projects.milestone')),
                ('payer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments_made', to='users.user')),
                ('payee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments_received', to='users.user')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('payment_type', models.CharField(max_length=30, choices=[
                    ('deposit', 'Deposit'), ('milestone_release', 'Milestone Release'),
                    ('final_release', 'Final Release'), ('refund', 'Refund'), ('commission', 'Commission')
                ])),
                ('payment_method', models.CharField(max_length=50, blank=True)),
                ('transaction_id', models.CharField(max_length=255, blank=True)),
                ('status', models.CharField(default='pending', max_length=20, choices=[
                    ('pending', 'Pending'), ('processing', 'Processing'), ('completed', 'Completed'),
                    ('failed', 'Failed'), ('cancelled', 'Cancelled'), ('refunded', 'Refunded')
                ])),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'payments_payment',
            },
        ),
        # Transactions
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('payment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='payments.payment')),
                ('wallet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='payments.wallet')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('balance_before', models.DecimalField(decimal_places=2, max_digits=12)),
                ('balance_after', models.DecimalField(decimal_places=2, max_digits=12)),
                ('transaction_type', models.CharField(max_length=20, choices=[('credit', 'Credit'), ('debit', 'Debit')])),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'payments_transaction',
            },
        ),
    ]
```

### Phase 6: Trust & Safety Features

#### 0007_trust_and_safety.py
```python
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('payments', '0006_payments_and_wallets'),
    ]

    operations = [
        # Notifications
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('notification_type', models.CharField(max_length=50)),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('data', models.JSONField(default=dict, blank=True)),
                ('is_read', models.BooleanField(default=False)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('priority', models.CharField(default='normal', max_length=10, choices=[
                    ('low', 'Low'), ('normal', 'Normal'), ('high', 'High'), ('urgent', 'Urgent')
                ])),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'notifications_notification',
            },
        ),
        # Notification Preferences
        migrations.CreateModel(
            name='NotificationPreference',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('email_notifications', models.BooleanField(default=True)),
                ('push_notifications', models.BooleanField(default=True)),
                ('sms_notifications', models.BooleanField(default=False)),
                ('project_updates', models.BooleanField(default=True)),
                ('message_notifications', models.BooleanField(default=True)),
                ('payment_notifications', models.BooleanField(default=True)),
                ('marketing_emails', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'notifications_notificationpreference',
            },
        ),
        # Disputes
        migrations.CreateModel(
            name='Dispute',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='projects.project')),
                ('initiator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='disputes_initiated', to='users.user')),
                ('respondent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='disputes_responded', to='users.user')),
                ('dispute_type', models.CharField(max_length=50)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('status', models.CharField(default='open', max_length=20, choices=[
                    ('open', 'Open'), ('investigating', 'Investigating'),
                    ('resolved', 'Resolved'), ('closed', 'Closed')
                ])),
                ('priority', models.CharField(default='medium', max_length=10, choices=[
                    ('low', 'Low'), ('medium', 'Medium'), ('high', 'High')
                ])),
                ('resolution', models.TextField(blank=True)),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('evidence_files', models.JSONField(default=list, blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'disputes_dispute',
            },
        ),
        # Dispute Messages
        migrations.CreateModel(
            name='DisputeMessage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('dispute', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='disputes.dispute')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('message', models.TextField()),
                ('message_type', models.CharField(default='message', max_length=20, choices=[
                    ('message', 'Message'), ('evidence', 'Evidence'), ('resolution', 'Resolution')
                ])),
                ('is_internal', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'disputes_disputemessage',
            },
        ),
    ]
```

### Phase 7: Security & Analytics

#### 0008_security_and_analytics.py
```python
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('disputes', '0007_trust_and_safety'),
    ]

    operations = [
        # Fraud Alerts
        migrations.CreateModel(
            name='FraudAlert',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('alert_type', models.CharField(max_length=50)),
                ('severity', models.CharField(default='medium', max_length=10, choices=[
                    ('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')
                ])),
                ('description', models.TextField()),
                ('risk_score', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('status', models.CharField(default='open', max_length=20, choices=[
                    ('open', 'Open'), ('investigating', 'Investigating'),
                    ('resolved', 'Resolved'), ('dismissed', 'Dismissed')
                ])),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('metadata', models.JSONField(default=dict, blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'fraud_fraudalert',
            },
        ),
        # Suspicious Activities
        migrations.CreateModel(
            name='SuspiciousActivity',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('activity_type', models.CharField(max_length=50)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('location_data', models.JSONField(blank=True, null=True)),
                ('risk_factors', models.JSONField(default=list, blank=True)),
                ('risk_score', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('blocked', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'fraud_suspiciousactivity',
            },
        ),
        # AI Recommendations
        migrations.CreateModel(
            name='Recommendation',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('recommendation_type', models.CharField(max_length=50)),
                ('target_type', models.CharField(max_length=50)),
                ('target_id', models.IntegerField()),
                ('score', models.DecimalField(decimal_places=4, max_digits=5)),
                ('reason', models.TextField(blank=True)),
                ('metadata', models.JSONField(default=dict, blank=True)),
                ('is_viewed', models.BooleanField(default=False)),
                ('viewed_at', models.DateTimeField(blank=True, null=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'recommendations_recommendation',
            },
        ),
        # Recommendation Feedback
        migrations.CreateModel(
            name='RecommendationFeedback',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('recommendation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='recommendations.recommendation')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('feedback', models.CharField(max_length=20, choices=[
                    ('helpful', 'Helpful'), ('not_helpful', 'Not Helpful'), ('irrelevant', 'Irrelevant')
                ])),
                ('comment', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'recommendations_recommendationfeedback',
            },
        ),
        # Audit Logs
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='users.user')),
                ('action', models.CharField(max_length=100)),
                ('resource_type', models.CharField(max_length=50)),
                ('resource_id', models.IntegerField(blank=True, null=True)),
                ('old_values', models.JSONField(blank=True, null=True)),
                ('new_values', models.JSONField(blank=True, null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('session_id', models.CharField(max_length=255, blank=True)),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'db_table': 'audit_auditlog',
            },
        ),
    ]
```

### Phase 8: Indexes & Constraints

#### 0009_indexes_and_constraints.py
```python
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('recommendations', '0008_security_and_analytics'),
    ]

    operations = [
        # Performance indexes
        migrations.RunSQL(
            """
            -- User indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_type ON users_user(user_type);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users_user(email);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_verified ON users_user(is_verified);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_country ON users_user(country);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users_user(created_at);

            -- Worker profile indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_profile_rating ON users_workerprofile(rating);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_profile_hourly_rate ON users_workerprofile(hourly_rate);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_profile_availability ON users_workerprofile(availability_status);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_profile_location ON users_workerprofile USING GIST (point(location_lng, location_lat));

            -- Skills indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_skills_worker ON users_workerskills(worker_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_skills_skill ON users_workerskills(skill_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_skills_proficiency ON users_workerskills(proficiency_level);

            -- Service indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category ON services_service(category_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_worker ON services_service(worker_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_price ON services_service(base_price);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_rating ON services_service(rating);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active ON services_service(is_active);

            -- Project indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_client ON projects_project(client_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_category ON projects_project(category_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status ON projects_project(status);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_budget ON projects_project(budget_min, budget_max);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_created ON projects_project(created_at);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_deadline ON projects_project(deadline);

            -- Booking indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_project ON bookings_booking(project_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_worker ON bookings_booking(worker_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_bundle ON bookings_booking(bundle_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings_booking(status);

            -- Message indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation ON messaging_message(conversation_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender ON messaging_message(sender_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created ON messaging_message(created_at);

            -- Review indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_project ON reviews_review(project_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewer ON reviews_review(reviewer_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewee ON reviews_review(reviewee_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews_review(rating);

            -- Payment indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_escrow ON payments_payment(escrow_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_payer ON payments_payment(payer_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_payee ON payments_payment(payee_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments_payment(status);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_created ON payments_payment(created_at);

            -- Notification indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user ON notifications_notification(user_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications_notification(is_read);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created ON notifications_notification(created_at);

            -- Audit log indexes
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_user ON audit_auditlog(user_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_resource ON audit_auditlog(resource_type, resource_id);
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_timestamp ON audit_auditlog(timestamp);
            """,
            reverse_sql=migrations.RunSQL.noop
        ),

        # Advanced composite indexes
        migrations.RunSQL(
            """
            -- Worker search composite index
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_worker_search ON users_workerprofile(rating DESC, hourly_rate ASC, experience_years DESC)
            WHERE availability_status = 'available';

            -- Project search composite index
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_budget_category ON projects_project(category_id, budget_min, budget_max)
            WHERE status = 'posted';

            -- Recent messages composite index
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_recent ON messaging_message(conversation_id, created_at DESC);

            -- Active bookings composite index
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_worker_active ON bookings_booking(worker_id, status)
            WHERE status IN ('active', 'accepted');

            -- Reviews by rating and date composite index
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating_date ON reviews_review(reviewee_id, rating DESC, created_at DESC)
            WHERE review_type = 'client_to_worker';
            """,
            reverse_sql=migrations.RunSQL.noop
        ),

        # Partial indexes for common filters
        migrations.RunSQL(
            """
            -- Active projects only
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_active ON projects_project(created_at DESC)
            WHERE status IN ('posted', 'in_progress');

            -- Verified workers only
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workers_verified ON users_workerprofile(rating DESC)
            WHERE EXISTS (SELECT 1 FROM users_user u WHERE u.id = user_id AND u.is_verified = true);

            -- Completed payments
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_completed ON payments_payment(processed_at DESC)
            WHERE status = 'completed';
            """,
            reverse_sql=migrations.RunSQL.noop
        ),
    ]
```

### Phase 9: Triggers & Functions

#### 0010_triggers_and_functions.py
```python
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('audit', '0009_indexes_and_constraints'),
    ]

    operations = [
        # Database triggers and functions
        migrations.RunSQL(
            """
            -- Update worker rating trigger function
            CREATE OR REPLACE FUNCTION update_worker_rating()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE users_workerprofile
                SET rating = (
                    SELECT AVG(rating)::DECIMAL(3,2)
                    FROM reviews_review
                    WHERE reviewee_id = NEW.reviewee_id
                    AND review_type = 'client_to_worker'
                ),
                total_reviews = (
                    SELECT COUNT(*)
                    FROM reviews_review
                    WHERE reviewee_id = NEW.reviewee_id
                    AND review_type = 'client_to_worker'
                )
                WHERE user_id = NEW.reviewee_id;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Update project statistics trigger function
            CREATE OR REPLACE FUNCTION update_project_stats()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE projects_project
                SET total_proposals = (
                    SELECT COUNT(*) FROM bookings_booking
                    WHERE project_id = NEW.project_id
                )
                WHERE id = NEW.project_id;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Apply triggers
            DROP TRIGGER IF EXISTS trigger_update_worker_rating ON reviews_review;
            CREATE TRIGGER trigger_update_worker_rating
                AFTER INSERT OR UPDATE ON reviews_review
                FOR EACH ROW
                WHEN (NEW.review_type = 'client_to_worker')
                EXECUTE FUNCTION update_worker_rating();

            DROP TRIGGER IF EXISTS trigger_update_project_stats ON bookings_booking;
            CREATE TRIGGER trigger_update_project_stats
                AFTER INSERT ON bookings_booking
                FOR EACH ROW
                EXECUTE FUNCTION update_project_stats();
            """,
            reverse_sql=migrations.RunSQL.noop
        ),

        # Views for common queries
        migrations.RunSQL(
            """
            -- Worker search view
            CREATE OR REPLACE VIEW worker_search_view AS
            SELECT
                wp.id,
                u.first_name,
                u.last_name,
                u.email,
                wp.bio,
                wp.hourly_rate,
                wp.rating,
                wp.total_reviews,
                wp.experience_years,
                wp.location_lat,
                wp.location_lng,
                wp.location_address,
                u.country,
                u.city,
                array_agg(DISTINCT s.name) as skills,
                array_agg(DISTINCT c.name) as categories
            FROM users_workerprofile wp
            JOIN users_user u ON wp.user_id = u.id
            LEFT JOIN users_workerskills ws ON wp.id = ws.worker_id
            LEFT JOIN services_skill s ON ws.skill_id = s.id
            LEFT JOIN services_category c ON s.category_id = c.id
            WHERE u.is_active = true AND wp.availability_status = 'available'
            GROUP BY wp.id, u.id;

            -- Project summary view
            CREATE OR REPLACE VIEW project_summary_view AS
            SELECT
                p.id,
                p.title,
                p.description,
                p.status,
                p.budget_min,
                p.budget_max,
                p.currency,
                p.created_at,
                u.first_name as client_name,
                u.email as client_email,
                c.name as category_name,
                p.total_proposals,
                p.total_views,
                COUNT(b.id) as active_bookings
            FROM projects_project p
            JOIN users_clientprofile cp ON p.client_id = cp.id
            JOIN users_user u ON cp.user_id = u.id
            LEFT JOIN services_category c ON p.category_id = c.id
            LEFT JOIN bookings_booking b ON p.id = b.project_id AND b.status = 'active'
            GROUP BY p.id, u.id, c.id;
            """,
            reverse_sql=migrations.RunSQL.noop
        ),
    ]
```

## Migration Execution Strategy

### Safe Production Deployment

#### 1. Pre-Migration Checklist
```bash
# Backup database
pg_dump skillhub_africa > skillhub_backup_$(date +%Y%m%d_%H%M%S).sql

# Check database size and growth
SELECT pg_size_pretty(pg_database_size('skillhub_africa'));

# Verify no long-running transactions
SELECT * FROM pg_stat_activity WHERE state != 'idle';

# Check for existing migrations
python manage.py showmigrations
```

#### 2. Staged Migration Deployment
```bash
# Phase 1: Core user management (low risk)
python manage.py migrate users 0001

# Phase 2: Skills and categories (low risk)
python manage.py migrate services 0002

# Phase 3: Services and bundles (medium risk)
python manage.py migrate services 0003

# Phase 4: Projects and bookings (high risk - transactional)
python manage.py migrate projects 0004

# Phase 5: Communication (medium risk)
python manage.py migrate messaging 0005

# Phase 6: Reviews (medium risk)
python manage.py migrate reviews 0005

# Phase 7: Payments (critical - rollback plan required)
python manage.py migrate payments 0006

# Phase 8: Trust & safety (medium risk)
python manage.py migrate notifications 0007
python manage.py migrate disputes 0007

# Phase 9: Security & analytics (low risk)
python manage.py migrate fraud 0008
python manage.py migrate recommendations 0008
python manage.py migrate audit 0008

# Phase 10: Performance optimization (low risk)
python manage.py migrate 0009 0010
```

#### 3. Rollback Strategy
```bash
# For each phase, prepare reverse migration
python manage.py migrate <app_name> <previous_migration>

# Complete rollback if needed
python manage.py migrate users zero
python manage.py migrate services zero
# ... rollback each app
```

#### 4. Post-Migration Validation
```sql
-- Validate data integrity
SELECT COUNT(*) FROM users_user;
SELECT COUNT(*) FROM users_workerprofile;
SELECT COUNT(*) FROM projects_project;

-- Check for orphaned records
SELECT COUNT(*) FROM users_workerskills ws
LEFT JOIN users_workerprofile wp ON ws.worker_id = wp.id
WHERE wp.id IS NULL;

-- Validate constraints
SELECT * FROM information_schema.table_constraints
WHERE table_schema = 'public';
```

#### 5. Performance Monitoring
```sql
-- Monitor query performance after migration
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

This migration strategy ensures safe, incremental deployment of the complete SkillHub Africa database schema with proper rollback capabilities and comprehensive validation.