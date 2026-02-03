"use client"

import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"
import { HiExternalLink, HiStar } from "react-icons/hi"

type Props = {
    stay: AirbnbStay
    variant?: "pending" | "interested" | "not-interested"
    onInterested?: () => void
    onNotInterested?: () => void
    busy?: boolean
}

export default function AirbnbStayCard({
    stay,
    variant = "pending",
    onInterested,
    onNotInterested,
    busy = false
}: Props) {
    const airbnbUrl = `https://www.airbnb.com/rooms/${stay.room_id}`

    return (
        <div className="group relative border border-[var(--color-border-primary)] rounded-3xl overflow-hidden bg-[var(--color-card-bg)] backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5">
            <div className="aspect-[16/10] bg-[var(--color-bg-secondary)] overflow-hidden">
                {stay.images?.[0]?.imageUrl ? (
                    <img
                        src={stay.images[0].imageUrl}
                        alt={stay.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
                        No image
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <a
                        href={airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/70 transition-all"
                    >
                        <HiExternalLink size={16} />
                    </a>
                </div>
                {stay.compatibilityScore >= 70 && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md text-white text-xs font-semibold">
                        {stay.compatibilityScore}% match
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug line-clamp-2 text-[var(--color-text)]">
                        {stay.title}
                    </h3>
                    {typeof stay.rating === "number" && (
                        <div className="flex items-center gap-1 text-sm text-amber-500 shrink-0">
                            <HiStar size={14} />
                            <span>{stay.rating.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{stay.subTitle}</p>

                <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${stay.isCompatible ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/20 text-red-600 dark:text-red-400"}`}>
                        {stay.isCompatible ? "Compatible" : "Not compatible"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
                        Score: {stay.compatibilityScore}
                    </span>
                </div>

                <p className="text-sm text-[var(--color-muted)] line-clamp-3">{stay.resume}</p>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--color-border-primary)]">
                    <div className="text-sm text-[var(--color-muted)]">
                        {stay.personCapacity ? `${stay.personCapacity} guests` : ""}
                    </div>
                    <div className="text-base font-semibold text-[var(--color-text)]">
                        ${stay.priceDiscount ?? stay.price}
                    </div>
                </div>

                {variant === "pending" && (
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={onNotInterested}
                            className="flex-1 border border-[var(--color-border-primary)] rounded-2xl px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:border-red-500/50 hover:text-red-500 transition-all disabled:opacity-50"
                        >
                            {busy ? "Saving..." : "Not interested"}
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={onInterested}
                            className="flex-1 bg-primary/90 hover:bg-primary rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                        >
                            {busy ? "Saving..." : "Interested"}
                        </button>
                    </div>
                )}

                {variant === "interested" && (
                    <div className="pt-2">
                        <a
                            href={airbnbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-primary/90 hover:bg-primary rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
                        >
                            <HiExternalLink size={16} />
                            View on Airbnb
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
