<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import ThemeToggle from '@/components/common/ThemeToggle.vue';
import api from '@/api/axios';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Users, 
  LogOut, 
  Menu,
  ClipboardList,
  Bell
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const isSidebarOpen = ref(true);

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
      class="bg-card border-r border-border transition-all duration-300 flex flex-col fixed md:relative z-20 h-full"
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
           <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0">
              {{ authStore.user.name.charAt(0) }}
           </div>
           <div class="flex-1 overflow-hidden">
             <p class="text-sm font-medium truncate text-foreground" :title="authStore.user.name">{{ authStore.user.name }}</p>
             <p class="text-xs text-muted-foreground truncate capitalize">{{ authStore.user.role }}</p>
           </div>
        </div>
        
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
      <header class="h-16 bg-card border-b border-border flex items-center px-6 justify-between shrink-0 z-10 relative">
        <button @click="isSidebarOpen = !isSidebarOpen" class="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground">
          <Menu class="w-6 h-6" />
        </button>
        
        <div class="ml-auto flex items-center gap-3">
           <button 
             @click="goToKitchen"
             class="relative p-2 rounded-full hover:bg-muted text-foreground transition-colors mr-1" 
             title="Ir a Cocina (Pedidos Pendientes)"
           >
             <Bell class="w-5 h-5" />
             <span 
               v-if="pendingCount > 0" 
               class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-sm border border-background animate-pulse"
             >
               {{ pendingCount }}
             </span>
           </button>

           <ThemeToggle />

           <div class="font-medium text-foreground hidden sm:block ml-2 border-l border-border pl-4" v-if="authStore.user">
              Hola, {{ authStore.user.name }}
           </div>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-4 md:p-6 relative w-full">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
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
</style>
