# SkillHub Africa - Entity Relationship Diagram & Relationships

## Core Entity Relationships

### User Management Domain
```
Users (1) ──── (1) ClientProfiles
Users (1) ──── (1) WorkerProfiles
Users (1) ──── (1) Wallets
Users (1) ──── (1) NotificationPreferences
```

### Skills & Services Domain
```
WorkerProfiles (N) ──── (N) Skills (via WorkerSkills)
Skills (N) ──── (1) Categories
WorkerProfiles (1) ──── (N) Services
Services (1) ──── (N) ServiceImages
Services (1) ──── (N) ServicePackages
WorkerProfiles (1) ──── (N) PortfolioItems
```

### Bundle System Domain
```
Users (1) ──── (N) Bundles
Bundles (1) ──── (N) BundleRoles
Bundles (1) ──── (N) BundleMembers
BundleMembers (N) ──── (1) WorkerProfiles
BundleMembers (N) ──── (1) BundleRoles
```

### Project Management Domain
```
ClientProfiles (1) ──── (N) Projects
Projects (1) ──── (N) ProjectTasks
Projects (1) ──── (N) Milestones
Projects (1) ──── (1) EscrowAccounts
Projects (1) ──── (1) Conversations
Projects (1) ──── (N) Reviews
```

### Booking System Domain
```
Projects (1) ──── (N) Bookings
Bookings (1) ──── (1) WorkerProfiles (Individual bookings)
Bookings (1) ──── (1) Bundles (Bundle bookings)
Bookings (1) ──── (N) BookingMembers
BookingMembers (N) ──── (1) WorkerProfiles
BookingMembers (N) ──── (1) BundleRoles
```

### Communication Domain
```
Projects (1) ──── (1) Conversations
Conversations (1) ──── (N) Messages
Messages (1) ──── (N) MessageRecipients
Messages (N) ──── (1) Users (sender)
MessageRecipients (N) ──── (1) Users (recipients)
```

### Review System Domain
```
Projects (1) ──── (N) Reviews
Reviews (N) ──── (1) Users (reviewer)
Reviews (N) ──── (1) Users (reviewee)
Reviews (1) ──── (N) ReviewCategories
Bookings (1) ──── (1) Reviews
```

### Payment System Domain
```
Users (1) ──── (1) Wallets
Projects (1) ──── (1) EscrowAccounts
EscrowAccounts (1) ──── (N) Payments
Milestones (1) ──── (N) Payments
Payments (N) ──── (1) Users (payer)
Payments (N) ──── (1) Users (payee)
Payments (1) ──── (N) Transactions
Wallets (1) ──── (N) Transactions
```

### Trust & Safety Domain
```
Projects (1) ──── (N) Disputes
Disputes (N) ──── (1) Users (initiator)
Disputes (N) ──── (1) Users (respondent)
Disputes (1) ──── (N) DisputeMessages
DisputeMessages (N) ──── (1) Users

Users (1) ──── (N) FraudAlerts
FraudAlerts (1) ──── (1) Users (resolved_by)
Users (1) ──── (N) SuspiciousActivities
```

### AI & Analytics Domain
```
Users (1) ──── (N) Recommendations
Recommendations (1) ──── (N) RecommendationFeedback
RecommendationFeedback (N) ──── (1) Users

Users (1) ──── (N) AuditLogs
```

### Notification Domain
```
Users (1) ──── (N) Notifications
```

## Key Relationship Patterns

### One-to-One Relationships
- User ↔ ClientProfile
- User ↔ WorkerProfile
- User ↔ Wallet
- User ↔ NotificationPreferences
- Project ↔ EscrowAccount
- Project ↔ Conversation

### One-to-Many Relationships
- User → Projects (as client)
- WorkerProfile → Services
- WorkerProfile → PortfolioItems
- Project → ProjectTasks
- Project → Milestones
- Project → Reviews
- Bundle → BundleRoles
- Bundle → BundleMembers
- Conversation → Messages
- EscrowAccount → Payments
- Dispute → DisputeMessages

### Many-to-Many Relationships
- WorkerProfiles ↔ Skills (via WorkerSkills)
- Projects ↔ WorkerProfiles (via Bookings - individual)
- Projects ↔ Bundles (via Bookings - bundle)
- Bookings ↔ WorkerProfiles (via BookingMembers - for bundle bookings)
- Messages ↔ Users (via MessageRecipients)

## Data Flow Architecture

### Project Creation Flow
1. Client creates Project
2. System creates EscrowAccount for Project
3. System creates Conversation for Project
4. Workers/Bundles submit Bookings for Project

### Booking Acceptance Flow
1. Client accepts Booking
2. System creates BookingMembers (for bundle bookings)
3. Workers start working on ProjectTasks
4. Progress tracked via Milestones

### Payment Flow
1. Client funds EscrowAccount
2. System creates Payment records
3. Milestone completion triggers Payment releases
4. Funds transferred to Worker Wallets
5. Platform takes commission

### Review Flow
1. Project completion triggers Review creation
2. Reviews update WorkerProfile ratings
3. ReviewCategories provide detailed feedback

### Dispute Flow
1. User initiates Dispute on Project
2. DisputeMessages facilitate communication
3. Admin resolves Dispute
4. Resolution affects Payment releases

## Database Constraints & Business Rules

### Check Constraints
- User types: 'client', 'worker', 'admin'
- Worker availability: 'available', 'busy', 'offline'
- Project status: 'draft', 'posted', 'in_progress', 'completed', 'cancelled', 'disputed'
- Booking types: 'individual', 'bundle'
- Payment types: 'deposit', 'milestone_release', 'final_release', 'refund', 'commission'
- Review types: 'client_to_worker', 'worker_to_client'

### Unique Constraints
- User email addresses
- WorkerSkills (worker_id, skill_id)
- BookingMembers (booking_id, worker_id)
- MessageRecipients (message_id, recipient_id)

### Foreign Key Constraints
- All relationships use CASCADE on delete where appropriate
- Some use RESTRICT to prevent orphaned records
- AuditLogs allow NULL user_id for system actions

### Business Logic Constraints
- Bundle bookings cannot have individual workers (and vice versa)
- Only completed projects can have reviews
- Only active bookings can have payments
- Escrow accounts must have sufficient funds for releases