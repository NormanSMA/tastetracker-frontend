import { defineStore } from 'pinia';
import api from '@/api/axios';
import { ref } from 'vue';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'waiter' | 'kitchen' | 'customer';
  photo_url: string | null;
  phone: string | null;
  is_active: boolean;
}

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const isLoading = ref(false);

  async function fetchUsers() {
    isLoading.value = true;
    try {
      // Necesitaremos crear este endpoint en Backend luego, asume /users
      const { data } = await api.get('/users'); 
      users.value = data.data ? data.data : data; 
    } catch (e) { console.error(e); } 
    finally { isLoading.value = false; }
  }

  async function createUser(userData: FormData) {
    const { data } = await api.post('/users', userData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    users.value.unshift(data.user || data.data); 
  }

  async function updateUser(id: number, userData: FormData) {
    userData.append('_method', 'PUT');
    const { data } = await api.post(`/users/${id}`, userData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    const index = users.value.findIndex(u => u.id === id);
    if (index !== -1) users.value[index] = data.user || data.data;
  }

  async function deleteUser(id: number) {
    await api.delete(`/users/${id}`);
    users.value = users.value.filter(u => u.id !== id);
  }

  return { users, isLoading, fetchUsers, createUser, updateUser, deleteUser };
});
