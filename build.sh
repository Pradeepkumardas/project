#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Ensure superuser pradeep / pradeep123 is created or updated
python manage.py shell -c "from django.contrib.auth.models import User; u, _ = User.objects.get_or_create(username='pradeep', defaults={'email': 'dkpradeep123@gmail.com'}); u.is_staff=True; u.is_superuser=True; u.is_active=True; u.set_password('pradeep123'); u.save(); a = User.objects.filter(username='admin').first(); a.set_password('pradeep123') if a else None; a.save() if a else None"
