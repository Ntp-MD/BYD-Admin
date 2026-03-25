export interface CarMonthPaid {
  percentPerMonth: number[]
}

export interface CarInstallmentDetail {
  carRatePricePercent: number
  carMonthPaid: CarMonthPaid
}

export interface CarData {
  carId: string
  carImageUrl: string
  carLogoUrl: string
  carName1: string
  carName2: string
  carPriceText: string
  carPrice: number
  carInstallmentDetails: CarInstallmentDetail[]
}
