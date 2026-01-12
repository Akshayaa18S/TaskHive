import axios from 'axios';

// Read API URL from environment variable
// Falls back to localhost for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL not set. Using default:', API_URL);
}

const api = axios.create({
  baseURL: API_URL
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
