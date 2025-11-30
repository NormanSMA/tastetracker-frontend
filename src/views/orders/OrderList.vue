<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrderStore } from '@/stores/orders';
import { Clock, ChefHat, CheckCircle, Utensils, DollarSign, RefreshCw } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const orderStore = useOrderStore();

onMounted(() => {
  orderStore.fetchOrders();
  // Opcional: Polling cada 30seg
  setInterval(() => orderStore.fetchOrders(), 30000);
});

// Helper para colores de estado
const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    preparing: 'bg-blue-500/10 text-blue-600 border-blue-200',
    ready: 'bg-green-500/10 text-green-600 border-green-200',
    served: 'bg-purple-500/10 text-purple-600 border-purple-200',
    paid: 'bg-gray-500/10 text-gray-600 border-gray-200',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pendiente', preparing: 'Preparando', ready: 'Listo', served: 'Servido', paid: 'Pagado'
  };
  return map[status] || status;
};

// Lógica de siguiente paso
const handleNextStep = async (order: any) => {
  let nextStatus = '';
  if (order.status === 'pending') nextStatus = 'preparing';
  else if (order.status === 'preparing') nextStatus = 'ready';
  else if (order.status === 'ready') nextStatus = 'served';
  else if (order.status === 'served') nextStatus = 'paid';
  
  if (nextStatus) {
    await orderStore.updateOrderStatus(order.id, nextStatus);
  }
};

// Cancelar pedido
const handleCancel = async (orderId: number) => {
  if(!confirm('¿Cancelar este pedido? Esta acción es irreversible.')) return;
  try {
    await orderStore.updateOrderStatus(orderId, 'cancelled');
    toast.success('Pedido cancelado');
  } catch(e) { 
    toast.error('Error al cancelar'); 
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Pedidos Activos</h1>
        <p class="text-muted-foreground">Gestiona el flujo de cocina y sala</p>
      </div>
      <button @click="orderStore.fetchOrders()" class="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors" title="Actualizar">
        <RefreshCw class="w-6 h-6" :class="{ 'animate-spin': orderStore.isLoading }" />
      </button>
    </div>

    <div v-if="orderStore.orders.length === 0 && !orderStore.isLoading" class="text-center py-20 text-muted-foreground">
      <p>No hay pedidos activos en este momento.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="order in orderStore.orders" 
        :key="order.id" 
        class="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col animate-entry"
        :class="{ 'opacity-60': order.status === 'paid' }"
      >
        <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg text-foreground">Mesa {{ order.table_number }}</h3>
            <p class="text-xs text-muted-foreground">{{ order.area }} • {{ order.waiter }}</p>
          </div>
          <span class="px-2 py-1 rounded-md text-xs font-bold border" :class="getStatusColor(order.status)">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>

        <div class="p-4 flex-1 space-y-3">
          <div v-for="(item, idx) in order.items" :key="idx" class="flex gap-2 text-sm">
            <span class="font-bold text-primary w-5 text-center">{{ item.quantity }}x</span>
            <div class="flex-1">
              <span class="text-foreground">{{ item.product_name }}</span>
              <p v-if="item.notes" class="text-xs text-muted-foreground italic">"{{ item.notes }}"</p>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-border bg-muted/10">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-muted-foreground font-medium uppercase">Total</span>
            <span class="text-xl font-bold text-foreground">$ {{ Number(order.total).toFixed(2) }}</span>
          </div>
          
          <div class="flex gap-2">
            <button 
              v-if="order.status === 'pending'"
              @click="handleCancel(order.id)"
              class="px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-bold"
              title="Cancelar Pedido"
            >
              X
            </button>
            
            <button 
              v-if="order.status !== 'paid'"
              @click="handleNextStep(order)"
              class="flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              :class="{
                'bg-yellow-500 hover:bg-yellow-600 text-white': order.status === 'pending',
                'bg-blue-500 hover:bg-blue-600 text-white': order.status === 'preparing',
                'bg-green-500 hover:bg-green-600 text-white': order.status === 'ready',
                'bg-purple-500 hover:bg-purple-600 text-white': order.status === 'served'
              }"
            >
              <ChefHat v-if="order.status === 'pending'" class="w-5 h-5" />
              <Clock v-if="order.status === 'preparing'" class="w-5 h-5" />
              <Utensils v-if="order.status === 'ready'" class="w-5 h-5" />
              <DollarSign v-if="order.status === 'served'" class="w-5 h-5" />
              
              <span v-if="order.status === 'pending'">Pasar a Cocina</span>
              <span v-if="order.status === 'preparing'">Marcar Listo</span>
              <span v-if="order.status === 'ready'">Entregar a Mesa</span>
              <span v-if="order.status === 'served'">Cobrar Pedido</span>
            </button>
          </div>
          
          <div v-if="order.status === 'paid'" class="text-center text-sm font-bold text-green-600 flex items-center justify-center gap-1">
            <CheckCircle class="w-4 h-4" /> Completado
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
