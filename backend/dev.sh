#!/usr/bin/env bash
# Quick dev launcher: activates venv and starts the Django server.
# Usage: ./dev.sh
set -e
source .venv/Scripts/activate
python manage.py runserver
