<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';
import { Search, ShoppingCart, Plus, Minus, Trash2, Utensils, Loader2, CreditCard, ChevronDown } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const productStore = useProductStore();
const cartStore = useCartStore();

const selectedCategory = ref<number | 'all'>('all');
const searchQuery = ref('');

onMounted(() => {
  if (productStore.products.length === 0) productStore.fetchMenu();
  cartStore.fetchAreas();
});

const filteredProducts = computed(() => {
  return productStore.products.filter(product => {
    const matchesCategory = selectedCategory.value === 'all' || product.category_id === selectedCategory.value;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
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
  <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 overflow-hidden animate-entry">
    
    <div class="flex-1 flex flex-col min-w-0 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div class="p-4 border-b border-border space-y-4 bg-muted/10">
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button @click="selectedCategory = 'all'" class="px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap" :class="selectedCategory === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-muted-foreground'">Todos</button>
          <button v-for="cat in productStore.categories" :key="cat.id" @click="selectedCategory = cat.id" class="px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap" :class="selectedCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-muted-foreground'">{{ cat.name }}</button>
        </div>
        <div class="relative">
          <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input v-model="searchQuery" placeholder="Buscar platillo..." class="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="product in filteredProducts" :key="product.id" @click="cartStore.addItem(product)" class="bg-background border border-border rounded-xl p-0 cursor-pointer hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all flex flex-col group overflow-hidden shadow-sm hover:shadow-md">
            <div class="h-32 bg-muted relative overflow-hidden">
               <img v-if="product.image_url" :src="product.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <Utensils v-else class="w-10 h-10 m-auto text-muted-foreground opacity-30 absolute inset-0" />
               <div class="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">{{ product.category_name }}</div>
            </div>
            <div class="p-3 flex flex-col flex-1">
              <h4 class="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-1">{{ product.name }}</h4>
              <p class="text-primary font-bold text-lg mt-auto">{{ formatMoney(product.price) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full md:w-80 lg:w-96 bg-card border border-border rounded-xl flex flex-col shadow-xl h-full">
      <div class="p-4 border-b border-border bg-primary/5">
        <h2 class="font-bold text-lg flex items-center gap-2 text-foreground">
          <ShoppingCart class="w-5 h-5 text-primary" /> Ticket Actual
        </h2>
        <div class="text-xs text-muted-foreground mt-1">{{ cartStore.itemCount }} items agregados</div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-muted-foreground text-center opacity-50 space-y-4">
          <div class="w-20 h-20 bg-muted rounded-full flex items-center justify-center"><ShoppingCart class="w-10 h-10" /></div>
          <div><p class="font-medium">Ticket Vacío</p><p class="text-xs mt-1">Selecciona productos</p></div>
        </div>

        <div v-else v-for="item in cartStore.items" :key="item.product.id" class="flex gap-3 items-start p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors animate-entry">
           <div class="flex flex-col items-center bg-muted/50 rounded-lg border border-border overflow-hidden shrink-0">
             <button @click="cartStore.addItem(item.product)" class="p-1 hover:bg-primary hover:text-white transition-colors"><Plus class="w-3 h-3" /></button>
             <span class="text-xs font-bold w-6 text-center py-0.5">{{ item.quantity }}</span>
             <button @click="cartStore.decreaseItem(item.product.id)" class="p-1 hover:bg-destructive hover:text-white transition-colors"><Minus class="w-3 h-3" /></button>
           </div>
           
           <div class="flex-1 min-w-0">
             <div class="flex justify-between items-start">
               <p class="text-sm font-bold text-foreground truncate pr-2">{{ item.product.name }}</p>
               <p class="text-sm font-bold text-foreground">{{ formatMoney(item.product.price * item.quantity) }}</p>
             </div>
             <p class="text-[10px] text-muted-foreground mb-1">{{ formatMoney(item.product.price) }} c/u</p>
             <input v-model="item.notes" placeholder="Nota..." class="w-full text-[11px] bg-muted/50 border-none rounded px-2 py-1 focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground" />
           </div>

           <button @click="cartStore.removeItem(item.product.id)" class="text-muted-foreground hover:text-destructive p-1 transition-colors"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>

      <div class="p-4 border-t border-border bg-card shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
        <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="col-span-1 space-y-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Zona</label>
                <div class="relative">
                    <select v-model="cartStore.areaId" class="w-full pl-3 pr-8 py-2 text-sm border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-card shadow-sm h-[38px] appearance-none cursor-pointer text-foreground">
                        <option v-for="area in cartStore.areas" :key="area.id" :value="area.id">{{ area.name }}</option>
                    </select>
                    <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>
            <div class="col-span-1 space-y-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Mesa #</label>
                <input v-model="cartStore.tableNumber" placeholder="Ej: 4" class="w-full px-3 py-2 text-sm border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-card shadow-sm h-[38px]" />
            </div>
            <div class="col-span-1 space-y-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Cliente</label>
                <input v-model="cartStore.customerName" placeholder="Opcional" class="w-full px-3 py-2 text-sm border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-card shadow-sm h-[38px]" />
            </div>
        </div>
        
        <div class="flex justify-between items-end mb-4 pb-4 border-b border-border">
          <span class="text-muted-foreground text-sm">Total a Pagar</span>
          <span class="text-3xl font-bold text-primary">{{ formatMoney(cartStore.total) }}</span>
        </div>

        <button @click="handleSendOrder" :disabled="cartStore.items.length === 0 || cartStore.isSending" class="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-primary/25">
          <Loader2 v-if="cartStore.isSending" class="w-5 h-5 animate-spin" />
          <CreditCard v-else class="w-5 h-5" />
          {{ cartStore.isSending ? 'Enviando...' : 'Confirmar Pedido' }}
        </button>
      </div>
    </div>
  </div>
</template>
