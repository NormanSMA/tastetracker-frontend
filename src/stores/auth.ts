import { defineStore } from 'pinia';
import api from '@/api/axios';
import { ref, computed } from 'vue';
import type { User } from './users';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const token = ref(localStorage.getItem('token') || '');

    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');

    async function login(credentials: any) {
        try {
            const response = await api.post('/login', credentials);
            token.value = response.data.access_token;
            user.value = response.data.user;
            localStorage.setItem('token', token.value);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async function logout() {
        try {
            if (token.value) await api.post('/logout');
        } catch (e) {
            console.error(e);
        } finally {
            token.value = '';
            user.value = null;
            localStorage.removeItem('token');
            // router.push('/login'); // Se manejará en el componente
        }
    }

    async function fetchUser() {
        if (!token.value) return;
        try {
            const response = await api.get('/user-profile');
            
            // Manejar diferentes estructuras de respuesta
            user.value = response.data.user || response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            logout();
        }
    }

    return { user, token, isAuthenticated, isAdmin, login, logout, fetchUser };
});
