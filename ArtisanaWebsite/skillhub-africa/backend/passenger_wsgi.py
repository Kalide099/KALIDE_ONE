import os
import sys

# Add the current directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'kalide_one.settings'

# Import the WSGI application
from kalide_one.wsgi import application
