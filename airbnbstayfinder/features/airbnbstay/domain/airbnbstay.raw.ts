export type RawAirbnbStay = {
    room_id: string
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

export type SearchByIdResponse = {
    success: boolean
    count: number
    data: Array<{
        coordinates: {
            latitude: number
            longitude: number
        }
        room_type: string
        is_super_host: boolean
        home_tier: number
        person_capacity: number
        rating: {
            accuracy: number
            checking: number
            cleanliness: number
            communication: number
            location: number
            value: number
            guest_satisfaction: number
            review_count: string
        }
        house_rules: {
            aditional: string
            general: Array<{
                title: string
                values: Array<{
                    title: string
                    icon: string
                }>
            }>
        }
        host: {
            id: string
            name: string
        }
        sub_description: {
            title: string
            items: string[]
        }
        amenities: Array<{
            title: string
            values: Array<{
                title: string
                subtitle: string
                icon: string
                available: boolean
            }>
        }>
        co_hosts: []
        images: Array<{
            title: string
            url: string
        }>
        location_descriptions: []
        highlights: Array<{
            title: string
            subtitle: string
            icon: string
        }>
        is_guest_favorite: boolean
        description: string
        title: string
        language: string
        reviews: Array<{
            comments: string
        }>
    }>,
    message: string
}