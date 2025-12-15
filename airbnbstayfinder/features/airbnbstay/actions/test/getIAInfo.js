const fs = require("fs")

const raw = JSON.parse(fs.readFileSync("./by-id.json", "utf8"))

function pickListing(input) {
    if (input && Array.isArray(input.data) && input.data.length) return input.data[0]
    if (input && input.data && typeof input.data === "object") return input.data
    return input
}

function firstN(arr, n) {
    return Array.isArray(arr) ? arr.slice(0, n) : []
}

function safeStr(v, max) {
    if (typeof v !== "string") return ""
    if (!max || v.length <= max) return v
    return v.slice(0, max)
}

function minimizeAmenities(amenities) {
    if (!Array.isArray(amenities)) return []
    return amenities.map(g => ({
        title: g?.title ?? "",
        values: firstN(g?.values, 25).map(x => ({
            title: x?.title ?? "",
            available: typeof x?.available === "boolean" ? x.available : null
        }))
    }))
}

const listing = pickListing(raw)

const minListing = {
    coordinates: listing?.coordinates ?? null,
    room_type: listing?.room_type ?? null,
    person_capacity: listing?.person_capacity ?? null,
    is_super_host: listing?.is_super_host ?? null,
    home_tier: listing?.home_tier ?? null,
    rating: listing?.rating ?? null,
    host: listing?.host ? { id: listing.host.id ?? null, name: listing.host.name ?? null } : null,
    sub_description: listing?.sub_description ?? null,
    highlights: firstN(listing?.highlights, 10),
    house_rules: listing?.house_rules ? { general: listing.house_rules.general ?? [], aditional: safeStr(listing.house_rules.aditional ?? "", 400) } : null,
    amenities: minimizeAmenities(listing?.amenities),
    images: firstN(listing?.images, 8).map(i => ({ title: i?.title ?? "", url: i?.url ?? "" })),
    is_guest_favorite: listing?.is_guest_favorite ?? null,
    title: listing?.title ?? null,
    language: listing?.language ?? null,
    message: listing?.message ?? null,
    description: safeStr(listing?.description ?? "", 900)
}

fs.writeFileSync("./by-id.min.json", JSON.stringify(minListing, null, 2))

const userPrompt = "I wanna a apartment, can be with a shared bathroom, the bedroom cant be shared, and need there is double bed"

const systemPrompt =
    "You are a strict Airbnb listing matcher and summarizer.\n\n" +
    "You will receive:\n" +
    "1) A user request written in natural language.\n" +
    "2) A single Airbnb listing JSON.\n\n" +
    "Your job:\n" +
    "- Determine if the listing is compatible with the user request.\n" +
    "- Produce a short resume that explicitly compares the listing with the user request.\n" +
    "- Return ONLY valid JSON matching the schema below.\n\n" +
    "Return ONLY this JSON structure:\n" +
    "{\n" +
    '  "isCompatibleWithUserWants": boolean,\n' +
    '  "compatibilityScore": number,\n' +
    '  "resume": string\n' +
    "}\n\n" +
    "Rules:\n" +
    "- Do not add extra keys.\n" +
    "- Output must be valid JSON.\n" +
    "- compatibilityScore must be an integer from 0 to 100.\n" +
    "- The resume must be short (1-3 sentences) and must mention rating and ratingCount if available, whether bedroom is shared or not, whether bathroom is shared or not, and whether it matches the user request."

const userContent = [
    `User request:\n${userPrompt}`,
    `Listing JSON (by id):\n${JSON.stringify(minListing)}`
].join("\n\n")

const payload = {
    model: "deepseek-r1:1.5b",
    format: "json",
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
    ],
    stream: false,
    options: { temperature: 0.3, top_p: 0.95, num_predict: 512 }
}

fs.writeFileSync("./postman-body.json", JSON.stringify(payload, null, 2))