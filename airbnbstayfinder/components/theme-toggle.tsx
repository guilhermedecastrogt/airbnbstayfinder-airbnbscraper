"use client"

import { useTheme } from "@/components/theme-provider"
import { HiSun, HiMoon } from "react-icons/hi"

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-12 h-12 rounded-2xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-all duration-300 group"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <HiSun
                    size={24}
                    className="transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                />
            ) : (
                <HiMoon
                    size={24}
                    className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"
                />
            )}
        </button>
    )
}
