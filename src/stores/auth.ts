import { defineStore } from 'pinia';
import api from '@/api/axios';
import { ref, computed, watch } from 'vue';
import type { User } from './users';
import { useIdle } from '@vueuse/core';
import { toast } from 'vue-sonner';

export const useAuthStore = defineStore('auth', () => {
    // 1. Inicialización de Estado (Buscando en ambos storages)
    const token = ref(localStorage.getItem('token') || sessionStorage.getItem('token') || '');
    
    // Intentar recuperar usuario de storage si existe
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null);
    
    // Flag para saber si es sesión persistente
    const isPersistent = ref(!!localStorage.getItem('token'));

    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => user.value?.role === 'admin');

    // 2. Sistema de Inactividad (3 minutos = 180000 ms)
    // useIdle detecta automáticamente: mouse, click, key, scroll
    const { idle } = useIdle(3 * 60 * 1000); 

    watch(idle, (isIdle) => {
        // Solo cerrar sesión si está inactivo, autenticado Y NO es persistente
        if (isIdle && isAuthenticated.value && !isPersistent.value) {
            console.log('💤 Sesión cerrada por inactividad');
            logout(true); // true = por inactividad
        }
    });

    // 3. Login con soporte para "Recordarme"
    async function login(credentials: { email: string, password: string, rememberMe: boolean }) {
        try {
            const response = await api.post('/login', {
                email: credentials.email,
                password: credentials.password
            });
            
            token.value = response.data.access_token;
            user.value = response.data.user;
            isPersistent.value = credentials.rememberMe;

            // Guardar en el storage correspondiente
            if (credentials.rememberMe) {
                localStorage.setItem('token', token.value);
                localStorage.setItem('user', JSON.stringify(user.value));
                // Limpiar session por si acaso
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
            } else {
                sessionStorage.setItem('token', token.value);
                sessionStorage.setItem('user', JSON.stringify(user.value));
                // Limpiar local por si acaso
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    // 4. Logout (Limpieza total)
    async function logout(isAutoLogout = false) {
        try {
            if (token.value && !isAutoLogout) await api.post('/logout');
        } catch (e) {
            console.error(e);
        } finally {
            token.value = '';
            user.value = null;
            isPersistent.value = false;
            
            // Limpiar ambos storages
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');

            if (isAutoLogout) {
                toast.info('Tu sesión ha expirado por inactividad');
                // Forzar recarga o redirección si es necesario
                window.location.href = '/login';
            }
        }
    }

    async function fetchUser() {
        if (!token.value) return;
        try {
            const response = await api.get('/user-profile');
            user.value = response.data.user || response.data.data || response.data;
            
            // Actualizar el usuario en el storage que corresponda
            if (isPersistent.value) {
                localStorage.setItem('user', JSON.stringify(user.value));
            } else {
                sessionStorage.setItem('user', JSON.stringify(user.value));
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            logout();
        }
    }

    return { user, token, isAuthenticated, isAdmin, login, logout, fetchUser };
});
