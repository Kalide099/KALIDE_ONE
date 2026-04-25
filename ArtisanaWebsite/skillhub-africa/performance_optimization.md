# SkillHub Africa - Performance Optimization & Caching Strategy

## Database Performance Optimization

### Core Indexes (Already implemented in schema)

#### User Management Indexes
```sql
CREATE INDEX idx_users_user_type ON users_user(user_type);
CREATE INDEX idx_users_email ON users_user(email);
CREATE INDEX idx_users_is_verified ON users_user(is_verified);
CREATE INDEX idx_users_country ON users_user(country);
CREATE INDEX idx_users_created_at ON users_user(created_at);
```

#### Worker Search Indexes
```sql
CREATE INDEX idx_worker_profile_rating ON users_workerprofile(rating);
CREATE INDEX idx_worker_profile_hourly_rate ON users_workerprofile(hourly_rate);
CREATE INDEX idx_worker_profile_availability ON users_workerprofile(availability_status);
CREATE INDEX idx_worker_profile_location ON users_workerprofile USING GIST (point(location_lng, location_lat));
```

#### Skills & Services Indexes
```sql
CREATE INDEX idx_worker_skills_worker ON users_workerskills(worker_id);
CREATE INDEX idx_worker_skills_skill ON users_workerskills(skill_id);
CREATE INDEX idx_worker_skills_proficiency ON users_workerskills(proficiency_level);
CREATE INDEX idx_services_category ON services_service(category_id);
CREATE INDEX idx_services_worker ON services_service(worker_id);
CREATE INDEX idx_services_price ON services_service(base_price);
CREATE INDEX idx_services_rating ON services_service(rating);
CREATE INDEX idx_services_active ON services_service(is_active);
```

#### Project Management Indexes
```sql
CREATE INDEX idx_projects_client ON projects_project(client_id);
CREATE INDEX idx_projects_category ON projects_project(category_id);
CREATE INDEX idx_projects_status ON projects_project(status);
CREATE INDEX idx_projects_budget ON projects_project(budget_min, budget_max);
CREATE INDEX idx_projects_created ON projects_project(created_at);
CREATE INDEX idx_projects_deadline ON projects_project(deadline);
```

#### Communication Indexes
```sql
CREATE INDEX idx_messages_conversation ON messaging_message(conversation_id);
CREATE INDEX idx_messages_sender ON messaging_message(sender_id);
CREATE INDEX idx_messages_created ON messaging_message(created_at);
```

#### Payment Indexes
```sql
CREATE INDEX idx_payments_escrow ON payments_payment(escrow_id);
CREATE INDEX idx_payments_payer ON payments_payment(payer_id);
CREATE INDEX idx_payments_payee ON payments_payment(payee_id);
CREATE INDEX idx_payments_status ON payments_payment(status);
CREATE INDEX idx_payments_created ON payments_payment(created_at);
```

### Advanced Performance Indexes

#### Composite Indexes for Complex Queries
```sql
-- Worker search by multiple criteria
CREATE INDEX idx_worker_search ON users_workerprofile(rating DESC, hourly_rate ASC, experience_years DESC)
WHERE availability_status = 'available';

-- Project search by budget range and category
CREATE INDEX idx_project_budget_category ON projects_project(category_id, budget_min, budget_max)
WHERE status = 'posted';

-- Recent messages for conversation view
CREATE INDEX idx_messages_conversation_recent ON messaging_message(conversation_id, created_at DESC);

-- Active bookings by worker
CREATE INDEX idx_bookings_worker_active ON bookings_booking(worker_id, status)
WHERE status IN ('active', 'accepted');

-- Reviews by rating and date
CREATE INDEX idx_reviews_rating_date ON reviews_review(reviewee_id, rating DESC, created_at DESC)
WHERE review_type = 'client_to_worker';
```

#### Partial Indexes for Common Filters
```sql
-- Active projects only
CREATE INDEX idx_projects_active ON projects_project(created_at DESC)
WHERE status IN ('posted', 'in_progress');

-- Verified workers only
CREATE INDEX idx_workers_verified ON users_workerprofile(rating DESC)
WHERE EXISTS (SELECT 1 FROM users_user u WHERE u.id = user_id AND u.is_verified = true);

-- Completed payments
CREATE INDEX idx_payments_completed ON payments_payment(processed_at DESC)
WHERE status = 'completed';
```

