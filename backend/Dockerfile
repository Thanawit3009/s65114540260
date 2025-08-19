FROM python:3.11-slim-bookworm

WORKDIR /app

# ติดตั้ง dependencies สำหรับ PostgreSQL + psql client
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    pkg-config \
    netcat-openbsd \
    postgresql-client \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x wait-for-db.sh

CMD ["./wait-for-db.sh"]
