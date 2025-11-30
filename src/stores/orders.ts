import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/axios';

export interface Order {
  id: number;
  table_number: string;
  status: string;
  total: number;
  waiter: string; // nombre del mesero
  area: string;
  items: Array<{ product_name: string; quantity: number; notes: string }>;
  created_at: string;
}

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const isLoading = ref(false);

  async function fetchOrders() {
    isLoading.value = true;
    try {
      const { data } = await api.get('/orders');
      orders.value = data.data; // Asumiendo que el Resource devuelve { data: [...] }
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Actualización optimista o recarga
      await fetchOrders(); 
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return { orders, isLoading, fetchOrders, updateOrderStatus };
});
