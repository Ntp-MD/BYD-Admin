import { computed } from 'vue'

interface DashboardStatsProps {
  totalCars: number;
  totalModels: number;
  priceMin: number;
  priceMax: number;
}

export function useDashboardStats(props: DashboardStatsProps) {
  return computed(() => ({
    totalCars: props.totalCars,
    totalModels: props.totalModels,
    priceMin: props.priceMin,
    priceMax: props.priceMax
  }))
}
