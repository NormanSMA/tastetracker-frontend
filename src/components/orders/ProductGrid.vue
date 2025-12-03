<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';
import { Search, Utensils } from 'lucide-vue-next';

const productStore = useProductStore();
const cartStore = useCartStore();

onMounted(() => {
  if (productStore.products.length === 0) productStore.fetchMenu();
});

const formatMoney = (val: number) => 'C$ ' + Number(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
</script>

<template>
  <div class="flex-1 flex flex-col min-w-0 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
    <div class="p-4 border-b border-border space-y-4 bg-muted/10">
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button 
          @click="productStore.setCategory('all')" 
          class="px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap" 
          :class="productStore.selectedCategory === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-muted-foreground'"
        >
          Todos
        </button>
        <button 
          v-for="cat in productStore.categories" 
          :key="cat.id" 
          @click="productStore.setCategory(cat.id)" 
          class="px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap" 
          :class="productStore.selectedCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-muted-foreground'"
        >
          {{ cat.name }}
        </button>
      </div>
      <div class="relative">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input 
          :value="productStore.searchQuery"
          @input="productStore.setSearchQuery(($event.target as HTMLInputElement).value)"
          placeholder="Buscar platillo..." 
          class="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div 
          v-for="product in productStore.filteredProducts" 
          :key="product.id" 
          @click="cartStore.addItem(product)" 
          class="bg-background border border-border rounded-xl p-0 cursor-pointer hover:border-primary hover:ring-2 hover:ring-primary/20 transition-all flex flex-col group overflow-hidden shadow-sm hover:shadow-md"
        >
          <div class="h-32 bg-muted relative overflow-hidden">
            <img 
              v-if="product.image_url" 
              :src="product.image_url" 
              :alt="product.name"
              loading="lazy"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <Utensils 
              class="w-10 h-10 m-auto text-muted-foreground opacity-30 absolute inset-0 pointer-events-none" 
              :class="product.image_url ? 'hidden' : 'flex items-center justify-center'"
            />
            <div class="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
              {{ product.category_name }}
            </div>
          </div>
          <div class="p-3 flex flex-col flex-1">
            <h4 class="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-1">{{ product.name }}</h4>
            <p class="text-primary font-bold text-lg mt-auto">{{ formatMoney(product.price) }}</p>
          </div>
        </div>
      </div>
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

/* Ocultar scrollbar horizontal */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
