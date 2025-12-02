<script setup lang="ts">
import ProductGrid from '@/components/orders/ProductGrid.vue';
import CartSidebar from '@/components/orders/CartSidebar.vue';
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 overflow-hidden animate-entry">
    <ProductGrid />
    <CartSidebar />
  </div>
</template>

<style scoped>
@keyframes entry {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-entry {
  animation: entry 0.3s ease-out;
}
</style>
