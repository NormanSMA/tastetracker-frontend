<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Mail, Lock, Loader2, Eye, EyeOff, Zap, BarChart3, Shield } from 'lucide-vue-next';
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
  <div class="min-h-screen flex relative overflow-hidden">
    
    <!-- Lado Izquierdo: Imagen de Fondo con Features -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-orange-700">
      <!-- Imagen de Fondo -->
      <div class="absolute inset-0 opacity-30">
        <img src="/fondo-login.jpg" alt="Restaurant" class="w-full h-full object-cover" />
      </div>
      
      <!-- Overlay Oscuro -->
      <div class="absolute inset-0 bg-black/60"></div>
      
      <!-- Contenido -->
      <div class="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        
        <!-- Logo y Título -->
        <div>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <img src="/logo-taste.png" alt="TasteTracker" class="w-8 h-8 object-contain" />
            </div>
            <span class="text-2xl font-bold">TasteTracker</span>
          </div>

          <h1 class="text-3xl font-bold mb-3 leading-tight">
            Gestión inteligente de<br />tu restaurante
          </h1>
          
          <p class="text-sm text-white/80 mb-8 max-w-md">
            Controla pedidos, mesas, menú y clientes en una sola plataforma pensada para equipos que no tienen tiempo que perder.
          </p>
        </div>

        <!-- Features -->
        <div class="space-y-4">
          <!-- Gestión Rápida -->
          <div class="flex items-start gap-3 group">
            <div class="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
              <Zap class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-base font-bold mb-0.5">Gestión Rápida</h3>
              <p class="text-white/70 text-xs">Procesa pedidos en segundos</p>
            </div>
          </div>

          <!-- Control Total -->
          <div class="flex items-start gap-3 group">
            <div class="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
              <BarChart3 class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-base font-bold mb-0.5">Control Total</h3>
              <p class="text-white/70 text-xs">Menú y clientes centralizados</p>
            </div>
          </div>

          <!-- Seguridad Garantizada -->
          <div class="flex items-start gap-3 group">
            <div class="w-11 h-11 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
              <Shield class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-base font-bold mb-0.5">Seguridad Garantizada</h3>
              <p class="text-white/70 text-xs">Datos protegidos 24/7</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-2 pt-6 border-t border-white/20">
          <div class="flex -space-x-2">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white"></div>
            <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full border-2 border-white"></div>
            <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full border-2 border-white"></div>
          </div>
          <p class="text-white/80 text-xs">Más de 500+ restaurantes confían en nosotros</p>
        </div>
      </div>
    </div>

    <!-- Lado Derecho: Formulario de Login -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background relative">
      
      <!-- Theme Toggle -->
      <div class="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <!-- Logo Móvil -->
      <div class="lg:hidden absolute top-6 left-6 flex items-center gap-2">
        <img src="/logo-taste.png" alt="TasteTracker" class="w-8 h-8 object-contain" />
        <span class="text-xl font-bold text-foreground">TasteTracker</span>
      </div>

      <!-- Formulario -->
      <div class="w-full max-w-md pt-20 lg:pt-0">
        
        <!-- Encabezado -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-foreground mb-2">¡Bienvenido!</h2>
          <p class="text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder al sistema
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            Accede a tu panel para gestionar pedidos, menú y clientes.
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-center font-medium">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          
          <!-- Email -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-foreground uppercase tracking-wide">Correo Electrónico</label>
            <div class="relative">
              <Mail class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input 
                v-model="email" 
                type="email" 
                required 
                class="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="tu@email.com" 
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-foreground uppercase tracking-wide">Contraseña</label>
            <div class="relative">
              <Lock class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                class="w-full pl-11 pr-12 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                placeholder="••••••••"
              />
              
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
                <EyeOff v-if="showPassword" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </button>
            </div>
          </div>



          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="isLoading" 
            class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
            <span>{{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
          </button>
        </form>

      </div>
    </div>
  </div>
</template>
