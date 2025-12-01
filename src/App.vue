<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Toaster } from 'vue-sonner';

const authStore = useAuthStore();

onMounted(async () => {
  // Si hay token pero no hay usuario cargado, búscalo
  if (localStorage.getItem('token') && !authStore.user) {
    await authStore.fetchUser();
  }
});
</script>

<template>
  <router-view />
  <Toaster position="top-center" richColors closeButton />
</template>
