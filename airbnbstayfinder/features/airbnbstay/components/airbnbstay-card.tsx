"use client"

import Image from "next/image"
import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"

type Props = {
    stay: AirbnbStay
    variant: "pending" | "interested" | "rejected"
    busy?: boolean
    onInterested?: () => void
    onNotInterested?: () => void
}

export default function AirbnbStayCard({ stay, variant, busy, onInterested, onNotInterested }: Props) {
    const scoreColor = stay.compatibilityScore >= 80
        ? "from-green-500 to-emerald-500"
        : stay.compatibilityScore >= 50
            ? "from-yellow-500 to-orange-500"
            : "from-red-500 to-rose-500"

    const scoreTextColor = stay.compatibilityScore >= 80
        ? "text-green-400"
        : stay.compatibilityScore >= 50
            ? "text-yellow-400"
            : "text-red-400"

    return (
        <div className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 ${variant === "interested"
            ? "border-green-500/30 bg-green-500/5"
            : variant === "rejected"
                ? "border-red-500/20 bg-red-500/5 opacity-60"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            }`}>
            <div className="relative h-48 overflow-hidden">
                {stay.images?.[0]?.imageUrl ? (
                    <Image
                        src={stay.images[0].imageUrl}
                        alt={stay.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                        <span className="text-4xl">🏠</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${scoreColor} text-white text-sm font-bold shadow-lg`}>
                        {stay.compatibilityScore}
                    </div>
                    {stay.isFreeCancellation && (
                        <div className="px-2 py-1 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-xs text-green-400">
                            Free Cancel
                        </div>
                    )}
                </div>

                <div className="absolute top-3 right-3">
                    <a
                        href={`https://www.airbnb.com/rooms/${stay.room_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-white truncate">{stay.title}</h3>
                    <p className="text-sm text-white/60 truncate">{stay.subTitle}</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {stay.rating && (
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm font-medium">{stay.rating.toFixed(1)}</span>
                                {stay.ratingCount && (
                                    <span className="text-xs text-white/40">({stay.ratingCount})</span>
                                )}
                            </div>
                        )}
                        {stay.personCapacity && (
                            <div className="flex items-center gap-1 text-white/50 text-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>{stay.personCapacity}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold">${stay.price}</div>
                        {stay.priceDiscount && stay.priceDiscount < stay.price && (
                            <div className="text-xs text-white/40 line-through">${stay.priceDiscount}</div>
                        )}
                    </div>
                </div>

                {stay.resume && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-2">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${scoreColor} flex items-center justify-center`}>
                                <span className="text-[10px] text-white font-bold">AI</span>
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed">{stay.resume}</p>
                        </div>
                    </div>
                )}

                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${scoreColor} transition-all duration-500`}
                        style={{ width: `${stay.compatibilityScore}%` }}
                    />
                </div>

                {variant === "pending" && (
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={onNotInterested}
                            disabled={busy}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-sm font-medium">Reject</span>
                        </button>
                        <button
                            onClick={onInterested}
                            disabled={busy}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {busy ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                            <span className="text-sm">Interested</span>
                        </button>
                    </div>
                )}

                {variant === "interested" && (
                    <div className="flex items-center justify-center gap-2 py-2 text-green-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Added to favorites</span>
                    </div>
                )}

                {variant === "rejected" && (
                    <div className="flex items-center justify-center gap-2 py-2 text-white/40">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm">Rejected</span>
                    </div>
                )}
            </div>
        </div>
    )
}
