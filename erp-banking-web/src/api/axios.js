import axios from "axios";

const backendUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080")
    .replace(/\/$/, "");

const api = axios.create({
    baseURL: `${backendUrl}/api`
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    } else {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

export default api;