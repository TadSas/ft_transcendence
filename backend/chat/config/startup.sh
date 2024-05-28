#!/bin/bash

set -e

vlt login
vlt config init --organization 030114ab-3ea6-483c-9d7f-ed12850eeee3 --project ft_transcendence --app-name ft-transcendence --non-interactive
vlt run -- env > updated_env.txt

chmod +x ./config/set_env.sh

source ./config/set_env.sh updated_env.txt

rm updated_env.txt

python3 manage.py migrate

touch wsgi.py

daphne -b 0.0.0.0 -p 8082 chat.asgi:application
