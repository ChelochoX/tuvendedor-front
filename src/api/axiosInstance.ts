import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inyectar token automáticamente en cada request si existe
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejo de errores centralizado (puedes personalizar esto)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en petición API:", error);
    return Promise.reject(error);
  }
);

export default instance;
