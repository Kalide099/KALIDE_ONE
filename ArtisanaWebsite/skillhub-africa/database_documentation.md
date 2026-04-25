# SkillHub Africa - Complete Database Architecture Documentation

## Overview

SkillHub Africa is a global marketplace platform connecting skilled African workers with clients worldwide. This document provides comprehensive documentation for the complete database architecture that supports all platform features.

## Architecture Summary

### Technology Stack
- **Database**: PostgreSQL 15+
- **ORM**: Django 4.2+ with Django REST Framework
- **Caching**: Redis 7+
- **Search**: Elasticsearch 8+ (optional enhancement)
- **File Storage**: AWS S3 with encryption
- **Monitoring**: Custom audit logging and performance monitoring

### Database Design Principles
- **Normalized relational design** with strategic denormalization for performance
- **ACID compliance** for financial transactions
- **Row-level security** for data access control
- **Comprehensive indexing** for query optimization
- **Audit trails** for compliance and debugging
- **Scalable partitioning** strategy for large tables

## Core Entities & Relationships

### 1. User Management Domain

#### Users Table (`users_user`)
**Purpose**: Extended Django user model with platform-specific fields
**Key Fields**:
- `user_type`: 'client', 'worker', 'admin'
- `is_verified`: Boolean verification status
- `country`, `city`: Geographic information
- `phone`, `profile_image`: Contact information

**Relationships**:
- One-to-One: `ClientProfile`, `WorkerProfile`, `Wallet`, `NotificationPreference`
- One-to-Many: Projects (as client), Services (as worker), Reviews, Payments, Notifications

#### Client Profiles (`users_clientprofile`)
**Purpose**: Extended information for client accounts
**Key Fields**:
- `company_name`, `industry`: Business information
- `total_projects_posted`, `total_spent`: Activity metrics

#### Worker Profiles (`users_workerprofile`)
**Purpose**: Extended information for worker accounts
**Key Fields**:
- `hourly_rate`, `daily_rate`: Pricing information
- `rating`, `total_reviews`: Reputation metrics
- `experience_years`, `completion_rate`: Performance metrics
- `location_lat/lng`: Geographic coordinates for location-based matching

### 2. Skills & Services Domain

#### Categories (`services_category`)
**Purpose**: Hierarchical skill categorization
**Key Fields**:
- `name`, `slug`: Category identification
- `parent`: Self-referencing for hierarchy
- `display_order`: UI ordering

**Relationships**:
- One-to-Many: Skills, Services, Projects, Bundles
- Many-to-One: Parent categories

#### Skills (`services_skill`)
**Purpose**: Individual skills within categories
**Key Fields**:
- `name`, `slug`: Skill identification
- `category`: Parent category reference

**Relationships**:
- Many-to-Many: WorkerProfiles (via WorkerSkills)
- One-to-Many: BundleRoles

#### Services (`services_service`)
**Purpose**: Individual services offered by workers
**Key Fields**:
- `title`, `description`: Service details
- `base_price`, `price_type`: Pricing model
- `delivery_time_days`: Service timeline
- `rating`, `total_orders`: Performance metrics

**Relationships**:
- Many-to-One: WorkerProfile, Category
- One-to-Many: ServiceImages, ServicePackages

### 3. Bundle System Domain

#### Bundles (`services_bundle`)
**Purpose**: Pre-assembled teams for complex projects
**Key Fields**:
- `title`, `description`: Bundle details
- `team_size`, `total_price`: Team configuration
- `complexity_level`: Project complexity indicator

**Relationships**:
- Many-to-One: User (creator), Category
- One-to-Many: BundleRoles, BundleMembers

#### Bundle Roles (`services_bundlerole`)
**Purpose**: Specific positions within bundles
**Key Fields**:
- `title`, `description`: Role details
- `required_skills`: JSON array of required skills
- `hourly_rate`: Role-specific pricing

#### Bundle Members (`services_bundlemember`)
**Purpose**: Worker assignments to bundle roles
**Key Fields**:
- `is_confirmed`: Assignment confirmation status
- `joined_at`: Assignment timestamp

### 4. Project Management Domain

#### Projects (`projects_project`)
**Purpose**: Client project postings
**Key Fields**:
- `title`, `description`: Project details
- `budget_min/max`: Budget range
- `status`: Project lifecycle state
- `project_type`: 'individual' or 'bundle'
- `deadline`: Project completion target

