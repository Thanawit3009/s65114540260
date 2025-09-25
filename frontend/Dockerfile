# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# ต้องมี "homepage": "/s65114540260/" ก่อนค่อย build
RUN npm run build

# ---------- Serve ----------
FROM caddy:2-alpine
COPY --from=build /app/build /srv/s65114540260
COPY <<'CADDYFILE' /etc/caddy/Caddyfile
:80 {
  root * /srv
  try_files {path} /s65114540260/index.html
  file_server
}
CADDYFILE
