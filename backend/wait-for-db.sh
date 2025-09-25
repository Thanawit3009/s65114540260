#!/usr/bin/env sh
set -e

# ค่าเริ่มต้น (ตรงกับ docker-compose)
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo "⏳ Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT} ..."
# รอจนกว่า Postgres จะรับการเชื่อมต่อได้
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "✅ PostgreSQL is up — applying migrations..."
python manage.py migrate --noinput

echo "🚀 Starting Gunicorn..."
exec gunicorn backend.wsgi:application -b 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-3}" \
  --timeout "${GUNICORN_TIMEOUT:-120}"
