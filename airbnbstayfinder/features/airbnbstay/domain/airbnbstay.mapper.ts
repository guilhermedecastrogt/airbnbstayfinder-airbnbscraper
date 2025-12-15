import { AirbnbStay, AirbnbStayImage } from "@/features/airbnbstay/domain/airbnbstay"
import { RawAirbnbStay } from "@/features/airbnbstay/domain/airbnbstay.raw"

export function getFreeCancellation(item: RawAirbnbStay) {
    const text = item.paymentMessages?.[0]?.text ?? ""
    return /free cancellation/i.test(text)
}

export function mapImages(item: RawAirbnbStay): AirbnbStayImage[] {
    return item.images.map((image, index) => ({
        id: String(index),
        stayId: String(item.room_id),
        imageUrl: image.url
    }))
}

export function mapRawToAiListing(item: RawAirbnbStay) {
    return {
        room_id: item.room_id,
        host_name: item.passportData.name,
        rating_count: item.passportData.ratingCount,
        rating_avarage: item.passportData.ratingAvarage,
        free_cancelation: getFreeCancellation(item),
        name: item.name,
        title: item.title,
        currency_symbol: item.price.unit.curency_symbol,
        price: item.price.unit.amount,
        discount: item.price.unit.discount,
        rating: item.rating.value,
        rating_acount: item.rating.reviewCount
    }
}

export function mapToOutputStay(base: {
    title: string
    subTitle: string
    isFreeCancellation: boolean
    price: number
    priceDiscount: number
    rating: number
    ratingCount: number
    hostName: string
    images: AirbnbStayImage[]
    isCompatible: boolean
    compatibilityScore: number
    resume: string
}): AirbnbStay {
    return base
}