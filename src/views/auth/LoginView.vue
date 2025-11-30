<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-vue-next';
import ThemeToggle from '@/components/common/ThemeToggle.vue';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
    router.push('/dashboard');
  } catch (error: any) {
    if (error.response?.status === 401) {
      errorMessage.value = 'Credenciales incorrectas.';
    } else if (error.response?.status === 403) {
       errorMessage.value = 'Cuenta inactiva.';
    } else {
      errorMessage.value = 'Error de conexión.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4 relative transition-colors duration-300">
    
    <div class="absolute top-4 right-4">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8">
      
      <div class="flex flex-col items-center mb-8">
        <img src="/logo-taste.png" alt="TasteTracker" class="w-20 h-20 mb-4 object-contain" />
        <h1 class="text-2xl font-bold text-foreground">Bienvenido</h1>
        <p class="text-muted-foreground text-sm">Gestiona tu restaurante</p>
      </div>

      <div v-if="errorMessage" class="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-center font-medium">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Correo</label>
          <div class="relative">
            <Mail class="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input v-model="email" type="email" required class="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" placeholder="correo@ejemplo.com" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Contraseña</label>
          <div class="relative">
            <Lock class="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              required
              class="w-full pl-10 pr-10 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" 
              placeholder="••••••••"
            />
            
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
              <EyeOff v-if="showPassword" class="h-5 w-5" />
              <Eye v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:opacity-90 flex justify-center mt-6 disabled:opacity-70">
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin mr-2" />
          {{ isLoading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>
