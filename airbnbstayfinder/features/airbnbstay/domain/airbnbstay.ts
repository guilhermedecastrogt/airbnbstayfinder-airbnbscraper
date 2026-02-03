export type AirbnbStay = {
  room_id: string
  title: string
  subTitle: string
  isFreeCancellation: boolean
  price: number
  priceDiscount?: number
  rating?: number
  ratingCount?: number
  personCapacity?: number
  hostName?: string
  images: AirbnbStayImage[]
  createdAt?: Date
  updatedAt?: Date

  isCompatible: boolean
  compatibilityScore: number
  resume: string

  interest: boolean | null
  tripId?: string
}

export type AirbnbStayImage = {
  id: string
  stayId: string
  imageUrl: string
}