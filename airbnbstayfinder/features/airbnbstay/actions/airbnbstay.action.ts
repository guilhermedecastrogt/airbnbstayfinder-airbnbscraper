import {AirbnbStay} from "@/features/airbnbstay/domain/airbnbstay";

type RawAirbnbStay = {
    room_id: number,
    passportData: {
        name: string, //hostName
        ratingCount: number, //ofHost
        ratingAvarage: number, //ofHost
    },
    paymentMessages: {
        text: string, //if "Free cancellation" => freeCancelation = true
    } [],
    name: string; // airbnb name
    title: string; // airbnb title
    price: {
        unit: {
            curency_symbol: string,
            amount: number,
            discount: number
        }
    },
    rating: { // airbnbRating
        value: number,
        reviewCount: string
    }
    images: {
        url: string
    } []
}

type SearchByUrlResponse = {
    success: boolean
    count: number
    data: RawAirbnbStay[]
}

export async function findAirbnbStayByUrl (formData: FormData) {
    const url = formData.get("url")?.toString()
    const currency = formData.get("currency")?.toString()
    if (!url || !currency) return;
    const airbnbStayList = await getAirbnbStayByUrl(url, currency)
}

async function getAirbnbStayByUrl (url: string, currency: string): Promise<AirbnbStay[]> {

    const response = await fetch("http://localhost:8001/api/v1/search-by-url", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({url: url, currency: currency, lenguage: "en"})
    })

    if (!response.ok) {
        console.error(response)
        throw new Error("Request failed with status " + response.status)
    }

    const json: SearchByUrlResponse = await response.json()

    const airbnbList: AirbnbStay[] = json.data.map(item => {

        var airbnbByUrl = {
            room_id: item.room_id,
            host_name: item.passportData.name,
            rating_count: item.passportData.ratingCount,
            rating_avarage: item.passportData.ratingAvarage,
            free_cancelation: item.paymentMessages[0].text === "Free Cancelation" ? true : false,
            name: item.name,
            title: item.title,
            currency_symbol: item.price.unit.curency_symbol,
            price: item.price.unit.amount,
            discount: item.price.unit.discount,
            rating: item.rating.value,
            rating_acount: item.rating.reviewCount,
            images: item.images,
        }

        const responseById = await fetch("http://localhost:8001/api/v1/search-by-id", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({stay_id: item.room_id})
        })



        return AirbnbStay[];
    })

    return airbnbList;
}