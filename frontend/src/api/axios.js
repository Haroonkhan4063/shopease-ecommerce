import axios from "axios";

// Set VITE_API_URL in a .env file at the frontend root, e.g.:
// VITE_API_URL=http://localhost:5000/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the saved JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendorhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, boot the user back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("vendorhub_token");
      localStorage.removeItem("vendorhub_user");
    }
    return Promise.reject(error);
  }
);

export default api;
