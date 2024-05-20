#!/bin/bash

set -e

python3 manage.py migrate

touch wsgi.py

python3 manage.py runserver 0.0.0.0:8080
