import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kalide_one.settings')
django.setup()

from users.models import User
from django.contrib.auth.hashers import make_password

def seed_users():
    # 1. Create Super Admin
    if not User.objects.filter(email='admin@kalide.com').exists():
        admin = User.objects.create_superuser(
            email='admin@kalide.com',
            password='admin',
            name='Supreme Admin',
            role='admin'
        )
        print("Admin created. Email: admin@kalide.com | Password: admin")
    else:
        print("Admin already exists: admin@kalide.com | Password: admin")

    # 2. Create Client
    if not User.objects.filter(email='client@kalide.com').exists():
        client = User(
            email='client@kalide.com',
            name='Global Tech Corp',
            role='client',
            is_active=True
        )
        client.set_password('client')
        client.save()
        print("Client created. Email: client@kalide.com | Password: client")
    else:
        print("Client already exists: client@kalide.com | Password: client")

    # 3. Create Worker/Artisan
    if not User.objects.filter(email='worker@kalide.com').exists():
        worker = User(
            email='worker@kalide.com',
            name='Marcus The Builder',
            role='worker',
            is_active=True
        )
        worker.set_password('worker')
        worker.save()
        print("Worker created. Email: worker@kalide.com | Password: worker")
    else:
        print("Worker already exists: worker@kalide.com | Password: worker")

if __name__ == '__main__':
    seed_users()
