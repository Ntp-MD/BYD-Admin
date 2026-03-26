<script setup lang="ts">
import { useDashboardStats } from "~/composables/useDashboardStats";

interface Props {
  totalCars: number;
  totalModels: number;
  priceMin: number;
  priceMax: number;
}

const props = defineProps<Props>();

const stats = useDashboardStats(props);
</script>

<template>
  <div class="grid grid-cols-4 gap-md m-lg">
    <div class="card rounded p-md flex flex-col gap-xs">
      <span class="text-xl font-bold">{{ stats.totalCars }}</span>
      <span class="text-xs">Total Models</span>
    </div>
    <div class="card rounded p-md flex flex-col gap-xs">
      <span class="text-xl font-bold">{{ stats.totalModels }}</span>
      <span class="text-xs">Model Lines</span>
    </div>
    <div class="card rounded p-md flex flex-col gap-xs">
      <span class="text-xl font-bold">{{ stats.priceMin.toLocaleString() }}</span>
      <span class="text-xs">Lowest Price</span>
    </div>
    <div class="card rounded p-md flex flex-col gap-xs">
      <span class="text-xl font-bold">{{ stats.priceMax.toLocaleString() }}</span>
      <span class="text-xs">Highest Price</span>
    </div>
  </div>
</template>

<style scoped>
@media screen and (max-width: 992px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .grid-cols-4 {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
