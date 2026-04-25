-- SkillHub Africa - Complete PostgreSQL Database Schema
-- Version: 1.0.0
-- Date: March 5, 2026
-- Description: Production-ready database schema for global marketplace platform

-- ===========================================
-- CORE USER MANAGEMENT
-- ===========================================

-- Users table (extends Django's auth_user)
CREATE TABLE users_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'worker', 'admin')),
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Profiles
CREATE TABLE users_clientprofile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_user(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(500),
    description TEXT,
    total_projects_posted INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    preferred_payment_method VARCHAR(50),
    billing_address JSONB,
    tax_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker Profiles
CREATE TABLE users_workerprofile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_user(id) ON DELETE CASCADE,
    bio TEXT,
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(8,2),
    daily_rate DECIMAL(8,2),
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    total_projects_completed INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    response_time_hours INTEGER,
    languages JSONB DEFAULT '[]',
    portfolio_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    is_available_for_teams BOOLEAN DEFAULT TRUE,
    preferred_work_types JSONB DEFAULT '[]',
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SKILLS AND CATEGORIES
-- ===========================================

-- Skill Categories
CREATE TABLE services_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    parent_id INTEGER REFERENCES services_category(id),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills
CREATE TABLE services_skill (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES services_category(id),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker Skills (many-to-many)
CREATE TABLE users_workerskills (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users_workerprofile(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES services_skill(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
    years_experience INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(worker_id, skill_id)
);

-- ===========================================
-- SERVICES AND BUNDLES
-- ===========================================

-- Services (individual services offered by workers)
CREATE TABLE services_service (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users_workerprofile(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES services_category(id),
    base_price DECIMAL(8,2),
    price_type VARCHAR(20) DEFAULT 'hourly' CHECK (price_type IN ('hourly', 'daily', 'fixed', 'quote')),
    delivery_time_days INTEGER,
    revisions_included INTEGER DEFAULT 0,
    requirements TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Images/Gallery
CREATE TABLE services_serviceimage (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services_service(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Packages (Basic, Standard, Premium)
CREATE TABLE services_servicepackage (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services_service(id) ON DELETE CASCADE,
    package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('basic', 'standard', 'premium')),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    delivery_time_days INTEGER NOT NULL,
    revisions_included INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundles (pre-assembled teams)
CREATE TABLE services_bundle (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES services_category(id),
    created_by_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    team_size INTEGER NOT NULL,
    total_price DECIMAL(10,2),
    estimated_duration_days INTEGER,
    complexity_level VARCHAR(20) DEFAULT 'medium' CHECK (complexity_level IN ('simple', 'medium', 'complex')),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    total_bookings INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle Roles (positions within a bundle)
CREATE TABLE services_bundlerole (
    id SERIAL PRIMARY KEY,
    bundle_id INTEGER REFERENCES services_bundle(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    required_skills JSONB DEFAULT '[]',
    experience_level VARCHAR(20) DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
    estimated_hours INTEGER,
    hourly_rate DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle Members (workers assigned to bundle roles)
CREATE TABLE services_bundlemember (
    id SERIAL PRIMARY KEY,
    bundle_id INTEGER REFERENCES services_bundle(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES services_bundlerole(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES users_workerprofile(id) ON DELETE CASCADE,
    is_confirmed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bundle_id, role_id, worker_id)
);

-- ===========================================
-- PORTFOLIO AND WORK SAMPLES
-- ===========================================

-- Portfolio Items
CREATE TABLE services_portfolioitem (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users_workerprofile(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_url VARCHAR(500),
    image_urls JSONB DEFAULT '[]',
    skills_used JSONB DEFAULT '[]',
    completion_date DATE,
    client_feedback TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PROJECT MANAGEMENT
-- ===========================================

-- Projects
CREATE TABLE projects_project (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    description TEXT,
    client_id INTEGER REFERENCES users_clientprofile(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES services_category(id),
    project_type VARCHAR(20) DEFAULT 'individual' CHECK (project_type IN ('individual', 'bundle')),
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'in_progress', 'completed', 'cancelled', 'disputed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    estimated_duration_days INTEGER,
    deadline DATE,
    requirements TEXT,
    attachments JSONB DEFAULT '[]',
    location_required BOOLEAN DEFAULT FALSE,
    remote_allowed BOOLEAN DEFAULT TRUE,
    skills_required JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT FALSE,
    total_proposals INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Project Tasks
CREATE TABLE projects_projecttask (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects_project(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to_id INTEGER REFERENCES users_workerprofile(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_hours INTEGER,
    actual_hours INTEGER,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Milestones
CREATE TABLE projects_milestone (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects_project(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    completed_at TIMESTAMP WITH TIME ZONE,
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- BOOKING AND ASSIGNMENT SYSTEM
-- ===========================================

-- Bookings (project assignments)
CREATE TABLE bookings_booking (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects_project(id) ON DELETE CASCADE,
    booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('individual', 'bundle')),
    worker_id INTEGER REFERENCES users_workerprofile(id), -- NULL for bundle bookings
    bundle_id INTEGER REFERENCES services_bundle(id), -- NULL for individual bookings
    status VARCHAR(30) DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'active', 'completed', 'cancelled', 'disputed')),
    proposed_rate DECIMAL(8,2),
    agreed_rate DECIMAL(8,2),
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    terms TEXT,
    special_requirements TEXT,
    proposed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_booking_type CHECK (
        (booking_type = 'individual' AND worker_id IS NOT NULL AND bundle_id IS NULL) OR
        (booking_type = 'bundle' AND bundle_id IS NOT NULL AND worker_id IS NULL)
    )
);

-- Booking Members (for bundle bookings - which workers are assigned)
CREATE TABLE bookings_bookingmember (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings_booking(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES users_workerprofile(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES services_bundlerole(id),
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(booking_id, worker_id)
);

-- ===========================================
-- COMMUNICATION SYSTEM
-- ===========================================

-- Conversations
CREATE TABLE messaging_conversation (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects_project(id) ON DELETE CASCADE,
    participants JSONB NOT NULL, -- Array of user IDs
    subject VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messaging_message (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES messaging_conversation(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Recipients (for tracking read status per user)
CREATE TABLE messaging_messagerecipient (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messaging_message(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, recipient_id)
);

-- ===========================================
-- REVIEW AND RATING SYSTEM
-- ===========================================

-- Reviews
CREATE TABLE reviews_review (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects_project(id) ON DELETE CASCADE,
    reviewer_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings_booking(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('client_to_worker', 'worker_to_client')),
    is_public BOOLEAN DEFAULT TRUE,
    response TEXT, -- Reviewee's response
    response_at TIMESTAMP WITH TIME ZONE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Categories (specific aspects rated)
CREATE TABLE reviews_reviewcategory (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews_review(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- e.g., 'communication', 'quality', 'timeliness'
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PAYMENT SYSTEM
-- ===========================================

-- Wallets
CREATE TABLE payments_wallet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_user(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escrow Accounts
CREATE TABLE payments_escrowaccount (
    id SERIAL PRIMARY KEY,
    project_id INTEGER UNIQUE REFERENCES projects_project(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    held_amount DECIMAL(12,2) DEFAULT 0,
    released_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'released', 'refunded', 'disputed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments_payment (
    id SERIAL PRIMARY KEY,
    escrow_id INTEGER REFERENCES payments_escrowaccount(id),
    milestone_id INTEGER REFERENCES projects_milestone(id),
    payer_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    payee_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('deposit', 'milestone_release', 'final_release', 'refund', 'commission')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255), -- External payment processor ID
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (detailed payment records)
CREATE TABLE payments_transaction (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments_payment(id) ON DELETE CASCADE,
    wallet_id INTEGER REFERENCES payments_wallet(id),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- NOTIFICATION SYSTEM
-- ===========================================

-- Notifications
CREATE TABLE notifications_notification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notifications_notificationpreference (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users_user(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    project_updates BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    payment_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- DISPUTE RESOLUTION
-- ===========================================

-- Disputes
CREATE TABLE disputes_dispute (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects_project(id) ON DELETE CASCADE,
    initiator_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    respondent_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    dispute_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    resolution TEXT,
    resolved_by_id INTEGER REFERENCES users_user(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    evidence_files JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispute Messages
CREATE TABLE disputes_disputemessage (
    id SERIAL PRIMARY KEY,
    dispute_id INTEGER REFERENCES disputes_dispute(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN ('message', 'evidence', 'resolution')),
    is_internal BOOLEAN DEFAULT FALSE, -- Internal admin communication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- FRAUD DETECTION & SECURITY
-- ===========================================

-- Fraud Alerts
CREATE TABLE fraud_fraudalert (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    risk_score DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
    resolved_by_id INTEGER REFERENCES users_user(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suspicious Activities Log
CREATE TABLE fraud_suspiciousactivity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id),
    activity_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,
    risk_factors JSONB DEFAULT '[]',
    risk_score DECIMAL(5,2) DEFAULT 0,
    blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AI RECOMMENDATIONS
-- ===========================================

-- AI Recommendations
CREATE TABLE recommendations_recommendation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'worker', 'project', 'bundle', etc.
    target_id INTEGER NOT NULL,
    score DECIMAL(5,4) NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    is_viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendation Feedback
CREATE TABLE recommendations_recommendationfeedback (
    id SERIAL PRIMARY KEY,
    recommendation_id INTEGER REFERENCES recommendations_recommendation(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
    feedback VARCHAR(20) NOT NULL CHECK (feedback IN ('helpful', 'not_helpful', 'irrelevant')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AUDIT LOGS
-- ===========================================

-- Audit Logs
CREATE TABLE audit_auditlog (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- User indexes
CREATE INDEX idx_users_user_type ON users_user(user_type);
CREATE INDEX idx_users_email ON users_user(email);
CREATE INDEX idx_users_is_verified ON users_user(is_verified);
CREATE INDEX idx_users_country ON users_user(country);
CREATE INDEX idx_users_created_at ON users_user(created_at);

-- Worker profile indexes
CREATE INDEX idx_worker_profile_rating ON users_workerprofile(rating);
CREATE INDEX idx_worker_profile_hourly_rate ON users_workerprofile(hourly_rate);
CREATE INDEX idx_worker_profile_availability ON users_workerprofile(availability_status);
CREATE INDEX idx_worker_profile_location ON users_workerprofile USING GIST (point(location_lng, location_lat));

-- Skills indexes
CREATE INDEX idx_worker_skills_worker ON users_workerskills(worker_id);
CREATE INDEX idx_worker_skills_skill ON users_workerskills(skill_id);
CREATE INDEX idx_worker_skills_proficiency ON users_workerskills(proficiency_level);

-- Service indexes
CREATE INDEX idx_services_category ON services_service(category_id);
CREATE INDEX idx_services_worker ON services_service(worker_id);
CREATE INDEX idx_services_price ON services_service(base_price);
CREATE INDEX idx_services_rating ON services_service(rating);
CREATE INDEX idx_services_active ON services_service(is_active);

-- Project indexes
CREATE INDEX idx_projects_client ON projects_project(client_id);
CREATE INDEX idx_projects_category ON projects_project(category_id);
CREATE INDEX idx_projects_status ON projects_project(status);
CREATE INDEX idx_projects_budget ON projects_project(budget_min, budget_max);
CREATE INDEX idx_projects_created ON projects_project(created_at);
CREATE INDEX idx_projects_deadline ON projects_project(deadline);

-- Booking indexes
CREATE INDEX idx_bookings_project ON bookings_booking(project_id);
CREATE INDEX idx_bookings_worker ON bookings_booking(worker_id);
CREATE INDEX idx_bookings_bundle ON bookings_booking(bundle_id);
CREATE INDEX idx_bookings_status ON bookings_booking(status);

-- Message indexes
CREATE INDEX idx_messages_conversation ON messaging_message(conversation_id);
CREATE INDEX idx_messages_sender ON messaging_message(sender_id);
CREATE INDEX idx_messages_created ON messaging_message(created_at);

-- Review indexes
CREATE INDEX idx_reviews_project ON reviews_review(project_id);
CREATE INDEX idx_reviews_reviewer ON reviews_review(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews_review(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews_review(rating);

-- Payment indexes
CREATE INDEX idx_payments_escrow ON payments_payment(escrow_id);
CREATE INDEX idx_payments_payer ON payments_payment(payer_id);
CREATE INDEX idx_payments_payee ON payments_payment(payee_id);
CREATE INDEX idx_payments_status ON payments_payment(status);
CREATE INDEX idx_payments_created ON payments_payment(created_at);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications_notification(user_id);
CREATE INDEX idx_notifications_read ON notifications_notification(is_read);
CREATE INDEX idx_notifications_created ON notifications_notification(created_at);

-- Audit log indexes
CREATE INDEX idx_audit_user ON audit_auditlog(user_id);
CREATE INDEX idx_audit_resource ON audit_auditlog(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_auditlog(timestamp);

-- ===========================================
-- TRIGGERS FOR DATA INTEGRITY
-- ===========================================

-- Update worker rating trigger
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

CREATE TRIGGER trigger_update_worker_rating
    AFTER INSERT OR UPDATE ON reviews_review
    FOR EACH ROW
    WHEN (NEW.review_type = 'client_to_worker')
    EXECUTE FUNCTION update_worker_rating();

-- Update project statistics trigger
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

CREATE TRIGGER trigger_update_project_stats
    AFTER INSERT ON bookings_booking
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats();

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- Worker search view
CREATE VIEW worker_search_view AS
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
CREATE VIEW project_summary_view AS
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