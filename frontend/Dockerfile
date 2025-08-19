# stage build
FROM node:20.14.0-slim AS build

WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# คัดลอกโค้ดทั้งหมดและ build
COPY . .
RUN npm run build

# stage serve ด้วย nginx
FROM nginx:alpine

# copy build files ไปที่ nginx public dir
COPY --from=build /app/build /usr/share/nginx/html

# copy nginx config เพื่อรองรับ React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
