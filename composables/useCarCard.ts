import { ref } from 'vue'
import type { CarData } from '~/types/car'

export function useCarCard() {
  const editingField = ref<string | null>(null)
  const editingDetailIndex = ref<number | null>(null)
  const editingRateIndex = ref<number | null>(null)
  const tempValue = ref("")
  const showAddInstallment = ref(false)
  const newInstallmentPercent = ref("")

  const startEdit = (field: string, currentValue: string | number, detailIndex?: number, rateIndex?: number) => {
    if (detailIndex !== undefined && rateIndex !== undefined) {
      editingField.value = `installment_${detailIndex}_${rateIndex}`
      editingDetailIndex.value = detailIndex
      editingRateIndex.value = rateIndex
    } else {
      editingField.value = field
      editingDetailIndex.value = null
      editingRateIndex.value = null
    }
    tempValue.value = String(currentValue)
  }

  const saveEdit = (carId: string, field: keyof CarData, emit: Function) => {
    if (editingDetailIndex.value !== null && editingRateIndex.value !== null) {
      emit("updateInstallmentRate", carId, editingDetailIndex.value, editingRateIndex.value, tempValue.value)
    } else {
      emit("update", carId, field, tempValue.value)
    }
    editingField.value = null
    editingDetailIndex.value = null
    editingRateIndex.value = null
  }

  const cancelEdit = () => {
    editingField.value = null
    editingDetailIndex.value = null
    editingRateIndex.value = null
    tempValue.value = ""
  }

  const addInstallmentDetail = (carId: string, emit: Function) => {
    const percent = Number(newInstallmentPercent.value)
    if (!isNaN(percent) && percent >= 5 && percent <= 50) {
      emit("addInstallmentDetail", carId, percent)
      newInstallmentPercent.value = ""
      showAddInstallment.value = false
    }
  }

  const removeInstallmentDetail = (carId: string, detailIndex: number, emit: Function) => {
    const car = { carId } as CarData // We only need carId for the message
    if (confirm(`Remove ${detailIndex}% down payment option?`)) {
      emit("removeInstallmentDetail", carId, detailIndex)
    }
  }

  return {
    // Reactive state
    editingField,
    editingDetailIndex,
    editingRateIndex,
    tempValue,
    showAddInstallment,
    newInstallmentPercent,
    
    // Methods
    startEdit,
    saveEdit,
    cancelEdit,
    addInstallmentDetail,
    removeInstallmentDetail
  }
}