**Relationships**:
- Many-to-One: ClientProfile, Category
- One-to-Many: ProjectTasks, Milestones, Reviews
- One-to-One: EscrowAccount, Conversation
- Many-to-Many: WorkerProfiles (via Bookings)

#### Project Tasks (`projects_projecttask`)
**Purpose**: Granular project deliverables
**Key Fields**:
- `title`, `description`: Task details
- `status`: Task completion state
- `estimated_hours`, `actual_hours`: Time tracking

#### Milestones (`projects_milestone`)
**Purpose**: Payment and progress checkpoints
**Key Fields**:
- `amount`: Milestone value
- `status`: Payment/release status
- `requires_approval`: Client approval requirement

### 5. Booking System Domain

#### Bookings (`bookings_booking`)
**Purpose**: Project assignments and agreements
**Key Fields**:
- `booking_type`: 'individual' or 'bundle'
- `proposed_rate`, `agreed_rate`: Pricing negotiation
- `status`: Booking lifecycle state

**Relationships**:
- Many-to-One: Project, WorkerProfile (individual), Bundle (bundle)
- One-to-Many: BookingMembers (for bundle bookings)
- One-to-One: Reviews

#### Booking Members (`bookings_bookingmember`)
**Purpose**: Individual worker assignments within bundle bookings
**Key Fields**:
- `status`: Individual assignment state
- `assigned_at`, `started_at`, `completed_at`: Timeline tracking

### 6. Communication Domain

#### Conversations (`messaging_conversation`)
**Purpose**: Project-specific communication threads
**Key Fields**:
- `participants`: JSON array of user IDs
- `subject`: Conversation topic
- `last_message_at`: Activity timestamp

#### Messages (`messaging_message`)
**Purpose**: Individual messages within conversations
**Key Fields**:
- `message_type`: 'text', 'image', 'file', 'system'
- `is_read`: Read status
- `file_url`, `file_name`: File attachments

#### Message Recipients (`messaging_messagerecipient`)
**Purpose**: Track read status per recipient
**Key Fields**:
- `is_read`, `read_at`: Individual read tracking

### 7. Review System Domain

#### Reviews (`reviews_review`)
**Purpose**: User feedback and reputation building
**Key Fields**:
- `rating`: 1-5 star rating
- `review_type`: 'client_to_worker' or 'worker_to_client'
- `is_public`: Visibility control
- `response`: Reviewee response

**Relationships**:
- Many-to-One: Project, User (reviewer), User (reviewee), Booking
- One-to-Many: ReviewCategories

#### Review Categories (`reviews_reviewcategory`)
**Purpose**: Detailed aspect-based ratings
**Key Fields**:
- `category`: Rating aspect (e.g., 'communication', 'quality')
- `rating`: Aspect-specific score

### 8. Payment System Domain

#### Wallets (`payments_wallet`)
**Purpose**: User account balances
**Key Fields**:
- `balance`: Current account balance
- `currency`: Account currency
- `is_active`: Account status

#### Escrow Accounts (`payments_escrowaccount`)
**Purpose**: Secure project funds holding
**Key Fields**:
- `total_amount`, `held_amount`, `released_amount`: Fund tracking
- `status`: Escrow lifecycle state

#### Payments (`payments_payment`)
**Purpose**: Individual payment transactions
**Key Fields**:
- `payment_type`: Transaction purpose
- `status`: Payment processing state
- `transaction_id`: External processor reference

#### Transactions (`payments_transaction`)
**Purpose**: Detailed wallet transaction log
**Key Fields**:
- `amount`: Transaction amount
- `balance_before/after`: Account balance tracking
- `transaction_type`: 'credit' or 'debit'

### 9. Trust & Safety Domain

#### Disputes (`disputes_dispute`)
**Purpose**: Conflict resolution system
**Key Fields**:
- `dispute_type`: Nature of dispute
- `status`: Resolution state
- `priority`: Urgency level
- `evidence_files`: Supporting documentation

#### Dispute Messages (`disputes_disputemessage`)
**Purpose**: Dispute communication log
**Key Fields**:
- `message_type`: 'message', 'evidence', 'resolution'
- `is_internal`: Admin-only visibility

### 10. Security & Analytics Domain

