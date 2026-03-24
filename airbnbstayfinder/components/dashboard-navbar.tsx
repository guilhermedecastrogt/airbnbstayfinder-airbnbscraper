"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
    {
        href: "/dashboard",
        label: "Pending",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        activeColor: "text-primary",
        activeBg: "bg-primary/10",
    },
    {
        href: "/dashboard/interested",
        label: "Saved",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        activeColor: "text-green-400",
        activeBg: "bg-green-500/10",
    },
    {
        href: "/dashboard/not-interested",
        label: "Skipped",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        activeColor: "text-red-400",
        activeBg: "bg-red-500/10",
    },
]

export default function DashboardNavbar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col items-center h-full py-6 px-2">
            {/* Logo */}
            <Link href="/" className="group mb-10">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-300 group-hover:shadow-primary/40 group-hover:scale-110">
                    <span className="text-white font-bold text-xs tracking-tight">Af</span>
                </div>
            </Link>

            {/* Nav */}
            <nav className="flex flex-col items-center gap-1.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex flex-col items-center gap-1 w-[56px] py-2.5 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? `${item.activeBg} ${item.activeColor}`
                                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                            }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3.5 rounded-r-full bg-current" />
                            )}
                            {item.icon}
                            <span className="text-[9px] font-medium tracking-wide opacity-80">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* GitHub */}
            <div className="mt-auto">
                <a
                    href="https://github.com/guilhermedecastrogt/airbnbstayfinder-airbnbscraper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-white/15 hover:text-white/40 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                </a>
            </div>
        </div>
    )
}
