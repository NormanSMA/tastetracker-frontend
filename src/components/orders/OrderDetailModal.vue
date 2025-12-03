<script setup lang="ts">
import { X, Calendar, User, DollarSign, Download } from 'lucide-vue-next';
import { useOrderStore } from '@/stores/orders';

interface OrderItem {
  product_name: string;
  unit_price: number;
  quantity: number;
  notes?: string;
}

interface Order {
  id: number;
  table_number: number | string;
  table_identifier: string;
  area?: { id: number; name: string; prefix: string; description?: string };
  area_name?: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  waiter?: { id: number; name: string };
  waiter_name?: string;
  guest_name?: string;
  customer?: { id: number; name: string };
  customer_name?: string;
  formatted_total?: string;
}

const props = defineProps<{
  order: Order | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const formatMoney = (value: number) => {
  return 'C$ ' + Number(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper getters
const getWaiterName = () => props.order?.waiter?.name || props.order?.waiter_name || 'N/A';
const getAreaName = () => props.order?.area?.name || props.order?.area_name || 'N/A';
const getCustomerName = () => props.order?.customer_name || 'N/A';

// Obtener identificador completo de mesa
const getTableDisplay = () => {
  if (!props.order) return '';
  if (props.order.table_identifier) {
    const areaName = getAreaName();
    return `Mesa ${props.order.table_identifier} - ${areaName}`;
  }
  return `Mesa ${props.order.table_number}`;
};

// Descargar factura
const orderStore = useOrderStore();
const handleDownloadInvoice = async () => {
  if (!props.order) return;
  await orderStore.downloadInvoice(props.order.id);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && order" class="fixed inset-0 z-50 overflow-y-auto" @click="emit('close')">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">

          
          <!-- Backdrop -->
          <div class="fixed inset-0 transition-opacity bg-black/50"></div>

          <!-- Modal Panel -->
          <div 
            class="relative z-10 w-full max-w-lg bg-card rounded-xl shadow-xl border border-border transform transition-all"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-border">
              <h3 class="text-lg font-bold text-foreground">
                Pedido #{{ order.id }} - {{ getTableDisplay() }}
              </h3>
              <button 
                @click="emit('close')" 
                class="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <!-- Info General -->
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex items-center gap-2">
                  <Calendar class="w-4 h-4 text-blue-500" />
                  <div class="text-left">
                    <p class="text-xs text-muted-foreground">Fecha</p>
                    <p class="font-medium text-foreground">{{ formatDate(order.created_at) }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <User class="w-4 h-4 text-purple-500" />
                  <div class="text-left">
                    <p class="text-xs text-muted-foreground">Mesero</p>
                    <p class="font-medium text-foreground">{{ getWaiterName() }}</p>
                  </div>
                </div>
              </div>

              <!-- Mesa y Cliente -->
              <div class="p-3 bg-muted/30 rounded-lg text-sm">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-xs text-muted-foreground">Ubicación</p>
                    <p class="font-bold text-foreground">{{ getTableDisplay() }}</p>
                  </div>
                  <div v-if="getCustomerName() !== 'N/A'" class="text-right">
                    <p class="text-xs text-muted-foreground">Cliente</p>
                    <p class="font-medium text-foreground">{{ getCustomerName() }}</p>
                  </div>
                </div>
              </div>

              <!-- Tabla de Productos Detallada -->
              <div>
                <h4 class="text-sm font-bold text-foreground mb-2">Detalle de Productos</h4>
                <div class="border border-border rounded-lg overflow-hidden">
                  <table class="w-full text-sm">
                    <thead class="bg-muted/50 text-xs uppercase text-muted-foreground font-bold">
                      <tr>
                        <th class="px-3 py-2 text-center w-16">Cant.</th>
                        <th class="px-3 py-2 text-left">Producto</th>
                        <th class="px-3 py-2 text-left">Notas</th>
                        <th class="px-3 py-2 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      <tr v-for="(item, index) in order.items" :key="index" class="hover:bg-muted/20 transition-colors">
                        <td class="px-3 py-2 text-center font-bold text-muted-foreground">{{ item.quantity }}</td>
                        <td class="px-3 py-2 font-medium text-foreground">
                          {{ item.product_name }}
                        </td>
                        <td class="px-3 py-2 text-xs text-muted-foreground italic">
                          {{ item.notes || '-' }}
                        </td>
                        <td class="px-3 py-2 text-right font-bold text-foreground">{{ formatMoney(item.unit_price) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Total y Acciones -->
              <div class="pt-4 border-t border-border space-y-4">
                <div class="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-full text-primary">
                      <DollarSign class="w-6 h-6" />
                    </div>
                    <div>
                      <p class="text-xs text-muted-foreground font-bold uppercase">Total Pagado</p>
                      <p class="text-2xl font-bold text-primary">{{ order.formatted_total || formatMoney(order.total) }}</p>
                    </div>
                  </div>
                  <div 
                    class="px-3 py-1 rounded-full text-xs font-bold border"
                    :class="order.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'"
                  >
                    {{ order.status === 'paid' ? 'PAGADO' : 'CANCELADO' }}
                  </div>
                </div>

                <div class="flex gap-3">
                  <button 
                    v-if="order.status === 'paid'"
                    @click="handleDownloadInvoice" 
                    class="flex-1 px-4 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-base transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download class="w-4 h-4" />
                    Descargar Factura
                  </button>
                  <button 
                    @click="emit('close')" 
                    :class="order.status === 'paid' ? 'px-4' : 'w-full px-4'"
                    class="py-3.5 border border-input hover:bg-muted rounded-xl font-bold text-base transition-colors shadow-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
