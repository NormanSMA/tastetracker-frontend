<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
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
  range?: 'week' | 'month'
}>()

// Corporate solid color (Blue 600)
const corporateBlue = '#2563EB';

// Computed data with strict validation
const chartData = computed(() => {
  if (!props.data || !props.data.labels || !props.data.datasets || !Array.isArray(props.data.labels)) {
    return { labels: [], datasets: [] };
  }

  return {
    labels: props.data.labels,
    datasets: [{
      ...props.data.datasets[0],
      backgroundColor: corporateBlue,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: '#1D4ED8', // Darker blue on hover
    }]
  } as any;
});

// Check if we have valid data to display
const hasValidData = computed(() => {
  return chartData.value.labels.length > 0 && chartData.value.datasets.length > 0;
});

// Reactive dark mode state
const isDark = ref(document.documentElement.classList.contains('dark'));

onMounted(() => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        isDark.value = document.documentElement.classList.contains('dark');
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });
});

const chartOptions = computed(() => {
  const textColor = isDark.value ? '#E5E7EB' : '#374151'; // gray-200 : gray-700
  const gridColor = isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark.value ? '#1F2937' : '#1E293B',
        padding: 12,
        titleColor: '#F8FAFC',
        bodyColor: '#F1F5F9',
        cornerRadius: 8,
        displayColors: false,
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
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '500',
            family: "'Inter', sans-serif",
          },
          color: textColor,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '500',
            family: "'Inter', sans-serif",
          },
          color: textColor,
          callback: function(value: any) {
            return 'C$ ' + value;
          }
        }
      }
    }
  } as any;
});
</script>

<template>
  <div class="h-[300px] w-full">
    <Bar v-if="hasValidData" :data="chartData" :options="chartOptions" />
    <div v-else class="h-full flex items-center justify-center text-muted-foreground">
      Cargando gráfico...
    </div>
  </div>
</template>
