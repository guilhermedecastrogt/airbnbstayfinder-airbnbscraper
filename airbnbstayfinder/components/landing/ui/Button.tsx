import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/cn"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary"
    children: ReactNode
}

export function Button({ variant = "primary", children, className, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                "px-6 py-3 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 cursor-pointer",
                variant === "primary" &&
                "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105",
                variant === "secondary" &&
                "border-2 border-white/20 text-white hover:border-primary hover:bg-primary/10 backdrop-blur-sm",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
