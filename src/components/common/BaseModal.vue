<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  title: string;
}>();

defineEmits(['close']);
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>
      
      <div class="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border relative z-10 flex flex-col max-h-[90vh]">
        
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h3 class="text-lg font-bold text-foreground">{{ title }}</h3>
          <button @click="$emit('close')" class="p-1 hover:bg-muted rounded-full text-muted-foreground transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto">
          <slot></slot>
        </div>
        
        <div v-if="$slots.footer" class="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
          <slot name="footer"></slot>
        </div>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .bg-card, 
.modal-leave-to .bg-card {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.bg-card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