#### Fraud Alerts (`fraud_fraudalert`)
**Purpose**: Suspicious activity tracking
**Key Fields**:
- `alert_type`: Type of suspicious activity
- `severity`: Risk level assessment
- `risk_score`: Quantitative risk assessment

#### Suspicious Activities (`fraud_suspiciousactivity`)
**Purpose**: Raw security event logging
**Key Fields**:
- `activity_type`: Security event type
- `risk_factors`: Identified risk indicators
- `blocked`: Whether action was prevented

#### Audit Logs (`audit_auditlog`)
**Purpose**: Comprehensive system activity logging
**Key Fields**:
- `action`: Performed operation
- `resource_type/id`: Affected resource
- `old_values/new_values`: Change tracking
- `ip_address`, `user_agent`: Request context

#### Recommendations (`recommendations_recommendation`)
**Purpose**: AI-powered suggestions
**Key Fields**:
- `recommendation_type`: Type of recommendation
- `score`: Confidence score
- `metadata`: Additional context data

## Data Flow Architecture

### Project Creation Flow
1. **Client** creates Project
2. **System** creates EscrowAccount for Project
3. **System** creates Conversation for Project
4. **Workers** submit Bookings for Project
5. **Client** accepts Booking
6. **System** updates Project status to 'in_progress'

### Payment Flow
1. **Client** funds EscrowAccount (Payment: 'deposit')
2. **Milestone** completion triggers release request
3. **Client** approves milestone release
4. **System** creates Payment ('milestone_release')
5. **Funds** transfer to Worker Wallet
6. **System** deducts platform commission

### Review Flow
1. **Project** completion triggers review creation
2. **Users** submit Reviews with ratings
3. **System** updates WorkerProfile rating averages
4. **System** updates Service/Project statistics

### Dispute Flow
1. **User** initiates Dispute on Project
2. **System** freezes EscrowAccount
3. **Users** exchange DisputeMessages
4. **Admin** reviews evidence and resolves dispute
5. **System** releases funds according to resolution

## Performance Optimization

### Index Strategy

#### Primary Performance Indexes
- **User searches**: `user_type`, `email`, `is_verified`, `country`
- **Worker discovery**: `rating`, `hourly_rate`, `availability_status`, `location`
- **Project queries**: `status`, `category_id`, `budget_min/max`, `deadline`
- **Booking management**: `project_id`, `worker_id`, `status`
- **Communication**: `conversation_id`, `created_at`, `sender_id`
- **Payments**: `escrow_id`, `payer_id`, `payee_id`, `status`

#### Composite Indexes
- **Worker search**: `(rating DESC, hourly_rate ASC, experience_years DESC)` WHERE `availability_status = 'available'`
- **Project search**: `(category_id, budget_min, budget_max)` WHERE `status = 'posted'`
- **Message threads**: `(conversation_id, created_at DESC)`
- **Active bookings**: `(worker_id, status)` WHERE `status IN ('active', 'accepted')`

#### Partial Indexes
- **Active projects**: `created_at DESC` WHERE `status IN ('posted', 'in_progress')`
- **Verified workers**: `rating DESC` WHERE worker is verified
- **Completed payments**: `processed_at DESC` WHERE `status = 'completed'`

### Caching Strategy

#### Redis Cache Keys Structure
```
skillhub:{entity}:{id}:{field}
skillhub:search:{query_type}:{params_hash}
skillhub:stats:{metric}:{timeframe}
skillhub:user:{user_id}:{data_type}
```

#### Cached Data Categories
1. **User Profiles** (TTL: 1 hour)
2. **Worker Search Results** (TTL: 15 minutes)
3. **Project Listings** (TTL: 10 minutes)
4. **Bundle Templates** (TTL: 1 hour)
5. **Popular Services** (TTL: 30 minutes)
6. **Dashboard Statistics** (TTL: 15 minutes)

#### Cache Invalidation Rules
- **Immediate**: Profile updates, project status changes, payments
- **Delayed**: Rating recalculations, statistics updates
- **Batch**: Search index refreshes, cleanup operations

### Query Optimization