#### Functional Indexes
```sql
-- Full text search on project titles and descriptions
CREATE INDEX idx_projects_fts ON projects_project
USING GIN (to_tsvector('english', title || ' ' || description));

-- Location-based search (using PostGIS if available)
-- CREATE INDEX idx_workers_location ON users_workerprofile USING GIST (ST_Point(location_lng, location_lat));
```

## Redis Caching Strategy

### Cache Keys Structure
```
skillhub:{entity}:{id}:{field}
skillhub:search:{query_type}:{params}
skillhub:stats:{metric}:{timeframe}
skillhub:user:{user_id}:{data_type}
```

### Cached Data Categories

#### 1. User Profiles (TTL: 1 hour)
- **Key**: `skillhub:user:{user_id}:profile`
- **Data**: Complete user profile with worker/client details
- **Invalidation**: On profile update, new review, project completion

#### 2. Worker Search Results (TTL: 15 minutes)
- **Key**: `skillhub:search:workers:{hash_of_search_params}`
- **Data**: Paginated worker search results
- **Invalidation**: When worker profiles update, new workers join

#### 3. Project Listings (TTL: 10 minutes)
- **Key**: `skillhub:projects:category:{category_id}:page:{page}`
- **Data**: Project listings by category
- **Invalidation**: New projects posted, status changes

#### 4. Bundle Templates (TTL: 1 hour)
- **Key**: `skillhub:bundle:{bundle_id}:details`
- **Data**: Complete bundle information with roles and pricing
- **Invalidation**: Bundle updates, member changes

#### 5. Service Categories (TTL: 24 hours)
- **Key**: `skillhub:categories:tree`
- **Data**: Complete category hierarchy
- **Invalidation**: Category structure changes (rare)

#### 6. Popular Services (TTL: 30 minutes)
- **Key**: `skillhub:services:popular:{category_id}`
- **Data**: Top-rated services by category
- **Invalidation**: New reviews, service updates

#### 7. Project Summaries (TTL: 5 minutes)
- **Key**: `skillhub:project:{project_id}:summary`
- **Data**: Project status, milestones, payments
- **Invalidation**: Status changes, new milestones, payments

#### 8. Conversation Previews (TTL: 2 minutes)
- **Key**: `skillhub:conversation:{conversation_id}:preview`
- **Data**: Last message, unread count, participants
- **Invalidation**: New messages, read status changes

#### 9. Dashboard Statistics (TTL: 15 minutes)
- **Key**: `skillhub:stats:user:{user_id}:dashboard`
- **Data**: Earnings, active projects, reviews count
- **Invalidation**: New projects, payments, reviews

#### 10. Location-based Data (TTL: 1 hour)
- **Key**: `skillhub:workers:nearby:{lat}:{lng}:{radius}`
- **Data**: Workers within geographic radius
- **Invalidation**: Worker location updates

### Cache Invalidation Rules

#### Immediate Invalidation (Real-time)
- User profile updates
- Project status changes
- New messages in conversations
- Payment processing
- Review submissions

#### Delayed Invalidation (Background)
- Rating recalculations (5-minute delay)
- Statistics updates (15-minute delay)
- Search index refreshes (hourly)

#### Batch Invalidation
```python
# Example: When a worker updates their profile
def invalidate_worker_cache(worker_id):
    # Individual profile
    cache.delete(f"skillhub:user:{worker_id}:profile")

    # Search results (invalidate by pattern)
    cache.delete_pattern(f"skillhub:search:workers:*")

    # Nearby workers
    cache.delete_pattern(f"skillhub:workers:nearby:*")

    # Popular services if this worker is featured
    cache.delete(f"skillhub:services:popular:*")
```

### Cache Warming Strategy

#### On Application Startup
1. Preload category hierarchy
2. Cache popular services
3. Load active project counts

#### Background Jobs
1. Refresh search indexes hourly
2. Update statistics every 15 minutes
3. Clean expired cache entries daily

## Search Index Structure

### Elasticsearch Integration (Optional Enhancement)

