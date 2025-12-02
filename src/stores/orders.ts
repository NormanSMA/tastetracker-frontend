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
  notes?: string;
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
    // Find the order and store old status for rollback
    const order = orders.value.find(o => o.id === orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return false;
    }

    const oldStatus = order.status;

    try {
      // OPTIMISTIC UPDATE: Update local state immediately
      order.status = newStatus;

      // Make API call
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      return true;
    } catch (e) {
      // ROLLBACK: Revert to old status on error
      console.error('Error updating order status:', e);
      order.status = oldStatus;
      
      // Re-throw to allow UI to show error toast
      throw e;
    }
  }

  return { orders, isLoading, fetchOrders, updateOrderStatus };
});
