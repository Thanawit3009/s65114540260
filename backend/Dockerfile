FROM python:3.11-slim-bookworm

WORKDIR /app

# ✅ ติดตั้ง dependencies สำหรับ mysqlclient
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    netcat-openbsd \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ✅ ให้สิทธิ์รัน shell script
RUN chmod +x wait-for-db.sh

# ✅ ใช้ shell script เป็น entrypoint
CMD ["./wait-for-db.sh"]
