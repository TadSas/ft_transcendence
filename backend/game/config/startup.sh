#!/bin/bash

set -e

python3 manage.py migrate

touch wsgi.py

daphne -b 0.0.0.0 -p 8081 game.asgi:application
