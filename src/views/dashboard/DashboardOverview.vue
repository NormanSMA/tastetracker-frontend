<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import { useUserStore } from '@/stores/users';
import { DollarSign, ShoppingBag } from 'lucide-vue-next';
import WeeklySalesChart from '@/components/charts/WeeklySalesChart.vue';
import TopCategoriesChart from '@/components/charts/TopCategoriesChart.vue';

interface SummaryData {
  total_sales?: number;
  total_orders?: number;
  top_product?: { name: string; quantity: number };
  top_waiter?: { name: string; sales: number; photo_url?: string };
  top_products?: { name: string; quantity: number }[];
  top_waiters?: { name: string; sales?: number; total_sales?: number; photo_url?: string }[];
}

const userStore = useUserStore();


// Estados para filtros independientes
const salesRange = ref<'week' | 'month'>('week');
const categoryRange = ref<'today' | 'week' | 'month'>('today');

// Datos independientes
const summaryData = ref<SummaryData>({});
const salesChartData = ref<any>(null);
const categoryChartData = ref<any>(null);

// Helper para obtener la foto del mesero desde el store si no viene en el dashboard
const getWaiterPhoto = (waiterName: string, dashboardPhoto?: string) => {
  if (dashboardPhoto) return dashboardPhoto;
  const user = userStore.users.find(u => u.name === waiterName);
  return user?.photo_url || '';
};

// Helper para construir la URL de la imagen
const getPhotoUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Asegurar que haya una barra al inicio si es una ruta relativa
  const path = url.startsWith('/') ? url : `/${url}`;
  return `http://localhost:8000${path}`;
};

