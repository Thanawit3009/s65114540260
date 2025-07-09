#!/bin/sh

echo "⏳ Waiting for MySQL at $DB_HOST:$DB_PORT..."

# loop รอจนกว่าจะเชื่อมต่อ MySQL ได้
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "✅ MySQL is up - running migrations and server..."

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
