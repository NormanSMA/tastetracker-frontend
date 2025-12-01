<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useOrderStore } from '@/stores/orders';
import { useAuthStore } from '@/stores/auth';
import { Clock, ChefHat, Utensils, History, Printer, ArrowRight, X } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import Receipt from '@/components/Receipt.vue';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const orderStore = useOrderStore();
const authStore = useAuthStore();
const activeTab = ref('board'); 
const printingOrder = ref<any>(null);
let intervalId: any;

onMounted(() => {
  orderStore.fetchOrders();
  intervalId = setInterval(() => orderStore.fetchOrders(), 15000);
});

onUnmounted(() => clearInterval(intervalId));

// Computed properties para las columnas del Kanban
const pendingOrders = computed(() => orderStore.orders.filter(o => o.status === 'pending'));
const inProcessOrders = computed(() => orderStore.orders.filter(o => o.status === 'preparing' || o.status === 'ready'));
const toPayOrders = computed(() => orderStore.orders.filter(o => o.status === 'served'));
const historyOrders = computed(() => orderStore.orders.filter(o => o.status === 'paid' || o.status === 'cancelled').slice(0, 20));

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
  
  if (next) await orderStore.updateOrderStatus(order.id, next);
};

const handlePay = async (order: any) => {
  try {
    // 1. PRIMERO COBRAR (Esto es lo importante)
    await orderStore.updateOrderStatus(order.id, 'paid');
    toast.success('¡Pedido cobrado correctamente!'); // Éxito inmediato

    // 2. LUEGO INTENTAR GENERAR PDF
    try {
        printingOrder.value = order;
        await nextTick(); // Esperar a que se renderice el ticket invisible
        const element = document.getElementById('receipt-content');
        const opt = {
            margin: 0,
            filename: `ticket_${order.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            // CORRECCIÓN CRÍTICA: Fondo blanco para evitar error 'oklch'
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
    } catch (pdfError) {
        console.error('Error generando PDF:', pdfError);
        toast.warning('Cobrado, pero hubo un problema generando el PDF');
    } finally {
        // Limpiar siempre
        setTimeout(() => { printingOrder.value = null; }, 1000);
    }
  } catch (apiError) { 
    // Este catch solo salta si falla el BACKEND (el cobro real)
    console.error(apiError);
    toast.error('Error crítico al conectar con el servidor');
  }
};

const handleCancel = async (orderId: number) => {
  if (!confirm('¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.')) return;
  try {
    await orderStore.updateOrderStatus(orderId, 'cancelled');
    toast.success('Pedido cancelado');
  } catch(e) { toast.error('Error al cancelar'); }
};

const tabs = [
  { id: 'board', label: 'Tablero Kanban', icon: ChefHat },
  { id: 'history', label: 'Historial', icon: History },
];
</script>

<template>
  <div class="space-y-6 h-[calc(100vh-120px)] flex flex-col">
    <!-- Header y Tabs -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
      <div>
        <h1 class="text-3xl font-bold text-foreground">Cocina y Barra</h1>
        <p class="text-muted-foreground">Flujo de trabajo en tiempo real</p>
      </div>
      <div class="flex bg-muted p-1 rounded-lg">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" class="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all" :class="activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'">
          <component :is="tab.icon" class="w-4 h-4" /> {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- VISTA KANBAN -->
    <div v-if="activeTab === 'board'" class="flex-1 overflow-x-auto overflow-y-hidden pb-2">
      <div class="flex gap-6 h-full min-w-[1000px]">
        
        <!-- COLUMNA 1: PENDIENTES -->
        <div class="flex-1 flex flex-col bg-muted/30 rounded-xl border border-border/50 h-full">
          <div class="p-4 border-b border-border/50 bg-yellow-500/10 rounded-t-xl flex justify-between items-center">
            <h3 class="font-bold text-yellow-600 flex items-center gap-2">
              <Clock class="w-5 h-5" /> Pendientes
            </h3>
            <span class="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">{{ pendingOrders.length }}</span>
          </div>
          <div class="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            <div v-for="order in pendingOrders" :key="order.id" class="bg-card border border-border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-lg">Mesa {{ order.table_number }}</h4>
                <span class="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{{ formatTime(order.created_at) }}</span>
              </div>
              <div class="space-y-1 mb-4">
                <div v-for="(item, idx) in order.items" :key="idx" class="text-sm flex justify-between">
                  <span class="font-bold text-primary">{{ item.quantity }}x</span>
                  <span class="flex-1 mx-2 truncate">{{ item.product_name }}</span>
                </div>
              </div>
              <div class="flex gap-2 mt-auto">
                <button @click="handleCancel(order.id)" class="p-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors" title="Cancelar">
                  <X class="w-5 h-5" />
                </button>
                <button @click="handleNextStep(order)" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  Aceptar <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-if="pendingOrders.length === 0" class="text-center py-10 text-muted-foreground opacity-50">
              <p>No hay pedidos pendientes</p>
            </div>
          </div>
        </div>

        <!-- COLUMNA 2: EN PROCESO -->
        <div class="flex-1 flex flex-col bg-muted/30 rounded-xl border border-border/50 h-full">
          <div class="p-4 border-b border-border/50 bg-blue-500/10 rounded-t-xl flex justify-between items-center">
            <h3 class="font-bold text-blue-600 flex items-center gap-2">
              <Utensils class="w-5 h-5" /> En Proceso
            </h3>
            <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{{ inProcessOrders.length }}</span>
          </div>
          <div class="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            <div v-for="order in inProcessOrders" :key="order.id" class="bg-card border border-border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
              <!-- Indicador de estado -->
              <div class="absolute top-0 left-0 w-1 h-full" :class="order.status === 'preparing' ? 'bg-blue-500' : 'bg-green-500'"></div>
              
              <div class="flex justify-between items-start mb-3 pl-2">
                <div>
                  <h4 class="font-bold text-lg">Mesa {{ order.table_number }}</h4>
                  <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded" :class="order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                    {{ order.status === 'preparing' ? 'Cocinando' : 'Listo' }}
                  </span>
                </div>
                <span class="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{{ formatTime(order.created_at) }}</span>
              </div>
              
              <div class="space-y-1 mb-4 pl-2">
                <div v-for="(item, idx) in order.items" :key="idx" class="text-sm flex justify-between">
                  <span class="font-bold text-primary">{{ item.quantity }}x</span>
                  <span class="flex-1 mx-2 truncate">{{ item.product_name }}</span>
                </div>
                <p v-if="order.notes" class="text-xs text-orange-500 italic mt-2 border-t border-dashed pt-1">Nota: {{ order.notes }}</p>
              </div>

              <div class="pl-2 mt-auto">
                <button v-if="order.status === 'preparing'" @click="handleNextStep(order)" class="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 font-bold text-sm transition-colors">
                  Terminar Cocción
                </button>
                <button v-else @click="handleNextStep(order)" class="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  Enviar a Mesa <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-if="inProcessOrders.length === 0" class="text-center py-10 text-muted-foreground opacity-50">
              <p>No hay pedidos en proceso</p>
            </div>
          </div>
        </div>

        <!-- COLUMNA 3: POR COBRAR -->
        <div class="flex-1 flex flex-col bg-muted/30 rounded-xl border border-border/50 h-full">
          <div class="p-4 border-b border-border/50 bg-purple-500/10 rounded-t-xl flex justify-between items-center">
            <h3 class="font-bold text-purple-600 flex items-center gap-2">
              <Printer class="w-5 h-5" /> Por Cobrar
            </h3>
            <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">{{ toPayOrders.length }}</span>
          </div>
          <div class="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            <div v-for="order in toPayOrders" :key="order.id" class="bg-card border border-border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-bold text-lg">Mesa {{ order.table_number }}</h4>
                <div class="text-right">
                  <p class="font-bold text-lg">C$ {{ order.total }}</p>
                  <span class="text-xs text-muted-foreground">{{ order.waiter }}</span>
                </div>
              </div>
              
              <div class="space-y-1 mb-4 bg-muted/20 p-2 rounded text-xs text-muted-foreground">
                <p>{{ order.items.length }} items en la orden</p>
                <p>Esperando pago...</p>
              </div>

              <button v-if="authStore.user?.role !== 'kitchen'" @click="handlePay(order)" class="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                <Printer class="w-4 h-4" /> Cobrar y Descargar PDF
              </button>
              <div v-else class="text-center py-2 text-sm text-muted-foreground italic bg-muted/20 rounded-lg">
                Solo Caja puede cobrar
              </div>
            </div>
            <div v-if="toPayOrders.length === 0" class="text-center py-10 text-muted-foreground opacity-50">
              <p>No hay pedidos por cobrar</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- VISTA HISTORIAL -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-entry overflow-y-auto p-1">
      <div v-for="order in historyOrders" :key="order.id" class="bg-card border border-border rounded-xl shadow-sm p-4 opacity-75 hover:opacity-100 transition-opacity">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold">Mesa {{ order.table_number }}</span>
          <span class="text-xs px-2 py-1 rounded font-bold uppercase" :class="order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ order.status === 'paid' ? 'Pagado' : 'Cancelado' }}
          </span>
        </div>
        <p class="text-sm text-muted-foreground mb-2">{{ formatTime(order.created_at) }}</p>
        <p class="font-bold text-right">Total: C$ {{ order.total }}</p>
      </div>
      <div v-if="historyOrders.length === 0" class="col-span-full text-center py-20 opacity-50">
        <p>No hay historial reciente</p>
      </div>
    </div>

    <!-- Componente de Ticket (oculto) -->
    <Receipt v-if="printingOrder" :order="printingOrder" />
  </div>
</template>

<style scoped>
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
