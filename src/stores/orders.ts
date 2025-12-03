import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/axios';
import { toast } from 'vue-sonner';

export interface Area {
  id: number;
  name: string;
  prefix: string;
  total_tables: number;
  description?: string;
}

export interface OrderItem {
  product_name: string;
  quantity: number;
  notes?: string;
  unit_price: number;
}

export interface Order {
  id: number;
  table_number: number | string;
  table_identifier: string; // Identificador completo: "S3", "T5", etc.
  status: string;
  order_type: string;
  total: number;
  notes?: string;
  created_at: string;
  
  // Área completa con toda la información
  area: Area;
  
  // Items del pedido
  items: OrderItem[];
  
  // Mesero (puede venir como objeto o string)
  waiter?: { id: number; name: string };
  waiter_name?: string;
  
  // Cliente (registrado o invitado)
  customer?: { id: number; name: string };
  guest_name?: string;
  customer_name?: string; // Nombre unificado
  
  // Campos opcionales formateados del backend
  formatted_total?: string; // Total formateado con moneda (ej: "C$ 150.00")
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

  async function downloadInvoice(orderId: number) {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${orderId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Factura descargada correctamente');
      return true;
    } catch (error) {
      console.error('Error descargando factura:', error);
      toast.error('Error al descargar la factura');
      return false;
    }
  }

  return { orders, isLoading, fetchOrders, updateOrderStatus, downloadInvoice };
});
