export type AirbnbStay = {
  id: string
  title: string
  subTitle: string
  isFreeCancellation: boolean
  price: number
  priceWithoutDiscount?: number
  rating?: number
  ratingCount?: number
  personCapacity?: number
  hostName?: string
  hostId?: string
  images: AirbnbStayImage[]
  createdAt?: Date
  updatedAt?: Date
}

export type AirbnbStayImage = {
  id: string
  stayId: string
  imageUrl: string
}