const formatMoney = (val: number) => {
  if (!val) return 'C$ 0.00';
  return 'C$ ' + Number(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

// 1. Cargar Resumen (Tarjetas)
const fetchSummary = async () => {
  try {
    const { data } = await api.get('/dashboard/summary');
    console.log('Dashboard Summary Data:', data); // Debug para ver estructura de datos
    summaryData.value = data;
  } catch (error) {
    console.error('Error cargando resumen:', error);
  }
};

// 2. Cargar Gráfico Ventas
const fetchSalesChart = async () => {
  salesChartData.value = null;
  try {
    const { data } = await api.get('/dashboard/charts/sales', {
      params: { range: salesRange.value }
    });
    salesChartData.value = data;
  } catch (error) {
    console.error('Error cargando gráfico de ventas:', error);
  }
};

// 3. Cargar Gráfico Categorías
const fetchCategoryChart = async () => {
  categoryChartData.value = null;
  try {
    const { data } = await api.get('/dashboard/charts/categories', {
      params: { range: categoryRange.value }
    });
    categoryChartData.value = data;
  } catch (error) {
    console.error('Error cargando gráfico de categorías:', error);
  }
};

// Cargar todo al inicio
onMounted(async () => {
  if (userStore.users.length === 0) {
    await userStore.fetchUsers();
  }
  fetchSummary();
  fetchSalesChart();
  fetchCategoryChart();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Resumen del Día</h1>
    </div>

    <!-- Summary Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Ventas de Hoy -->
      <div class="bg-card p-4 rounded-lg border border-border shadow-sm flex items-center gap-4">
        <div class="p-2 bg-primary/10 rounded-full text-primary">
          <DollarSign class="w-8 h-8" />
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium dark:text-gray-400">Ventas de Hoy</p>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ formatMoney(summaryData.total_sales || 0) }}</h3>
        </div>
      </div>
      
      <!-- Pedidos Totales -->
      <div class="bg-card p-4 rounded-lg border border-border shadow-sm flex items-center gap-4">
        <div class="p-2 bg-blue-500/10 rounded-full text-blue-500">
          <ShoppingBag class="w-8 h-8" />
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium dark:text-gray-400">Pedidos Totales</p>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ summaryData.total_orders || 0 }}</h3>
        </div>
      </div>
    </div>

    <!-- Charts Row with Independent Filters -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Informe de Ventas -->
      <div class="bg-card p-6 rounded-lg shadow-sm border border-border">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Informe de Ventas</h3>
          
          <div class="flex bg-muted rounded-lg p-1 text-xs">
            <button 
              @click="salesRange = 'week'; fetchSalesChart()" 
              class="px-3 py-1 rounded transition-all font-medium"
              :class="salesRange === 'week' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
              Semana
            </button>
            <button 
              @click="salesRange = 'month'; fetchSalesChart()" 
              class="px-3 py-1 rounded transition-all font-medium"
              :class="salesRange === 'month' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
              Mes
            </button>
          </div>
        </div>
        <div class="h-64 w-full">
          <WeeklySalesChart v-if="salesChartData" :data="salesChartData" :range="salesRange" />
          <p v-else class="text-muted-foreground text-sm text-center py-20">Cargando...</p>
        </div>
      </div>

      <!-- Categorías Más Vendidas -->
      <div class="bg-card p-6 rounded-lg shadow-sm border border-border">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Categorías Más Vendidas</h3>
          
          <div class="flex bg-muted rounded-lg p-1 text-xs">
            <button 
              @click="categoryRange = 'today'; fetchCategoryChart()" 
              class="px-3 py-1 rounded transition-all font-medium"
              :class="categoryRange === 'today' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
              Hoy
            </button>
            <button 
              @click="categoryRange = 'week'; fetchCategoryChart()" 
              class="px-3 py-1 rounded transition-all font-medium"
              :class="categoryRange === 'week' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
              Semana
            </button>
            <button 
              @click="categoryRange = 'month'; fetchCategoryChart()" 
              class="px-3 py-1 rounded transition-all font-medium"
              :class="categoryRange === 'month' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
              Mes
            </button>
          </div>
        </div>
        <div class="h-64 w-full flex justify-center">
          <TopCategoriesChart v-if="categoryChartData" :data="categoryChartData" :range="categoryRange" />
          <p v-else class="text-muted-foreground text-sm text-center py-20">Cargando...</p>
        </div>
      </div>
    </div>

    <!-- Top Products & Waiters Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Top 5 Platillos -->
      <div class="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Top 5 Platillos</h3>
        <div class="space-y-4">
          <div 
            v-for="(product, index) in (summaryData.top_products || [])" 
            :key="index" 
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <span class="text-slate-500 font-bold dark:text-gray-400">#{{ index + 1 }}</span>
              <span class="text-slate-900 dark:text-gray-200">{{ product.name }}</span>
            </div>
            <span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
              {{ product.quantity }} uds
            </span>
          </div>
          <p v-if="!summaryData.top_products || summaryData.top_products.length === 0" class="text-center text-muted-foreground text-sm py-4">
            Sin datos
          </p>
        </div>
      </div>

      <!-- Mejores Meseros -->
      <div v-if="summaryData.top_waiters && summaryData.top_waiters.length > 0" class="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Mejores Meseros</h3>
        <div class="space-y-4">
          <div 
            v-for="(waiter, index) in (summaryData.top_waiters || [])" 
            :key="index" 
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <img 
                v-if="getWaiterPhoto(waiter.name, waiter.photo_url)" 
                :src="getPhotoUrl(getWaiterPhoto(waiter.name, waiter.photo_url))" 
                :alt="waiter.name"
                class="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm"
                @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
              />
              <div 
                v-else 
                class="w-10 h-10 rounded-full bg-linear-to-br from-primary/80 to-primary flex items-center justify-center text-sm font-bold text-white shadow-sm"
              >
                {{ waiter.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-slate-900 text-sm font-medium dark:text-gray-200">{{ waiter.name }}</span>
            </div>
            <span class="text-orange-500 font-bold text-sm">
              {{ formatMoney(waiter.sales || waiter.total_sales || 0) }}
            </span>
          </div>
          <p v-if="!summaryData.top_waiters || summaryData.top_waiters.length === 0" class="text-center text-muted-foreground text-sm py-4">
            Sin datos
          </p>
        </div>
      </div>

    </div>
  </div>
</template>
