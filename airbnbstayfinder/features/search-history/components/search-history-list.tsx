"use client"

import { SearchHistory } from "@/features/search-history/search-history"
import { useState } from "react"

type Props = {
    history: SearchHistory[]
    onReuse: (entry: SearchHistory) => void
}

function timeAgo(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
}

function extractLocation(url: string): string {
    try {
        const match = url.match(/\/s\/([^/]+)/)
        if (match) return decodeURIComponent(match[1]).replace(/-/g, " ")
    } catch { }
    return "Search"
}

export default function SearchHistoryList({ history, onReuse }: Props) {
    const [expanded, setExpanded] = useState(false)

    if (history.length === 0) return null

    const visible = expanded ? history : history.slice(0, 4)

    return (
        <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-[3px] h-3.5 rounded-full bg-gradient-to-b from-primary to-rose-600" />
                    <span className="text-[10px] font-medium text-white/25 uppercase tracking-widest">Recent</span>
                </div>
                {history.length > 4 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[10px] text-white/20 hover:text-white/40 transition-colors cursor-pointer"
                    >
                        {expanded ? "Less" : `+${history.length - 4}`}
                    </button>
                )}
            </div>

            <div className="flex gap-2 flex-wrap">
                {visible.map((entry) => (
                    <button
                        key={entry.id}
                        onClick={() => onReuse(entry)}
                        className="group flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 hover:bg-primary/[0.03] transition-all duration-200 cursor-pointer"
                    >
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-xs font-medium text-white/50 group-hover:text-white/70 transition-colors truncate max-w-[160px]">
                                {extractLocation(entry.url)}
                            </span>
                            <span className="text-[10px] text-white/15 truncate max-w-[160px]">
                                {entry.userPrompt}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] text-white/15 tabular-nums">{entry.resultCount}r</span>
                            <span className="text-[9px] text-white/10 tabular-nums">{timeAgo(entry.createdAt)}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
