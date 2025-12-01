<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Title, Tooltip, Legend)

defineProps<{
  data: {
    labels: string[]
    datasets: { data: number[]; backgroundColor: string[] }[]
  }
}>()

const options = {
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
    <Doughnut :data="data" :options="options" />
  </div>
</template>