#### Common Query Patterns
```sql
-- Worker search with filters
SELECT * FROM worker_search_view
WHERE rating >= ? AND hourly_rate BETWEEN ? AND ?
  AND location_lat BETWEEN ? AND ?
  AND location_lng BETWEEN ? AND ?
  AND skills && ?
ORDER BY rating DESC, total_reviews DESC;

-- Project recommendations
SELECT * FROM projects_project p
JOIN users_clientprofile c ON p.client_id = c.id
WHERE p.status = 'posted'
  AND p.category_id = ?
  AND p.budget_max >= ?
ORDER BY p.created_at DESC;

-- Message threads
SELECT m.*, u.first_name, u.last_name
FROM messaging_message m
JOIN users_user u ON m.sender_id = u.id
WHERE m.conversation_id = ?
ORDER BY m.created_at DESC
LIMIT ? OFFSET ?;
```

## Security Architecture

### Data Protection

#### Encryption Strategy
- **Database**: Field-level encryption for sensitive data (PII, payment info)
- **Application**: AES-256-GCM for file encryption
- **Transport**: TLS 1.3 for all communications
- **Key Management**: AWS KMS for encryption keys

#### Access Control
- **Row-Level Security**: Database-level access policies
- **Role-Based Access**: Django permissions system
- **API Authentication**: JWT with refresh tokens
- **Multi-Factor Authentication**: TOTP for high-risk accounts

### Audit & Compliance

#### Audit Logging
- **Comprehensive Trail**: All data changes logged
- **Immutable Records**: Cryptographic checksums
- **Retention Policy**: 7 years for financial data
- **Access Monitoring**: Admin action auditing

#### Privacy Compliance
- **GDPR**: Data subject rights implementation
- **Data Minimization**: Only collect necessary data
- **Consent Management**: Granular permission controls
- **Breach Notification**: Automated incident response

## Scalability Considerations

### Database Partitioning Strategy

#### Table Partitioning
- **Audit Logs**: Monthly partitions by timestamp
- **Notifications**: Monthly partitions by creation date
- **Messages**: Monthly partitions by conversation
- **Payments**: Monthly partitions by processing date

#### Read Replicas
- **Reporting Queries**: Offload analytics to read replicas
- **Search Operations**: Dedicated replica for search queries
- **Backup Operations**: Separate replica for backups

### Horizontal Scaling

#### Microservices Preparation
- **Service Boundaries**: Clear domain separation
- **API Contracts**: Versioned REST APIs
- **Event-Driven Architecture**: Message queues for inter-service communication
- **Data Synchronization**: Event sourcing for cross-service consistency

#### CDN Integration
- **Static Assets**: Global CDN distribution
- **User Content**: Regional CDN caching
- **API Responses**: Edge caching for public data

## Monitoring & Maintenance

### Key Metrics
- **Performance**: Query execution time, cache hit ratio, connection count
- **Business**: Active users, transaction volume, dispute rate
- **Security**: Failed login attempts, suspicious activities, audit log volume
- **System**: Database size, index usage, backup status

### Maintenance Procedures

#### Regular Tasks
- **Index Maintenance**: REINDEX for heavily updated indexes
- **Statistics Update**: ANALYZE for query planner optimization
- **Archive Old Data**: Move historical data to archive tables
- **Backup Verification**: Test restore procedures monthly

#### Emergency Procedures
- **Failover**: Automatic promotion of read replicas
- **Data Recovery**: Point-in-time recovery capabilities
- **Incident Response**: Escalation procedures for security events
- **Communication**: Stakeholder notification protocols

## Implementation Guidelines

### Django Model Implementation
```python
# Example: Worker Profile Model
class WorkerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    # ... other fields

    class Meta:
        db_table = 'users_workerprofile'
        indexes = [
            models.Index(fields=['rating', 'hourly_rate']),
            models.Index(fields=['availability_status']),
        ]
```

### Migration Best Practices
- **Incremental Deployment**: Phase-based migration rollout
- **Rollback Planning**: Reverse migrations for each phase
- **Data Validation**: Pre/post-migration data integrity checks
- **Performance Monitoring**: Query performance before/after migration

### Testing Strategy
- **Unit Tests**: Model validation and business logic
- **Integration Tests**: API endpoint testing
- **Performance Tests**: Load testing with realistic data volumes
- **Security Tests**: Penetration testing and vulnerability assessment

This comprehensive database architecture provides a solid foundation for SkillHub Africa's global marketplace platform, ensuring scalability, security, and performance as the platform grows to serve thousands of users across Africa and worldwide.