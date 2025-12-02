<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: {
    labels?: string[]
    datasets?: { data?: number[]; backgroundColor?: string[] }[]
  }
}>()

// Computed data with strict validation
const chartData = computed(() => {
  // Validación estricta
  if (!props.data || !props.data.labels || !props.data.datasets || !Array.isArray(props.data.labels)) {
    return { labels: [], datasets: [] };
  }
  return {
    labels: props.data.labels,
    datasets: props.data.datasets
  };
});

// Check if we have valid data to display
const hasValidData = computed(() => {
  return chartData.value.labels.length > 0 && chartData.value.datasets.length > 0;
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}
</script>

<template>
  <div class="h-[300px] w-full flex justify-center">
    <Doughnut v-if="hasValidData" :data="chartData" :options="chartOptions" />
    <div v-else class="h-full flex items-center justify-center text-muted-foreground">
      Cargando gráfico...
    </div>
  </div>
</template>
