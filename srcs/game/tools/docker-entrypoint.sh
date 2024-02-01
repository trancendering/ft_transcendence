#!/bin/bash
set -e

# Function to wait for the database to be ready
wait_for_db() {
    echo "Waiting for database to be ready..."
    retries=5
    while ! nc -z database 5432; do
        sleep 1
        retries=$((retries - 1))
        if [ $retries -le 0 ]; then
            echo "Database is not available, exiting..."
            exit 1
        fi
    done
    echo "Database is ready!"
}

# Generate openssl certificate
mkdir -p /etc/daphne/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/daphne/ssl/daphne.key \
        -out /etc/daphne/ssl/daphne.crt \
        -subj "/C=KR/L=Seoul/O=42Seoul/CN=nginx" \
        > /dev/null 2>&1

# TODO: 고칠 수 있으면 고치기

wait_for_db

if [ "$DJANGO_INITIAL_SETUP" = "true" ]; then
    python manage.py makemigrations
    python manage.py migrate
    python manage.py createsuperuser
fi

# Execute da

daphne -b 0.0.0.0 -e ssl:443:privateKey=/etc/daphne/ssl/daphne.key:certKey=/etc/daphne/ssl/daphne.crt config.asgi:application
