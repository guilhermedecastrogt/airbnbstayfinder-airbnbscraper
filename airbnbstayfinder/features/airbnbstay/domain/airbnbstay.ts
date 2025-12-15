export type AirbnbStay = {
  id?: string
  title: string
  subTitle: string
  isFreeCancellation: boolean
  price: number
  priceDiscount?: number
  rating?: number
  ratingCount?: number
  personCapacity?: number
  hostName?: string
  hostId?: string
  images: AirbnbStayImage[]
  createdAt?: Date
  updatedAt?: Date


  // AI Response
  isCompatible: boolean,
  compatibilityScore: number,
  resume: string,
}

export type AirbnbStayImage = {
  id: string
  stayId: string
  imageUrl: string
}