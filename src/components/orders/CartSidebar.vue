<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, CreditCard, ChevronDown } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.fetchAreas();
});

const formatMoney = (val: number) => 'C$ ' + Number(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

const handleSendOrder = async () => {
  if (!cartStore.tableNumber || !cartStore.areaId) {
    toast.warning('Falta información', { description: 'Selecciona la Zona y el Número de Mesa' });
    return;
  }
  try {
    await cartStore.sendOrder();
    toast.success('Pedido enviado a cocina', { description: `Mesa ${cartStore.tableNumber}` });
  } catch (e) {
    toast.error('Error al enviar pedido');
  }
};
</script>

<template>
  <div class="w-full md:w-80 lg:w-96 bg-card border border-border rounded-xl flex flex-col shadow-xl h-full">
    <div class="p-4 border-b border-border bg-primary/5">
      <h2 class="font-bold text-lg flex items-center gap-2 text-foreground">
        <ShoppingCart class="w-5 h-5 text-primary" /> Ticket Actual
      </h2>
      <div class="text-xs text-muted-foreground mt-1">{{ cartStore.itemCount }} items agregados</div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
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

    <div class="p-4 border-t border-border bg-card shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div class="col-span-1 space-y-1">
          <label class="text-[10px] font-bold uppercase text-muted-foreground">Zona</label>
          <div class="relative">
            <select 
              v-model="cartStore.areaId" 
              class="w-full pl-3 pr-8 py-2 text-sm border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-card shadow-sm h-[38px] appearance-none cursor-pointer text-foreground"
            >
              <option v-for="area in cartStore.areas" :key="area.id" :value="area.id">{{ area.name }}</option>
            </select>
            <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div class="col-span-1 space-y-1">
          <label class="text-[10px] font-bold uppercase text-muted-foreground">Mesa #</label>
          <input 
            v-model="cartStore.tableNumber" 
            placeholder="Ej: 4" 
            class="w-full px-3 py-2 text-sm border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-card shadow-sm h-[38px]" 
          />
        </div>
        <div class="col-span-1 space-y-1">
          <label class="text-[10px] font-bold uppercase text-muted-foreground">Cliente</label>
          <input 
            v-model="cartStore.customerName" 
            placeholder="Opcional" 
            class="w-full px-3 py-2 text-sm border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-card shadow-sm h-[38px]" 
          />
        </div>
      </div>
      
      <div class="flex justify-between items-end mb-4 pb-4 border-b border-border">
        <span class="text-muted-foreground text-sm">Total a Pagar</span>
        <span class="text-3xl font-bold text-primary">{{ formatMoney(cartStore.total) }}</span>
      </div>

      <button 
        @click="handleSendOrder" 
        :disabled="cartStore.items.length === 0 || cartStore.isSending" 
        class="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-primary/25"
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
