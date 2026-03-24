"use client"

import { findAirbnbStayByUrlFromFormData } from "@/features/airbnbstay/actions/find-airbnbstay-by-url.action"
import { useTrip } from "@/components/trip-provider"
import TripSelector from "@/features/trip/components/trip-selector"
import { useState, useTransition } from "react"
import { SearchHistory } from "@/features/search-history/search-history"
import SearchHistoryList from "@/features/search-history/components/search-history-list"

const currencies = [
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
    { value: "GBP", label: "£ GBP" },
    { value: "BRL", label: "R$ BRL" },
]

type Props = {
    history?: SearchHistory[]
}

export default function AirbnbStayForm({ history = [] }: Props) {
    const { selectedTrip, trips, setSelectedTrip } = useTrip()
    const [isPending, startTransition] = useTransition()
    const [url, setUrl] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [userPrompt, setUserPrompt] = useState("")

    function handleReuse(entry: SearchHistory) {
        setUrl(entry.url)
        setCurrency(entry.currency)
        setUserPrompt(entry.userPrompt)
        if (entry.tripId) {
            const trip = trips.find((t) => t.id === entry.tripId)
            if (trip) setSelectedTrip(trip)
        }
    }

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            await findAirbnbStayByUrlFromFormData(formData)
            setUrl("")
            setUserPrompt("")
        })
    }

    return (
        <div className="mb-10 animate-fadeIn">
            <SearchHistoryList history={history} onReuse={handleReuse} />

            <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                {/* Subtle top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <form action={handleSubmit} className="relative z-10 p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-7">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white/90">Find your perfect stay</h2>
                            <p className="text-xs text-white/35">Paste an Airbnb link and describe what you want</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* URL + selectors */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-end">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                                    Search URL
                                </label>
                                <input
                                    type="url"
                                    name="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://airbnb.com/s/Monaco/homes?..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white focus:outline-none focus:border-primary/40 transition-all duration-200 cursor-pointer min-w-[120px]"
                                >
                                    {currencies.map((c) => (
                                        <option key={c.value} value={c.value} className="bg-[#0c0c0e] text-white">
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                                    Trip
                                </label>
                                <TripSelector />
                                <input type="hidden" name="tripId" value={selectedTrip?.id || ""} />
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                                Your preferences
                            </label>
                            <textarea
                                name="userPrompt"
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                placeholder="I want a private room with a double bed, shared bathroom is OK, quiet neighborhood preferred..."
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all duration-200 resize-none"
                                required
                            />
                        </div>

                        <input type="hidden" name="aiModel" value={process.env.NEXT_PUBLIC_AI_MODEL} />

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-4 text-[10px] text-white/20">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                                    <span>AI Ready</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Local</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-rose-500 text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isPending ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Find Stays</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
