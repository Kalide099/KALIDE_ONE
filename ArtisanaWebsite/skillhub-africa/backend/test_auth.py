import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kalide_one.settings')
django.setup()

from users.models import User

def check_admin():
    email = 'admin@kalide.com'
    password = 'admin'
    
    user_obj = User.objects.filter(email=email).first()
    if not user_obj:
        print(f"ERROR: User {email} dose not exist!")
        return

    print(f"User found: {user_obj.email}")
    print(f"Is active: {user_obj.is_active}")
    print(f"Is staff: {user_obj.is_staff}")
    print(f"Is superuser: {user_obj.is_superuser}")
    
    # Try authenticating directly in the script
    # authenticated_user = authenticate(email=email, password=password) # This was the old way
    authenticated_user = authenticate(username=email, password=password)
    
    if authenticated_user:
        print("SUCCESS: Authentication test passed!")
    else:
        print("FAILURE: Authentication test failed!")
        # Try checking password manually
        if user_obj.check_password(password):
            print("INFO: check_password('admin') is TRUE. The issue is in authenticate() parameters.")
        else:
            print("ERROR: check_password('admin') is FALSE. Password mismatch!")

if __name__ == '__main__':
    check_admin()
