<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: {
    labels?: string[]
    datasets?: { label?: string; data?: number[]; backgroundColor?: string }[]
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
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return 'C$ ' + value;
        }
      }
    }
  }
}
</script>

<template>
  <div class="h-[300px] w-full">
    <Bar v-if="hasValidData" :data="chartData" :options="chartOptions" />
    <div v-else class="h-full flex items-center justify-center text-muted-foreground">
      Cargando gráfico...
    </div>
  </div>
</template>
