// ==== imports ต้องอยู่บนสุดเสมอ ====
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import axios from 'axios';
import { api, patchFetchBase } from './apiBase';

// ==== ตั้งค่า baseURL และแพตช์ fetch ====
axios.defaults.baseURL = api.defaults.baseURL;  // => /s65114540260/api
patchFetchBase();                               // รีไรต์ fetch URL เก่าๆ ให้เป็น /s65114540260/api

// ==== render ====
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/s65114540260">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
