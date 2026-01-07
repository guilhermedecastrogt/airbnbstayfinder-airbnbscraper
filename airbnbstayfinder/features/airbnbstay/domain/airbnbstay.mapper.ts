import { AirbnbStay, AirbnbStayImage } from "@/features/airbnbstay/domain/airbnbstay"
import {RawAirbnbStay, SearchByIdResponse} from "@/features/airbnbstay/domain/airbnbstay.raw"

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

export function mapRawToAiListingByURL(item: RawAirbnbStay) {
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

export function mapRawToAiListingById(item: SearchByIdResponse) {
    return {
        success: item.success,
        count: item.count,
        message: item.message,
        data: (item.data ?? []).map(d => ({
            coordinates: {
                latitude: d.coordinates.latitude,
                longitude: d.coordinates.longitude
            },
            room_type: d.room_type,
            is_super_host: d.is_super_host,
            home_tier: d.home_tier,
            person_capacity: d.person_capacity,
            rating: {
                accuracy: d.rating.accuracy,
                checking: d.rating.checking,
                cleanliness: d.rating.cleanliness,
                communication: d.rating.communication,
                location: d.rating.location,
                value: d.rating.value,
                guest_satisfaction: d.rating.guest_satisfaction,
                review_count: d.rating.review_count
            },
            house_rules: {
                aditional: d.house_rules.aditional,
                general: (d.house_rules.general ?? []).map(g => ({
                    title: g.title,
                    values: (g.values ?? []).map(v => ({
                        title: v.title,
                        icon: v.icon
                    }))
                }))
            },
            host: {
                id: d.host.id,
                name: d.host.name
            },
            sub_description: {
                title: d.sub_description.title,
                items: [...(d.sub_description.items ?? [])]
            },
            amenities: (d.amenities ?? []).map(a => ({
                title: a.title,
                values: (a.values ?? []).map(v => ({
                    title: v.title,
                    subtitle: v.subtitle,
                    icon: v.icon,
                    available: v.available
                }))
            })),
            co_hosts: d.co_hosts,
            images: (d.images ?? []).map(img => ({
                title: img.title,
                url: img.url
            })),
            location_descriptions: d.location_descriptions,
            highlights: (d.highlights ?? []).map(h => ({
                title: h.title,
                subtitle: h.subtitle,
                icon: h.icon
            })),
            is_guest_favorite: d.is_guest_favorite,
            description: d.description,
            title: d.title,
            language: d.language,
            reviews: (d.reviews ?? []).map(r => ({
                comments: r.comments
            }))
        })),
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