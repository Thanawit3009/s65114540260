# base image ที่ปลอดภัยและเบา
FROM node:20.14.0-slim AS build

WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกโค้ดทั้งหมดและ build
COPY . .
RUN npm run build

# stage สำหรับ serve
FROM nginx:alpine

# copy build files ไปที่ nginx public dir
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
