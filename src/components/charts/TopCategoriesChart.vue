<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  data: {
    labels?: string[];
    datasets?: {
      data?: number[];
      backgroundColor?: string[];
    }[];
  } | null;
  range?: 'today' | 'week' | 'month';
}>();

// Distinct solid corporate colors for categories
const corporateColors = [
  '#2563EB', // Blue 600
  '#DC2626', // Red 600
  '#16A34A', // Green 600
  '#EA580C', // Orange 600
  '#9333EA', // Purple 600
  '#0891B2', // Cyan 600
  '#DB2777', // Pink 600
];

const chartData = computed(() => {
  if (!props.data?.labels?.length || !props.data?.datasets?.[0]?.data?.length) {
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderWidth: 3,
        borderColor: '#ffffff',
      }]
    };
  }

  return {
    labels: props.data.labels,
    datasets: [{
      data: props.data.datasets[0].data,
      backgroundColor: corporateColors.slice(0, props.data.labels.length),
      borderWidth: 2,
      borderColor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#ffffff',
      hoverOffset: 4,
    }]
  };
});

const hasValidData = computed(() => {
  return props.data?.labels?.length && props.data?.datasets?.[0]?.data?.length;
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
  // Get foreground color from CSS variable and convert to RGB format
  // Create a temporary element to compute the actual color
  const tempEl = document.createElement('div');
  tempEl.style.color = 'oklch(var(--foreground))';
  document.body.appendChild(tempEl);
  const textColor = window.getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  return {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500',
          },
          usePointStyle: true,
          pointStyle: 'circle',
          color: textColor,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${value}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: isDark.value ? '#1F2937' : '#1E293B',
        padding: 12,
        titleColor: '#F8FAFC',
        bodyColor: '#F1F5F9',
        cornerRadius: 8,
      },
    },
  } as any;
});

watch(() => props.data, () => {
  // Trigger chart update
}, { deep: true });

watch(() => props.range, () => {
  // Update colors when range changes
}, { deep: true });
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <div v-if="hasValidData" class="w-full max-w-[280px]">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="text-muted-foreground text-sm">No hay datos disponibles</p>
  </div>
</template>
