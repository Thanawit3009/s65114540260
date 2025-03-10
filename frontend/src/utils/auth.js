import axios from 'axios';

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:8000/api/auth/login/', { email, password });
    const { access, refresh, is_admin, user } = response.data;

    if (!user || !user.id) {
      throw new Error("Login response does not contain user ID.");
    }

    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_id', user.id); // ✅ เพิ่มการบันทึก user_id
    localStorage.setItem('is_admin', is_admin);

    console.log("✅ Login Success: User ID =", user.id); // Debug

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      alert('Invalid email or password. Please try again.');
    } else {
      alert('An error occurred during login. Please try again later.');
    }
    throw error;
  }
};

export const refreshAccessToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) {
    alert("Your session has expired. Please log in again.");
    localStorage.clear();
    throw new Error('Refresh token not found');
  }

  try {
    const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
      refresh: refresh_token,
    });

    const { access } = response.data;
    localStorage.setItem('token', access);
    return access;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    localStorage.clear();
    alert("Your session has expired. Please log in again.");
    throw error;
  }
};

let isAuthenticatedCache = null;

export const isAuthenticated = async () => {
  if (isAuthenticatedCache !== null) {
    return isAuthenticatedCache;
  }

  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    await axios.get('http://localhost:8000/api/auth/verify/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    isAuthenticatedCache = true;
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshAccessToken();
        isAuthenticatedCache = true;
        return true;
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError.message);
        isAuthenticatedCache = false;
        return false;
      }
    }
    isAuthenticatedCache = false;
    return false;
  }
};

export const isAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("No token found. User might not be logged in.");
    return false;
  }

  const is_admin = localStorage.getItem('is_admin');
  return is_admin === "true";
};
