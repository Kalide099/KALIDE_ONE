# SkillHub Africa

A global marketplace connecting skilled workers from African countries with clients worldwide.

## Features

- **Individual Hiring**: Hire single workers for specific tasks
- **Team Bundles**: Hire pre-assembled teams for complex projects
- **Worker Verification**: Verified profiles with ratings and portfolios
- **Project Management**: Track progress and manage payments
- **Messaging System**: Communicate with workers/clients
- **Review System**: Rate and review completed work

## Tech Stack

### Backend
- Python 3.11+
- Django 4.2+
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- Next.js 14+
- TypeScript
- TailwindCSS

## Project Structure

```
skillhub-africa/
├── backend/
│   ├── manage.py
│   ├── skillhub/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   └── apps/
│       ├── users/
│       ├── workers/
│       ├── services/
│       ├── bundles/
│       ├── projects/
│       ├── bookings/
│       ├── payments/
│       ├── messaging/
│       └── reviews/
└── frontend/
    └── src/
        └── app/
            ├── page.tsx (landing)
            ├── login/
            ├── register/
            ├── workers/
            ├── worker/[id]/
            ├── services/
            ├── bundles/
            ├── project/[id]/
            └── dashboard/
                ├── client/
                ├── worker/
                └── admin/
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd skillhub-africa/backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary
   ```

4. Set up PostgreSQL database and update settings.py

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Run server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd skillhub-africa/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Workers
- `GET /api/workers` - List workers
- `GET /api/workers/{id}` - Worker details

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service

### Bundles
- `GET /api/bundles` - List bundles
- `POST /api/bundles` - Create bundle

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Project details

### Bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/status` - Update booking status

### Reviews
- `POST /api/reviews` - Create review

### Messaging
- `POST /api/messages` - Send message

## Database Models

### User
- Custom user model with roles (client, worker, admin, team_leader)
- Fields: id, name, email, phone, country, city, role, password, created_at

### WorkerProfile
- User profile for workers
- Fields: user, skills, experience_years, bio, hourly_rate, rating, verified, portfolio_images

### Service
- Services offered by workers
- Fields: worker, title, description, price, location, category

### Bundle
- Pre-assembled teams
- Fields: name, description, category, created_by

### Project
- Client projects
- Fields: client, title, description, budget, status, start_date, deadline, bundle, worker

### Payment
- Escrow payment system
- Fields: project, amount, commission, worker_payment, status

## Contributing

This is the initial 50% foundation of SkillHub Africa. Future development should focus on:

1. Completing remaining features
2. Adding real-time messaging
3. Implementing payment gateway
4. Adding file uploads for portfolios
5. Mobile app development
6. Advanced search and filtering
7. Notification system
8. Analytics dashboard

## License

MIT License