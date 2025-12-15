import { AirbnbStay, AirbnbStayImage } from "@/features/airbnbstay/domain/airbnbstay";

const prompt = `
    You are a strict Airbnb listing matcher and summarizer.
    
    You will receive:
    1) A user request written in natural language.
    2) A single Airbnb listing JSON.
    
    Your job:
    - Determine if the listing is compatible with the user request.
    - Extract key facts from the listing.
    - Produce a short resume that explicitly compares the listing with the user request.
    - Return ONLY valid JSON matching the schema below.
    
    User request:
    {{USER_PROMPT}}
    
    Listing JSON:
    {{LISTING_JSON1}}
    {{LISTING_JSON2}}
    
    Return ONLY this JSON structure:
    
    {
      "isCompatibleWithUserWants": boolean,
      "compatibilityScore": number,
      "resume": string,
      "reasons": string[]
    }
    
    Rules:
    - Do not add extra keys.
    - Output must be valid JSON.
    - compatibilityScore must be an integer from 0 to 100.
    - The "resume" must be short (1-3 sentences) and must mention:
      - rating and ratingCount if available
      - whether bedroom is shared or not
      - whether bathroom is shared or not
      - whether it matches the user request
    - The "reasons" array should list the most important evidence-based points used to decide compatibility.
`

type ResponseAI = {
    isCompatible: boolean,
    compatibilityScore: number,
    resume: string,
    reasons: string[]
}

function getFreeCancellation(item: RawAirbnbStay) {
    const text = item.paymentMessages?.[0]?.text ?? ""
    return /free cancellation/i.test(text)
}

type RawAirbnbStay = {
    room_id: number,
    passportData: {
        name: string, //hostName
        ratingCount: number, //ofHost
        ratingAvarage: number, //ofHost
    },
    paymentMessages?: {
        text?: string, //if "Free cancellation" => freeCancelation = true
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
    const userPrompt = formData.get("userPrompt")?.toString()
    if (!url || !currency || !userPrompt) return;
    const airbnbStayList = await getAirbnbStayByUrl(url, currency, userPrompt)
}

export async function getAirbnbStayByUrl (url: string, currency: string, userPrompt: string): Promise<AirbnbStay[]> {
    //const userPrompt = "I wanna a apartment, can be with a shared bathroom, the bedroom cant be shared, and need there is double bed"
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

    const airbnbList: AirbnbStay[] = await Promise.all(json.data.map(async (item) => {

        const imageList: AirbnbStayImage[] = item.images.map((image, index) => ({
            id: String(index),
            stayId: String(item.room_id),
            imageUrl: image.url
        }))

        const airbnbByUrl = {
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
            rating_acount: item.rating.reviewCount,
            images: imageList,
        }

        const responseById = await fetch("http://localhost:8001/api/v1/search-by-id", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({stay_id: item.room_id})
        })

        const byIdJson = await responseById.json()

        const systemContent = prompt;
        const userContent = [
            `User request:\n${userPrompt}`,
            `Listing JSON:\n${JSON.stringify(airbnbByUrl)}`,
            `Listing JSON (by id):\n${JSON.stringify(byIdJson)}`
        ].join('\n\n');

        const modelAI = {
            model: "deepseek-r1:1.5b",
            messages: [
                { role: "system", content: systemContent },
                { role: "user", content: userContent }
            ],
            stream: false,
            options: {
                temperature: 0.3,
                top_p: 0.95,
                num_predict: 96
            }
        };

        let aiOutput = ""
        try {
            const aiRes = await fetch("http://127.0.0.1:11434/api/chat", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modelAI)
            })
            const aiJson = await aiRes.json()
            aiOutput = typeof aiJson?.message?.content === "string" ? aiJson.message.content : ""
        } catch (_) {
            const genReq = {
                model: "deepseek-r1:1.5b",
                prompt: [systemContent, userContent].join("\n\n"),
                stream: false,
                options: modelAI.options
            }
            const genRes = await fetch("http://127.0.0.1:11434/api/generate", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(genReq)
            })
            const genJson = await genRes.json()
            aiOutput = typeof genJson?.response === "string" ? genJson.response : ""
        }

        let dataFromAI: ResponseAI = { isCompatible: false, compatibilityScore: 0, resume: "", reasons: [] }
        try {
            dataFromAI = JSON.parse(aiOutput)
        } catch {
            console.error(response)
        }

        return {
            title: airbnbByUrl.title,
            subTitle: airbnbByUrl.name,
            isFreeCancellation: airbnbByUrl.free_cancelation,
            price: airbnbByUrl.price,
            priceDiscount: airbnbByUrl.discount,
            rating: airbnbByUrl.rating,
            ratingCount: airbnbByUrl.rating_count,
            hostName: airbnbByUrl.host_name,
            images: airbnbByUrl.images,
            //AI response
            isCompatible: dataFromAI.isCompatible,
            compatibilityScore: dataFromAI.compatibilityScore,
            resume: dataFromAI.resume,
        }
    }))

    return airbnbList;
}