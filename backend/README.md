# Student Risk Management — Backend

Django 5 + DRF + PostgreSQL backend for the Student at Potential Risk Management system.

## Stack

- Python 3.12, Django 5, Django REST Framework
- PostgreSQL 16, Redis 7
- Celery (async notification dispatch)
- JWT auth via `djangorestframework-simplejwt`
- OpenAPI docs via `drf-spectacular`

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Then:
- API: http://localhost:8000/api/
- Swagger UI: http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/

## Quick start (local)

Requires Python 3.12 + a running PostgreSQL + Redis.

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements/dev.txt
cp .env.example .env

make migrate
make seed                          # creates demo users + students
make run                           # starts Django on :8000
make worker                        # in another terminal: starts Celery
```

Demo users (after `make seed`):
- `admin@srm.local` / `admin123` (admin)
- `coordinator@srm.local` / `coord123` (coordinator)

## Risk evaluation

Run via management command:

```bash
python manage.py evaluate_risk --week 4
python manage.py evaluate_risk --week 8
```

Or via API:

```bash
POST /api/risk/evaluate/   { "week": 4 }
```

## Project layout

```
config/        # settings split (base/dev/prod), urls, celery
apps/
  common/      # TimeStampedModel base, role permissions
  accounts/    # custom User, JWT auth
  students/    # Student, Subject, Enrollment + bulk Excel upload
  metrics/     # WeeklyMetric (W4 / W8)
  risk/        # evaluation engine, ActionLog, management command, Celery task
  notifications/  # Email/SMS dispatch + log
  reports/     # consolidated view + Excel export
```

## Endpoints (high-level)

| Path | Verb | Notes |
| --- | --- | --- |
| `/api/auth/login/` | POST | JWT pair |
| `/api/auth/refresh/` | POST | Refresh access token |
| `/api/auth/me/` | GET | Current user |
| `/api/students/` | CRUD | Students |
| `/api/students/bulk-upload/` | POST | Excel upload |
| `/api/subjects/` | CRUD | Subjects |
| `/api/enrollments/` | CRUD | Enrollments |
| `/api/metrics/` | CRUD | Weekly metrics |
| `/api/metrics/bulk/` | POST | Array upsert |
| `/api/risk/assessments/` | GET | Filter by week / is_at_risk / student / subject |
| `/api/risk/evaluate/` | POST | Run engine for a week |
| `/api/risk/assessments/{id}/actions/` | POST | Log an action |
| `/api/notifications/` | GET | Log + filters |
| `/api/notifications/send/` | POST | Queue per-week dispatch |
| `/api/reports/consolidated/` | GET | Per-student aggregate |
| `/api/reports/export.xlsx` | GET | Streamed Excel |
| `/api/docs/` | GET | Swagger UI |

## Tests

```bash
pytest -q
```

Coverage focus: `apps.risk.services` (engine rules) and `apps.reports.selectors` (aggregation).

## Lint / format

```bash
make lint
make format
```
