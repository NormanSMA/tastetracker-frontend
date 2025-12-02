<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import ThemeToggle from '@/components/common/ThemeToggle.vue';
import api from '@/api/axios';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Users, 
  LogOut,
  ClipboardList,
  UserCircle2
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isSidebarOpen = ref(true);

// DEBUG TEMPORAL
console.log('Usuario en Store:', authStore.user);
console.log('URL Foto:', authStore.user?.photo_url);

const pendingCount = ref(0);

const checkPendingOrders = async () => {
  try {
    const { data } = await api.get('/orders');
    const orders = data.data || data;
    // Contamos solo los pendientes
    pendingCount.value = orders.filter((o: any) => o.status === 'pending').length;
  } catch (e) {}
};

const goToKitchen = () => {
  router.push('/orders/list');
};

onMounted(() => {
  if (!authStore.user) {
    authStore.fetchUser();
  }
  checkPendingOrders();
  setInterval(checkPendingOrders, 15000); // Polling cada 15s
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Crear Pedido', path: '/orders', icon: ShoppingBag },
  { name: 'Cocina / Estados', path: '/orders/list', icon: ClipboardList },
  { name: 'Menú', path: '/products', icon: UtensilsCrossed },
  // adminOnly: true hace que solo se muestre si eres admin
  { name: 'Usuarios', path: '/users', icon: Users, adminOnly: true }, 
];
</script>

<template>
  <div class="min-h-screen bg-background flex">
    
    <aside 
      class="bg-card border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0"
      :class="isSidebarOpen ? 'w-64' : 'w-20'"
    >
      <div class="h-16 flex items-center justify-center border-b border-border">
        <img src="/logo-taste.png" alt="Logo" class="w-8 h-8 object-contain" />
        <span v-if="isSidebarOpen" class="ml-3 font-bold text-xl text-primary truncate">TasteTracker</span>
      </div>

      <nav class="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        <template v-for="item in menuItems" :key="item.path">
          <router-link 
            v-if="!item.adminOnly || authStore.isAdmin"
            :to="item.path"
            class="flex items-center px-3 py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors group"
            active-class="bg-primary/10 text-primary font-medium"
          >
            <component :is="item.icon" class="w-6 h-6 shrink-0" />
            <span v-if="isSidebarOpen" class="ml-3 transition-opacity duration-200 whitespace-nowrap">{{ item.name }}</span>
          </router-link>
        </template>
      </nav>

      <div class="p-4 border-t border-border bg-card/50">
        <div class="flex items-center gap-3 mb-4 px-2" v-if="isSidebarOpen && authStore.user">
           <div class="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-primary/20">
             <img 
               v-if="authStore.user.photo_url" 
               :src="authStore.user.photo_url" 
               :alt="authStore.user.name"
               class="w-full h-full object-cover"
             />
             <img 
               v-else
               :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user.name)}&background=random&size=128`"
               :alt="authStore.user.name"
               class="w-full h-full object-cover"
             />
           </div>
           <div class="flex-1 overflow-hidden">
             <p class="text-sm font-medium truncate text-foreground" :title="authStore.user.name">{{ authStore.user.name }}</p>
             <p class="text-xs text-muted-foreground truncate capitalize">{{ authStore.user.role }}</p>
           </div>
        </div>
        
        <router-link
          v-if="isSidebarOpen"
          to="/profile"
          class="w-full flex items-center px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors mb-2"
        >
          <UserCircle2 class="w-5 h-5 shrink-0" />
          <span class="ml-2">Mi Perfil</span>
        </router-link>
        
        <button 
          @click="handleLogout"
          class="w-full flex items-center justify-center px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
          :title="isSidebarOpen ? '' : 'Cerrar Sesión'"
        >
          <LogOut class="w-5 h-5 shrink-0" />
          <span v-if="isSidebarOpen" class="ml-2">Salir</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <header class="bg-card border-b border-border shadow-sm px-6 py-4 flex justify-between items-center z-10">
        <!-- Saludo a la Izquierda (solo en Dashboard) -->
        <div v-if="route.path === '/dashboard'" class="flex flex-col">
          <h2 class="text-xl font-bold text-foreground">
            Hola Bienvenido, <span class="text-primary">{{ authStore.user?.name || 'Usuario' }}</span>
          </h2>
          <p class="text-xs text-muted-foreground font-medium">
            {{ new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>

        <!-- Solo Fecha (en otras páginas) -->
        <div v-else class="flex items-center">
          <p class="text-sm text-muted-foreground font-medium">
            {{ new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>

        <!-- Iconos a la Derecha -->
        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- Notificaciones / Ir a Cocina -->
          <button 
            @click="goToKitchen"
            class="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
            title="Ir a Cocina (Pedidos Pendientes)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span 
              v-if="pendingCount > 0" 
              class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm border border-background animate-pulse"
            >
              {{ pendingCount }}
            </span>
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-4 md:p-6 relative w-full">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Personalización del Scrollbar para el menú */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 20px;
}

/* Transición de fade para router-view */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