#### Worker Index Mapping
```json
{
  "mappings": {
    "properties": {
      "worker_id": {"type": "keyword"},
      "name": {"type": "text", "analyzer": "standard"},
      "bio": {"type": "text", "analyzer": "english"},
      "skills": {"type": "keyword"},
      "categories": {"type": "keyword"},
      "rating": {"type": "float"},
      "hourly_rate": {"type": "float"},
      "experience_years": {"type": "integer"},
      "location": {"type": "geo_point"},
      "country": {"type": "keyword"},
      "city": {"type": "keyword"},
      "availability_status": {"type": "keyword"},
      "total_reviews": {"type": "integer"},
      "languages": {"type": "keyword"},
      "portfolio_count": {"type": "integer"},
      "completion_rate": {"type": "float"},
      "created_at": {"type": "date"}
    }
  }
}
```

#### Project Index Mapping
```json
{
  "mappings": {
    "properties": {
      "project_id": {"type": "keyword"},
      "title": {"type": "text", "analyzer": "english"},
      "description": {"type": "text", "analyzer": "english"},
      "category": {"type": "keyword"},
      "skills_required": {"type": "keyword"},
      "budget_min": {"type": "float"},
      "budget_max": {"type": "float"},
      "currency": {"type": "keyword"},
      "deadline": {"type": "date"},
      "status": {"type": "keyword"},
      "client_rating": {"type": "float"},
      "total_proposals": {"type": "integer"},
      "posted_at": {"type": "date"}
    }
  }
}
```

### Search Query Optimization

#### Worker Search Queries
```python
# Multi-match query with filters
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": search_term,
            "fields": ["name^3", "bio^2", "skills"]
          }
        }
      ],
      "filter": [
        {"term": {"availability_status": "available"}},
        {"range": {"rating": {"gte": min_rating}}},
        {"range": {"hourly_rate": {"gte": min_rate, "lte": max_rate}}},
        {"geo_distance": {"distance": f"{radius}km", "location": {"lat": lat, "lon": lng}}}
      ]
    }
  },
  "sort": [
    {"rating": "desc"},
    {"total_reviews": "desc"},
    {"_score": "desc"}
  ]
}
```

#### Project Search Queries
```python
{
  "query": {
    "bool": {
      "should": [
        {"match": {"title": {"query": search_term, "boost": 3}}},
        {"match": {"description": {"query": search_term, "boost": 1}}}
      ],
      "filter": [
        {"term": {"status": "posted"}},
        {"terms": {"category": categories}},
        {"range": {"budget_max": {"gte": min_budget}}},
        {"range": {"budget_min": {"lte": max_budget}}}
      ]
    }
  },
  "sort": [{"posted_at": "desc"}]
}
```

## Query Optimization Techniques

### Database Query Optimization

#### 1. Select Only Required Fields
```sql
-- Bad: SELECT * FROM users_workerprofile
-- Good: SELECT id, first_name, last_name, rating, hourly_rate FROM users_workerprofile
```

#### 2. Use EXISTS Instead of COUNT for Existence Checks
```sql
-- Bad: SELECT COUNT(*) > 0 FROM reviews_review WHERE reviewee_id = ?
-- Good: SELECT EXISTS(SELECT 1 FROM reviews_review WHERE reviewee_id = ?)
```

#### 3. Use UNION ALL Instead of UNION When Appropriate
```sql
-- For distinct results use UNION, for combined results use UNION ALL
SELECT id, 'worker' as type FROM users_workerprofile WHERE rating > 4
UNION ALL
SELECT id, 'service' as type FROM services_service WHERE rating > 4
```

#### 4. Optimize Subqueries with JOINs
```sql
-- Subquery approach (slower)
SELECT * FROM projects_project p
WHERE client_id IN (SELECT id FROM users_clientprofile WHERE total_spent > 1000)

-- JOIN approach (faster)
SELECT p.* FROM projects_project p
JOIN users_clientprofile c ON p.client_id = c.id
WHERE c.total_spent > 1000
```

### Connection Pooling & Prepared Statements

#### Django Database Configuration
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'skillhub_africa',
        'USER': 'skillhub_user',
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': 'localhost',
        'PORT': '5432',
        'CONN_MAX_AGE': 60,  # Connection pooling
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}
```

### Monitoring & Alerting

#### Key Metrics to Monitor
1. Query execution time (>100ms alerts)
2. Cache hit ratio (<90% alerts)
3. Database connection count
4. Slow query logs
5. Index usage statistics

#### Performance Monitoring Queries
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table bloat
SELECT schemaname, tablename, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;
```