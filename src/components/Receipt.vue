<script setup lang="ts">
interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  id: number;
  table_number?: number;
  waiter_name: string;
  customer_name?: string;
  items: OrderItem[];
  total: number;
  created_at: string;
}

defineProps<{
  order: Order;
}>();

const formatCurrency = (value: number) => {
  return 'C$ ' + Number(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-NI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="receipt-container">
    <div id="receipt-content" class="receipt-content" style="background-color: #ffffff; color: #000000;">
      <!-- Cabecera -->
      <div class="text-center">
        <img src="/logo-taste.png" alt="Logo" class="receipt-logo grayscale" />
        <h2 class="font-bold text-lg uppercase my-1">TasteTracker</h2>
        <p>Calle Principal #123</p>
        <p>Managua, Nicaragua</p>
        <p>Tel: (505) 8888-8888</p>
      </div>

      <div class="separator">--------------------------------</div>

      <!-- Info -->
      <div class="text-center">
        <p>ORDEN #{{ order.id }}</p>
        <p>MESA: {{ order.table_number || 'N/A' }}</p>
        <p>{{ formatDate(order.created_at) }}</p>
        <p>Mesero: {{ order.waiter_name || 'Sin asignar' }}</p>
        <p v-if="order.customer_name">Cliente: {{ order.customer_name }}</p>
      </div>

      <div class="separator">--------------------------------</div>

      <!-- Items Compactos -->
      <div class="items-list">
        <div v-for="item in order.items" :key="item.id">
          <div class="item-row">
            <div class="item-name">
              {{ item.quantity }}x {{ item.product_name }}
            </div>
            <div class="item-dots">................................</div>
            <div class="item-price">{{ formatCurrency(item.price) }}</div>
          </div>
          <div v-if="item.notes" style="font-size: 10px; font-style: italic;">(Nota: {{ item.notes }})</div>
        </div>
      </div>

      <div class="separator">--------------------------------</div>

      <!-- Totales -->
      <div class="totals">
        <div class="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{{ formatCurrency(order.total) }}</span>
        </div>
        <div class="flex justify-between font-bold text-lg mt-1">
          <span>TOTAL:</span>
          <span>{{ formatCurrency(order.total) }}</span>
        </div>
      </div>

      <div class="separator">--------------------------------</div>

      <!-- Pie -->
      <div class="text-center footer">
        <p>¡GRACIAS POR SU VISITA!</p>
        <p>VUELVA PRONTO</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

.receipt-container {
  /* Para html2pdf necesitamos que esté renderizado pero no visible */
  position: fixed;
  left: -9999px;
  top: 0;
  background-color: white;
  color: black;
}

.receipt-content {
  font-family: 'Courier Prime', 'Courier New', monospace;
  font-size: 12px;
  width: 80mm;
  padding: 5mm;
  color: black;
  background: white;
}

.receipt-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  margin: 0 auto;
  filter: grayscale(100%);
}

.separator {
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  margin: 5px 0;
}

.items-list {
  width: 100%;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}

.item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.item-dots {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  color: #999;
  margin: 0 2px;
  font-size: 10px;
}

.item-price {
  white-space: nowrap;
}

.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.text-lg { font-size: 16px; }
.uppercase { text-transform: uppercase; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.mt-1 { margin-top: 4px; }
.my-1 { margin-top: 4px; margin-bottom: 4px; }
</style>
