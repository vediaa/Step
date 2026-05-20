import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Her istekte token ekle + debug log
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Geliştirme sırasında hangi isteğin gittiğini gör
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, token ? "✓ token var" : "✗ token YOK");
  return config;
});

// Hata durumunu logla
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.config.url} →`, response.data?.success, response.data?.message || "");
    return response;
  },
  async (error) => {
    console.log(`[API] ✗ HATA:`, error.message, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;