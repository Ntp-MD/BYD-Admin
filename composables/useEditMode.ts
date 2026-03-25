import type { CarData } from '~/types/car'

const editMode = ref(false)
const cars = ref<CarData[]>([])
const nextId = ref(26)

export function useEditMode() {
  const toggleEditMode = () => {
    if (!editMode.value) {
      // Entering edit mode: deep-copy fresh data from original
      const originalData = useCarData()
      cars.value = originalData.cars.value.map(car => ({
        ...car,
        carInstallmentDetails: car.carInstallmentDetails.map(detail => ({
          ...detail,
          carMonthPaid: {
            percentPerMonth: [...detail.carMonthPaid.percentPerMonth]
          }
        }))
      }))
    }
    editMode.value = !editMode.value
  }

  const duplicateCar = (car: CarData) => {
    const duplicatedCar: CarData = {
      ...car,
      carId: String(nextId.value),
      carName1: `${car.carName1} (Copy)`,
      carPriceText: car.carPriceText,
      carPrice: car.carPrice,
      carInstallmentDetails: car.carInstallmentDetails.map(detail => ({
        ...detail,
        carMonthPaid: {
          percentPerMonth: [...detail.carMonthPaid.percentPerMonth]
        }
      }))
    }
    cars.value.push(duplicatedCar)
    nextId.value++
  }

  const updateCar = (carId: string, field: string, value: string | number) => {
    const carIndex = cars.value.findIndex(car => car.carId === carId)
    if (carIndex !== -1) {
      if (field === 'carPrice') {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          cars.value[carIndex].carPrice = numValue
          cars.value[carIndex].carPriceText = numValue.toLocaleString()
        }
      } else if (typeof field === 'string' && field.startsWith('installmentRate_')) {
        // Handle installment rate updates: installmentRate_0_1
        const parts = field.split('_')
        const detailIndex = Number(parts[1])
        const rateIndex = Number(parts[2])
        const numValue = Number(value)
        
        if (!isNaN(numValue) && cars.value[carIndex].carInstallmentDetails[detailIndex]) {
          cars.value[carIndex].carInstallmentDetails[detailIndex].carMonthPaid.percentPerMonth[rateIndex] = numValue
        }
      } else {
        (cars.value[carIndex] as any)[field] = value
      }
    }
  }

  const deleteCar = (carId: string) => {
    const carIndex = cars.value.findIndex(car => car.carId === carId)
    if (carIndex !== -1) {
      cars.value.splice(carIndex, 1)
    }
  }

  const saveCars = async () => {
    console.log('saveCars called, cars to save:', cars.value.length);
    const originalData = useCarData()
    console.log('Original cars before save:', originalData.cars.value.length);
    originalData.cars.value.splice(0, originalData.cars.value.length, ...cars.value)
    console.log('Original cars after save:', originalData.cars.value.length);
    // Don't toggle edit mode here - let the caller handle it
    return Promise.resolve()
  }

  const cancelEdit = () => {
    const originalData = useCarData()
    cars.value = originalData.cars.value.map(car => ({
      ...car,
      carInstallmentDetails: car.carInstallmentDetails.map(detail => ({
        ...detail,
        carMonthPaid: {
          percentPerMonth: [...detail.carMonthPaid.percentPerMonth]
        }
      }))
    }))
    editMode.value = false
  }

  onMounted(() => {
    const originalData = useCarData()
    cars.value = originalData.cars.value.map(car => ({
      ...car,
      carInstallmentDetails: car.carInstallmentDetails.map(detail => ({
        ...detail,
        carMonthPaid: {
          percentPerMonth: [...detail.carMonthPaid.percentPerMonth]
        }
      }))
    }))
  })

  return {
    editMode: readonly(editMode),
    cars,
    toggleEditMode,
    duplicateCar,
    updateCar,
    deleteCar,
    saveCars,
    cancelEdit,
  }
}
