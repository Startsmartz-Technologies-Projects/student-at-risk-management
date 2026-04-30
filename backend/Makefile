.PHONY: install migrate makemigrations run seed test lint format up down worker

install:
	pip install -r requirements/dev.txt

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

run:
	python manage.py runserver 0.0.0.0:8000

seed:
	python manage.py seed_demo

evaluate:
	python manage.py evaluate_risk --week 4
	python manage.py evaluate_risk --week 8

test:
	pytest -q

lint:
	ruff check .
	black --check .
	isort --check-only .

format:
	ruff check . --fix
	black .
	isort .

up:
	docker compose up --build

down:
	docker compose down

worker:
	celery -A config worker -l info
