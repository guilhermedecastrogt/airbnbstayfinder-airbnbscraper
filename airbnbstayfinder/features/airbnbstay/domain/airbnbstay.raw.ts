export type RawAirbnbStay = {
    room_id: number
    passportData: {
        name: string
        ratingCount: number
        ratingAvarage: number
    }
    paymentMessages?: { text?: string }[]
    name: string
    title: string
    price: {
        unit: {
            curency_symbol: string
            amount: number
            discount: number
        }
    }
    rating: {
        value: number
        reviewCount: string
    }
    images: { url: string }[]
}

export type SearchByUrlResponse = {
    success: boolean
    count: number
    data: RawAirbnbStay[]
}