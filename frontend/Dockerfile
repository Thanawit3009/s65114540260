# base image ที่ปลอดภัยและเบา
FROM node:20.14.0-slim

WORKDIR /app

# ติดตั้ง dependencies ก่อน
COPY package*.json ./
RUN npm install

# คัดลอกไฟล์ frontend ทั้งหมด
COPY . .

# เปิดพอร์ต React
EXPOSE 3000

# รันแอป
CMD ["npm", "start"]
