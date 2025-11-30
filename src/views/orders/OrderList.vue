<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useOrderStore } from '@/stores/orders';
import { Clock, ChefHat, CheckCircle, Utensils, DollarSign, RefreshCw, History, Filter } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const orderStore = useOrderStore();
const activeTab = ref('active'); 
let intervalId: any;

onMounted(() => {
  orderStore.fetchOrders();
  intervalId = setInterval(() => orderStore.fetchOrders(), 15000);
});

onUnmounted(() => clearInterval(intervalId));

const filteredOrders = computed(() => {
  const all = orderStore.orders;
  if (activeTab.value === 'active') return all.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
  else if (activeTab.value === 'history') return all.filter(o => o.status === 'paid').slice(0, 20); 
  else return all.filter(o => o.status === activeTab.value);
});

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handleNextStep = async (order: any) => {
  let next = '';
  if (order.status === 'pending') next = 'preparing';
  else if (order.status === 'preparing') next = 'ready';
  else if (order.status === 'ready') next = 'served';
  else if (order.status === 'served') next = 'paid';
  if (next) await orderStore.updateOrderStatus(order.id, next);
};

const handleCancel = async (orderId: number) => {
  if(!confirm('¿Cancelar este pedido?')) return;
  try {
    await orderStore.updateOrderStatus(orderId, 'cancelled');
    toast.success('Pedido cancelado');
  } catch(e) { toast.error('Error al cancelar'); }
};

const tabs = [
  { id: 'active', label: 'Activos', icon: ChefHat },
  { id: 'pending', label: 'Pendientes', icon: Clock },
  { id: 'preparing', label: 'Cocinando', icon: Utensils },
  { id: 'ready', label: 'Listos', icon: CheckCircle },
  { id: 'history', label: 'Historial', icon: History },
];
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Cocina y Barra</h1>
        <p class="text-muted-foreground">Flujo de trabajo en tiempo real</p>
      </div>
      <div class="flex bg-muted p-1 rounded-lg overflow-x-auto max-w-full">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" class="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap" :class="activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">
          <component :is="tab.icon" class="w-4 h-4" /> {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="filteredOrders.length === 0" class="text-center py-20 opacity-50">
      <Filter class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <p class="text-xl">No hay pedidos en esta sección</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-entry">
      <div v-for="order in filteredOrders" :key="order.id" class="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md" :class="{'border-l-4 border-l-yellow-500': order.status === 'pending', 'border-l-4 border-l-blue-500': order.status === 'preparing', 'border-l-4 border-l-green-500': order.status === 'ready'}">
        <div class="p-3 border-b border-border bg-muted/20 flex justify-between items-start">
          <div>
            <div class="flex items-center gap-2">
               <h3 class="font-bold text-lg">Mesa {{ order.table_number }}</h3>
               <span class="text-xs font-mono bg-background px-1 rounded border">{{ formatTime(order.created_at) }}</span>
            </div>
            <p class="text-xs text-muted-foreground">{{ order.area }}</p>
          </div>
          <span class="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-muted text-foreground">{{ order.status }}</span>
        </div>

        <div class="p-3 flex-1 space-y-2 overflow-y-auto max-h-60">
          <div v-for="(item, idx) in order.items" :key="idx" class="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
            <div class="flex justify-between">
               <span class="font-bold text-primary">{{ item.quantity }}x</span>
               <span class="flex-1 mx-2">{{ item.product_name }}</span>
            </div>
            <p v-if="item.notes" class="text-xs text-orange-500 italic mt-0.5 ml-6">⚠️ {{ item.notes }}</p>
          </div>
        </div>

        <div class="p-3 bg-muted/10 border-t border-border mt-auto">
           <p v-if="order.notes" class="text-xs text-muted-foreground mb-3 italic">Nota Global: {{ order.notes }}</p>
           
           <div class="flex gap-2" v-if="order.status !== 'paid'">
             <button v-if="order.status === 'pending'" @click="handleCancel(order.id)" class="px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-bold" title="Cancelar Pedido">X</button>
             
             <button @click="handleNextStep(order)" class="flex-1 py-2 rounded-lg font-bold text-white text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm" :class="{'bg-yellow-500 hover:bg-yellow-600': order.status === 'pending', 'bg-blue-500 hover:bg-blue-600': order.status === 'preparing', 'bg-green-500 hover:bg-green-600': order.status === 'ready', 'bg-purple-500 hover:bg-purple-600': order.status === 'served'}">
                <span v-if="order.status === 'pending'">Comenzar</span>
                <span v-if="order.status === 'preparing'">Terminar</span>
                <span v-if="order.status === 'ready'">Entregar</span>
                <span v-if="order.status === 'served'">Cobrar</span>
             </button>
           </div>
           
           <div v-else class="text-center text-sm font-bold text-green-600 flex items-center justify-center gap-1"><CheckCircle class="w-4 h-4" /> Completado</div>
        </div>
      </div>
    </div>
  </div>
</template>
