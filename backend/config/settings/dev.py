from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

# In dev, let any client (including the local Next.js frontend) read the API
# without a JWT so you can see real data immediately. Write endpoints that need
# admin/coordinator role still enforce permissions individually.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,  # noqa: F405
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
}

# Allow the frontend dev server to call the API.
CORS_ALLOW_ALL_ORIGINS = True
