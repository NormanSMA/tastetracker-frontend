import { defineStore } from 'pinia';
import api from '@/api/axios';
import { useAuthStore } from './auth';

interface PasswordChangeData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore();

  async function fetchProfile() {
    try {
      const { data } = await api.get('/profile');
      // Actualizar el usuario en el auth store
      authStore.user = data.user || data.data;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async function updateProfile(formData: FormData) {
    try {
      // NO agregamos _method PUT porque la ruta en backend es POST
      const { data } = await api.post('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Actualizar el usuario en el auth store con los nuevos datos
      authStore.user = data.user || data.data;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async function changePassword(passwords: PasswordChangeData) {
    try {
      const { data } = await api.put('/profile/password', passwords);
      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  return { fetchProfile, updateProfile, changePassword };
});
