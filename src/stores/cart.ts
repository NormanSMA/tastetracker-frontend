import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product } from './products';
import api from '@/api/axios';

export interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

export interface Area {
  id: number;
  name: string;
  prefix?: string;        // Prefijo del área (ej: "T", "S", "B")
  total_tables?: number;  // Cantidad total de mesas en esa área
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const tableNumber = ref('');
  const customerName = ref(''); 
  const isSending = ref(false);
  const areas = ref<Area[]>([]);
  const areaId = ref<number | null>(null);

  // Getters
  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  });

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));

  // Actions
  function addItem(product: Product) {
    const existing = items.value.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ product, quantity: 1, notes: '' });
    }
  }

  function decreaseItem(productId: number) {
    const index = items.value.findIndex(i => i.product.id === productId);
    if (index !== -1) {
      if (items.value[index].quantity > 1) {
        items.value[index].quantity--;
      } else {
        items.value.splice(index, 1);
      }
    }
  }

  function removeItem(productId: number) {
    const index = items.value.findIndex(i => i.product.id === productId);
    if (index !== -1) items.value.splice(index, 1);
  }

  function clearCart() {
    items.value = [];
    tableNumber.value = '';
    customerName.value = '';
  }

  async function fetchAreas() {
    try {
      const response = await api.get('/areas');
      // CORRECCIÓN: Laravel devuelve { data: [...] }, así que accedemos a data.data
      areas.value = response.data.data;
      
      // DEBUG: Ver qué datos devuelve el backend
      console.log('📍 Áreas cargadas desde el backend:', areas.value);
      console.log('📍 Primera área:', areas.value[0]);
      
      // Seleccionar el primero por defecto si existe
      if (areas.value.length > 0) {
        areaId.value = areas.value[0].id;
      }
    } catch (e) {
      console.error('Error cargando áreas:', e);
    }
  }

  async function sendOrder() {
    if (items.value.length === 0) return;
    
    // VALIDACIÓN PREVIA - Ahora la maneja el componente
    if (!areaId.value) {
      throw new Error('No se ha seleccionado una zona/área');
    }

    isSending.value = true;
    try {
      const payload: any = {
        area_id: areaId.value,
        table_number: tableNumber.value,
        order_type: 'dine_in',
        items: items.value.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      };

      // Agregar guest_name (siempre enviar, aunque sea string vacío o null si el backend lo permite)
      payload.guest_name = customerName.value || null;

      await api.post('/orders', payload);
      clearCart();
      // Restaurar área por defecto si existe
      if (areas.value.length > 0) areaId.value = areas.value[0].id;
      return true;
    } catch (error) {
      console.error('Error enviando pedido:', error);
      throw error;
    } finally {
      isSending.value = false;
    }
  }

  return { 
    items, tableNumber, customerName, isSending, areas, areaId,
    total, itemCount, 
    addItem, decreaseItem, removeItem, clearCart, sendOrder, fetchAreas
  };
});
