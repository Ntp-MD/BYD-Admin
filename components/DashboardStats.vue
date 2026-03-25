<script setup lang="ts">
interface Props {
  totalCars: number;
  totalModels: number;
  priceMin: number;
  priceMax: number;
}

defineProps<Props>();
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-card__label">Total Models</span>
      <span class="stat-card__value">{{ totalCars }}</span>
    </div>
    <div class="stat-card">
      <span class="stat-card__label">Model Lines</span>
      <span class="stat-card__value">{{ totalModels }}</span>
    </div>
    <div class="stat-card">
      <span class="stat-card__label">Lowest Price</span>
      <span class="stat-card__value">{{ priceMin.toLocaleString() }}</span>
    </div>
    <div class="stat-card">
      <span class="stat-card__label">Highest Price</span>
      <span class="stat-card__value">{{ priceMax.toLocaleString() }}</span>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-md);
  margin-bottom: var(--gap-lg);
}

.stat-card {
  background-color: var(--color-white);
  border-radius: 12px;
  padding: var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card__label {
  font-size: var(--font-xs);
  color: var(--font-color2);
  font-weight: 500;
}

.stat-card__value {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--color1);
}

@media screen and (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
