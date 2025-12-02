<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, CreditCard } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const cartStore = useCartStore();
const selectedTableNumber = ref<number | null>(null);

onMounted(() => {
  cartStore.fetchAreas();
});

// Computed properties
const selectedArea = computed(() => 
  cartStore.areas.find(a => a.id === cartStore.areaId)
);

const availableTables = computed(() => {
  if (!selectedArea.value?.total_tables) return [];
  return Array.from({ length: selectedArea.value.total_tables }, (_, i) => i + 1);
});

const tableDisplay = computed(() => {
  if (!selectedTableNumber.value || !selectedArea.value) return '';
  const prefix = selectedArea.value.prefix || '';
  return `${selectedArea.value.name} ${prefix}#${selectedTableNumber.value}`;
});

// Functions
function selectArea(areaId: number) {
  cartStore.areaId = areaId;
  selectedTableNumber.value = null;
  cartStore.tableNumber = '';
}

function selectTable(num: number) {
  selectedTableNumber.value = num;
  cartStore.tableNumber = num.toString();
}

const formatMoney = (val: number) => 'C$ ' + Number(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

const handleSendOrder = async () => {
  if (!cartStore.tableNumber || !cartStore.areaId) {
    toast.warning('Falta información', { description: 'Selecciona la Zona y el Número de Mesa' });
    return;
  }
  
  // DEBUG: Verificar que el nombre del cliente se envía
  console.log('Enviando guest_name:', cartStore.customerName);
  
  try {
    await cartStore.sendOrder();
    toast.success('Pedido enviado a cocina', { description: `Mesa ${cartStore.tableNumber}` });
  } catch (e) {
    toast.error('Error al enviar pedido');
  }
};
</script>

<template>
  <div class="w-full md:w-80 lg:w-96 bg-card border border-border rounded-xl flex flex-col shadow-lg h-full">
    <!-- HEADER: Título + Input Cliente -->
    <div class="p-3 border-b border-border bg-primary/5 space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="font-bold text-lg flex items-center gap-2 text-foreground">
          <ShoppingCart class="w-5 h-5 text-primary" /> Ticket Actual
        </h2>
        <div class="text-xs text-muted-foreground">{{ cartStore.itemCount }} items</div>
      </div>
      
      <!-- INPUT CLIENTE EN HEADER -->
      <div>
        <label class="text-[10px] font-bold uppercase text-muted-foreground tracking-wide block mb-1">Cliente (Opcional)</label>
        <input 
          v-model="cartStore.customerName" 
          placeholder="Nombre del cliente..." 
          class="w-full px-3 py-1.5 text-xs border border-input rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-muted/50 text-foreground placeholder:text-muted-foreground transition-colors"
        />
      </div>
    </div>

    <!-- BODY: Lista de Productos (MAXIMIZADO) -->
    <div class="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 custom-scrollbar">
      <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-muted-foreground text-center opacity-50 space-y-4">
        <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart class="w-10 h-10" />
        </div>
        <div>
          <p class="font-medium">Ticket Vacío</p>
          <p class="text-xs mt-1">Selecciona productos</p>
        </div>
      </div>

      <div 
        v-else 
        v-for="item in cartStore.items" 
        :key="item.product.id" 
        class="flex gap-3 items-start p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors animate-entry"
      >
        <div class="flex flex-col items-center bg-muted/50 rounded-lg border border-border overflow-hidden shrink-0">
          <button @click="cartStore.addItem(item.product)" class="p-1 hover:bg-primary hover:text-white transition-colors">
            <Plus class="w-3 h-3" />
          </button>
          <span class="text-xs font-bold w-6 text-center py-0.5">{{ item.quantity }}</span>
          <button @click="cartStore.decreaseItem(item.product.id)" class="p-1 hover:bg-destructive hover:text-white transition-colors">
            <Minus class="w-3 h-3" />
          </button>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <p class="text-sm font-bold text-foreground truncate pr-2">{{ item.product.name }}</p>
            <p class="text-sm font-bold text-foreground">{{ formatMoney(item.product.price * item.quantity) }}</p>
          </div>
          <p class="text-[10px] text-muted-foreground mb-1">{{ formatMoney(item.product.price) }} c/u</p>
          <input 
            v-model="item.notes" 
            placeholder="Nota..." 
            class="w-full text-[11px] bg-muted/50 border-none rounded px-2 py-1 focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground" 
          />
        </div>

        <button @click="cartStore.removeItem(item.product.id)" class="text-muted-foreground hover:text-destructive p-1 transition-colors">
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- FOOTER: Controles Compactos -->
    <div class="p-2.5 border-t border-border bg-card z-10 space-y-2">
      
      <!-- ZONA - TABS COMPACTOS -->
      <div>
        <label class="text-[9px] font-bold uppercase text-muted-foreground tracking-wide block mb-1">Zona</label>
        <div class="flex gap-1 bg-muted/30 p-0.5 rounded-lg overflow-x-auto">
          <button 
            v-for="area in cartStore.areas" 
            :key="area.id"
            @click="selectArea(area.id)"
            class="shrink-0 px-3 py-1 rounded-md font-semibold text-[10px] transition-all"
            :class="cartStore.areaId === area.id 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'"
          >
            {{ area.name }}
          </button>
        </div>
      </div>

      <!-- MESA - BOTONES COMPACTOS CON SCROLL -->
      <div v-if="selectedArea && availableTables.length > 0">
        <label class="text-[9px] font-bold uppercase text-muted-foreground tracking-wide block mb-1">
          Mesa {{ selectedArea.prefix ? `(${selectedArea.prefix}#)` : '' }}
        </label>
        <!-- CONTENEDOR CON ALTURA MÁXIMA Y SCROLL -->
        <div class="max-h-16 overflow-y-auto custom-scrollbar bg-muted/20 p-0.5 rounded-lg">
          <div class="grid grid-cols-8 gap-0.5">
            <button 
              v-for="num in availableTables" 
              :key="num"
              @click="selectTable(num)"
              class="h-7 w-7 rounded font-bold text-[9px] transition-all border flex items-center justify-center"
              :class="selectedTableNumber === num 
                ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted'"
            >
              {{ num }}
            </button>
          </div>
        </div>
        <p v-if="tableDisplay" class="text-[9px] text-primary font-semibold mt-1">
          {{ tableDisplay }}
        </p>
      </div>
      
      <!-- TOTAL -->
      <div class="flex justify-between items-center mb-2 pb-2 border-b border-border">
        <span class="text-muted-foreground text-[10px] font-medium uppercase">Total</span>
        <span class="text-xl font-bold text-primary">{{ formatMoney(cartStore.total) }}</span>
      </div>

      <!-- BOTÓN CONFIRMAR -->
      <button 
        @click="handleSendOrder" 
        :disabled="cartStore.items.length === 0 || cartStore.isSending" 
        class="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        <Loader2 v-if="cartStore.isSending" class="w-5 h-5 animate-spin" />
        <CreditCard v-else class="w-5 h-5" />
        {{ cartStore.isSending ? 'Enviando...' : 'Confirmar Pedido' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Personalización del Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 20px;
}

@keyframes entry {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-entry {
  animation: entry 0.2s ease-out;
}
</style>
