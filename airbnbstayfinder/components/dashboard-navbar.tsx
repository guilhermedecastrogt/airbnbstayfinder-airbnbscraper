"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { HiHome, HiHeart, HiXCircle } from "react-icons/hi"

const navItems = [
    { href: "/dashboard", icon: HiHome, label: "Pending" },
    { href: "/dashboard/interested", icon: HiHeart, label: "Interested" },
    { href: "/dashboard/not-interested", icon: HiXCircle, label: "Rejected" },
]

export function DashboardNavbar() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-2 justify-between items-center bg-[var(--color-card-bg)] backdrop-blur-md border border-[var(--color-border-primary)] py-8 rounded-[50px] relative overflow-hidden min-h-[500px]">
            <div className="rounded-[50px] pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(255,90,95,0.08),transparent)]" />

            <div className="flex flex-col items-center gap-6">
                <Image
                    src="/images/airbnb-tile.svg"
                    alt=""
                    width={45}
                    height={45}
                    className="mb-4"
                />

                <div className="flex flex-col gap-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group ${isActive
                                    ? "bg-primary/20 text-primary"
                                    : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                                    }`}
                            >
                                <item.icon
                                    size={24}
                                    className="transform transition-transform duration-300 group-hover:scale-110"
                                />
                                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border-primary)] text-[var(--color-text)] text-sm whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
                                    {item.label}
                                </span>
                                {isActive && (
                                    <span className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}

export default DashboardNavbar