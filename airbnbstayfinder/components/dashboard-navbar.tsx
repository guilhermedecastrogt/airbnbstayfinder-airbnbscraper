"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
    {
        href: "/dashboard",
        label: "Pending",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: "yellow",
    },
    {
        href: "/dashboard/interested",
        label: "Interested",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        color: "green",
    },
    {
        href: "/dashboard/not-interested",
        label: "Rejected",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        color: "red",
    },
]

export default function DashboardNavbar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8">
                <Link href="/" className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Home</span>
                </Link>
            </div>

            <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const colorClasses = {
                        yellow: isActive ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "text-white/50 hover:text-yellow-400 hover:bg-yellow-500/10",
                        green: isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "text-white/50 hover:text-green-400 hover:bg-green-500/10",
                        red: isActive ? "bg-red-500/20 text-red-400 border-red-500/30" : "text-white/50 hover:text-red-400 hover:bg-red-500/10",
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 ${isActive ? colorClasses[item.color as keyof typeof colorClasses] + " border" : colorClasses[item.color as keyof typeof colorClasses] + " border-transparent"
                                }`}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="mt-auto pt-8">
                <a
                    href="https://github.com/guilhermedecastrogt/airbnbstayfinder-airbnbscraper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-transparent text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-[10px]">GitHub</span>
                </a>
            </div>
        </div>
    )
}
