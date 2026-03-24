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
    const score = stay.compatibilityScore
    const scoreGradient = score >= 80
        ? "from-emerald-400 to-green-500"
        : score >= 50
            ? "from-amber-400 to-orange-400"
            : "from-red-400 to-rose-500"

    const scoreText = score >= 80
        ? "text-emerald-400"
        : score >= 50
            ? "text-amber-400"
            : "text-red-400"

    const scoreBg = score >= 80
        ? "bg-emerald-500/12"
        : score >= 50
            ? "bg-amber-500/12"
            : "bg-red-500/12"

    const cardStyle = variant === "interested"
        ? "border-emerald-500/20 hover:border-emerald-500/30"
        : variant === "rejected"
            ? "border-white/[0.04] opacity-50 hover:opacity-65"
            : "border-white/[0.06] hover:border-white/[0.12]"

    return (
        <div className={`group relative rounded-2xl border ${cardStyle} bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:bg-white/[0.04] animate-slideUp flex flex-col h-full w-full`}>
            {/* Image section */}
            <div className="relative h-[200px] overflow-hidden flex-shrink-0">
                {stay.images?.[0]?.imageUrl ? (
                    <Image
                        src={stay.images[0].imageUrl}
                        alt={stay.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/[0.06] to-white/[0.02] flex items-center justify-center">
                        <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#050506]/20 to-transparent" />

                {/* Score + badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${scoreBg} backdrop-blur-md`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${scoreGradient}`} />
                        <span className={`text-xs font-bold ${scoreText} tabular-nums`}>{score}</span>
                    </div>
                    {stay.isFreeCancellation && (
                        <div className="px-2 py-1 rounded-lg bg-emerald-500/10 backdrop-blur-md text-[10px] font-medium text-emerald-400/90">
                            Free cancel
                        </div>
                    )}
                </div>

                {/* External link */}
                <a
                    href={`https://www.airbnb.com/rooms/${stay.room_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/[0.08] backdrop-blur-md flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/[0.15] transition-all duration-200"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>

                {/* Title overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-white text-[15px] leading-tight truncate">{stay.title}</h3>
                    <p className="text-xs text-white/45 truncate mt-0.5">{stay.subTitle}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3.5 flex-1">
                {/* Stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {stay.rating != null && (
                            <div className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-medium text-white/80">{stay.rating.toFixed(1)}</span>
                                {stay.ratingCount != null && (
                                    <span className="text-xs text-white/25">({stay.ratingCount})</span>
                                )}
                            </div>
                        )}
                        {stay.personCapacity != null && (
                            <div className="flex items-center gap-1 text-white/25 text-xs">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>{stay.personCapacity}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-white">${Math.round(stay.price).toLocaleString()}</span>
                        {stay.priceDiscount != null && stay.priceDiscount > 0 && stay.priceDiscount < stay.price && (
                            <span className="text-xs text-white/20 line-through ml-1.5">${Math.round(stay.priceDiscount).toLocaleString()}</span>
                        )}
                    </div>
                </div>

                {/* AI Resume */}
                {stay.resume && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex-1">
                        <div className="flex items-start gap-2.5">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-md bg-gradient-to-br ${scoreGradient} flex items-center justify-center mt-0.5`}>
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-[13px] text-white/45 leading-relaxed">{stay.resume}</p>
                        </div>
                    </div>
                )}
                {!stay.resume && <div className="flex-1" />}

                {/* Score bar */}
                <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${scoreGradient} transition-all duration-700 ease-out`}
                        style={{ width: `${score}%` }}
                    />
                </div>

                {/* Actions */}
                {variant === "pending" && (
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={onNotInterested}
                            disabled={busy}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/[0.06] text-white/35 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/[0.06] transition-all duration-200 disabled:opacity-40 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-xs font-medium">Skip</span>
                        </button>
                        <button
                            onClick={onInterested}
                            disabled={busy}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-rose-500 text-white font-medium shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:brightness-110 transition-all duration-200 disabled:opacity-40 cursor-pointer"
                        >
                            {busy ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                            <span className="text-xs">Save</span>
                        </button>
                    </div>
                )}

                {variant === "interested" && (
                    <div className="flex items-center justify-center gap-1.5 py-2 text-emerald-400/60">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium">Saved</span>
                    </div>
                )}

                {variant === "rejected" && (
                    <div className="flex items-center justify-center gap-1.5 py-2 text-white/15">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-xs">Skipped</span>
                    </div>
                )}
            </div>
        </div>
    )
}
