import { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 transition-all duration-300",
                hover && "hover:border-primary/50 hover:bg-white/10 hover:scale-105",
                className
            )}
        >
            {children}
        </div>
    )
}
