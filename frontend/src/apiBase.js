// frontend/src/apiBase.js
import axios from "axios";

export const API_BASE = `${process.env.PUBLIC_URL}/api`;   // -> /s65114540260/api
export const MEDIA_BASE = process.env.PUBLIC_URL;          // -> /s65114540260

// ----- axios instance -----
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// ใส่ JWT อัตโนมัติถ้ามี
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ----- แพตช์ fetch ให้ rewrite URL เก่า ๆ -----
export function patchFetchBase() {
  const _fetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    let url = typeof input === "string" ? input : input.url;

    // กรณีฮาร์ดโค้ดแบบเดิม
    if (url.startsWith("http://localhost:8000/api")) {
      url = API_BASE + url.replace(/^http:\/\/localhost:8000\/api/, "");
    }
    // บางไฟล์เขียนเป็น ':8000/api/...'
    else if (url.startsWith(":8000/api")) {
      url = API_BASE + url.replace(/^:8000\/api/, "");
    }
    // กรณีเขียนเป็น '/api/...'
    else if (url.startsWith("/api")) {
      url = API_BASE + url.slice(4);
    }

    // เติม Authorization ถ้ามี
    const token = localStorage.getItem("token");
    const headers = new Headers(init?.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return _fetch(url, { ...init, headers });
  };
}

// helper สำหรับรูป/media จาก backend ที่คืนพาธแบบ '/media/...'
export function mediaUrl(path) {
  if (!path) return "";
  return `${MEDIA_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
