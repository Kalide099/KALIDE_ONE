import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kalide_one.settings')
django.setup()

from users.models import User

def reset_admin():
    email = 'admin@kalide.com'
    password = 'admin'
    
    user = User.objects.filter(email=email).first()
    if user:
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.role = 'admin'
        user.save()
        print(f"Node Admin {email} updated with password '{password}'")
    else:
        User.objects.create_superuser(
            email=email,
            password=password,
            name='Supreme Admin',
            role='admin'
        )
        print(f"Node Admin {email} created with password '{password}'")

if __name__ == '__main__':
    reset_admin()
