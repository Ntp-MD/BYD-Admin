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
  <div class="dashboard-stats">
    <div class="dashboard-stats-card card">
      <span class="dashboard-stats-count">{{ stats.totalCars }}</span>
      <span class="dashboard-stats-label">Total Models</span>
    </div>
    <div class="dashboard-stats-card card">
      <span class="dashboard-stats-count">{{ stats.totalModels }}</span>
      <span class="dashboard-stats-label">Model Lines</span>
    </div>
    <div class="dashboard-stats-card card">
      <span class="dashboard-stats-count">{{ stats.priceMin.toLocaleString() }}</span>
      <span class="dashboard-stats-label">Lowest Price</span>
    </div>
    <div class="dashboard-stats-card card">
      <span class="dashboard-stats-count">{{ stats.priceMax.toLocaleString() }}</span>
      <span class="dashboard-stats-label">Highest Price</span>
    </div>
  </div>
</template>

<style scoped>
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-md);
  margin: var(--gap-lg) 0;
}

.dashboard-stats-card {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  padding: var(--gap-md);
}

.dashboard-stats-count {
  font-size: var(--font-xl);
  font-weight: 600;
}

.dashboard-stats-label {
  color: var(--font-color2);
  font-size: var(--font-sm);
}
</style>
