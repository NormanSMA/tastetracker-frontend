<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Toaster } from 'vue-sonner';

const authStore = useAuthStore();
const isInitializing = ref(true);

onMounted(async () => {
  // Si hay token pero no hay usuario cargado, búscalo
  if (localStorage.getItem('token') && !authStore.user) {
    await authStore.fetchUser();
  }
  isInitializing.value = false;
});
</script>

<template>
  <div v-if="isInitializing" class="fixed inset-0 bg-background flex items-center justify-center z-50">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-muted-foreground text-sm">Cargando...</p>
    </div>
  </div>
  <router-view v-else />
  <Toaster 
    position="top-center" 
    richColors 
    closeButton 
    :duration="4000"
    expand
    :visibleToasts="5"
  />
</template>
