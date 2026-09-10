import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — log out silently
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear local storage
      const isAuthRoute =
        err.config.url.includes("/auth/login") ||
        err.config.url.includes("/auth/register");
      if (!isAuthRoute) {
        localStorage.removeItem("cs_token");
        localStorage.removeItem("cs_user");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
