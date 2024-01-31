#!/bin/bash
set -e

# Generate openssl certificate
mkdir -p /etc/daphne/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/daphne/ssl/daphne.key \
        -out /etc/daphne/ssl/daphne.crt \
        -subj "/C=KR/L=Seoul/O=42Seoul/CN=nginx" \
        > /dev/null 2>&1

# TODO: 고칠 수 있으면 고치기
sleep 10
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Execute da

daphne -b 0.0.0.0 -e ssl:443:privateKey=/etc/daphne/ssl/daphne.key:certKey=/etc/daphne/ssl/daphne.crt config.asgi:application
