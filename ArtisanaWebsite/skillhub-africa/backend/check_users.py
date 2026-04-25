import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kalide_one.settings')
django.setup()

from users.models import User

users = User.objects.all()
print(f"{'Email':<30} | {'Is Staff':<10} | {'Is Active':<10} | {'Role':<10}")
print("-" * 70)
for user in users:
    print(f"{user.email:<30} | {str(user.is_staff):<10} | {str(user.is_active):<10} | {user.role:<10}")
