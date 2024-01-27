#!/bin/bash
set -e

# Generate openssl certificate
mkdir -p /etc/daphne/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/daphne/ssl/daphne.key \
        -out /etc/daphne/ssl/daphne.crt \
        -subj "/C=KR/L=Seoul/O=42Seoul/CN=nginx" \
        > /dev/null 2>&1


# Execute da


daphne -b 0.0.0.0 -e ssl:443:privateKey=/etc/daphne/ssl/daphne.key:certKey=/etc/daphne/ssl/daphne.crt config.asgi:application
