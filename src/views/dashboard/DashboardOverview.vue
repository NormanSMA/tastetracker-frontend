<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import { DollarSign, ShoppingBag, TrendingUp, Award, BarChart3, PieChart } from 'lucide-vue-next';
import WeeklySalesChart from '@/components/charts/WeeklySalesChart.vue';
import TopCategoriesChart from '@/components/charts/TopCategoriesChart.vue';

interface DashboardStats {
  today_sales: number;
  today_orders: number;
  top_products: { name: string; quantity: number }[];
  top_waiters: { name: string; sales: number }[];
  sales_chart?: { labels: string[]; datasets: any[] };
  category_chart?: { labels: string[]; datasets: any[] };
}

const stats = ref<DashboardStats | null>(null);
const isLoading = ref(true);

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const { data } = await api.get('/dashboard');
    stats.value = data;
  } catch (error) {
    console.error('Error cargando dashboard:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatMoney = (val: number) => 'C$ ' + Number(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

onMounted(fetchStats);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-foreground">Resumen del Día</h1>
    </div>
    
    <div v-if="isLoading && !stats" class="h-64 flex items-center justify-center">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="stats" class="space-y-6">
      <!-- Summary Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Ventas de Hoy -->
        <div class="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div class="p-3 bg-primary/10 rounded-full text-primary">
            <DollarSign class="w-8 h-8" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground font-medium">Ventas de Hoy</p>
            <h3 class="text-3xl font-bold text-foreground">{{ formatMoney(stats.today_sales) }}</h3>
          </div>
        </div>
        
        <!-- Pedidos Totales -->
        <div class="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div class="p-3 bg-blue-500/10 rounded-full text-blue-500">
            <ShoppingBag class="w-8 h-8" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground font-medium">Pedidos Totales</p>
            <h3 class="text-3xl font-bold text-foreground">{{ stats.today_orders }}</h3>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Ventas de la Semana Chart -->
        <div class="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div class="mb-4 flex items-center gap-2">
            <div class="p-2 bg-primary/10 rounded-lg text-primary">
              <BarChart3 class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-lg">Ventas de la Semana</h3>
          </div>
          <WeeklySalesChart v-if="stats.sales_chart && stats.sales_chart.labels && stats.sales_chart.datasets" :data="stats.sales_chart" />
          <div v-else class="h-[300px] flex items-center justify-center text-muted-foreground">No hay datos de ventas</div>
        </div>

        <!-- Categorías Más Vendidas Chart -->
        <div class="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div class="mb-4 flex items-center gap-2">
            <div class="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <PieChart class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-lg">Categorías Más Vendidas</h3>
          </div>
          <TopCategoriesChart v-if="stats.category_chart && stats.category_chart.labels && stats.category_chart.datasets" :data="stats.category_chart" />
          <div v-else class="h-[300px] flex items-center justify-center text-muted-foreground">No hay datos de categorías</div>
        </div>
      </div>

      <!-- Tables Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Platillos Más Vendidos Table -->
        <div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div class="p-4 border-b border-border bg-muted/30">
            <h3 class="font-semibold text-foreground flex items-center gap-2">
              <Award class="w-5 h-5 text-yellow-500" /> 
              Platillos Más Vendidos
            </h3>
          </div>
          <div class="p-0">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th class="px-6 py-3">NOMBRE</th>
                  <th class="px-6 py-3 text-right">CANT.</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(prod, index) in stats.top_products" :key="index" class="border-b border-border hover:bg-muted/20">
                  <td class="px-6 py-4 font-medium text-foreground">{{ prod.name }}</td>
                  <td class="px-6 py-4 text-right">{{ prod.quantity }}</td>
                </tr>
                <tr v-if="stats.top_products.length === 0">
                  <td colspan="2" class="px-6 py-8 text-center text-muted-foreground">No hay ventas aún</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mejores Meseros Table -->
        <div v-if="stats.top_waiters" class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div class="p-4 border-b border-border bg-muted/30">
            <h3 class="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-green-500" /> 
              Mejores Meseros
            </h3>
          </div>
          <div class="p-0">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th class="px-6 py-3">NOMBRE</th>
                  <th class="px-6 py-3 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(waiter, index) in stats.top_waiters" :key="index" class="border-b border-border hover:bg-muted/20">
                  <td class="px-6 py-4 font-medium text-foreground">{{ waiter.name }}</td>
                  <td class="px-6 py-4 text-right text-primary font-bold">{{ formatMoney(waiter.sales) }}</td>
                </tr>
                <tr v-if="stats.top_waiters.length === 0">
                  <td colspan="2" class="px-6 py-8 text-center text-muted-foreground">Sin registros hoy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
