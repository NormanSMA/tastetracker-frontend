import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Interceptor para inyectar token
api.interceptors.request.use(config => {
    // 1. Buscar en localStorage (si marcó "Mantener sesión")
    let token = localStorage.getItem('token');
    
    // 2. Si no está, buscar en sessionStorage (si NO marcó)
    if (!token) {
        token = sessionStorage.getItem('token');
    }

    // 3. Si existe, inyectarlo
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
