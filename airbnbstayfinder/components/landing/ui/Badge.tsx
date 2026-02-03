import { ReactNode } from "react"
import { cn } from "@/lib/cn"

interface BadgeProps {
    children: ReactNode
    className?: string
}

export function Badge({ children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30",
                className
            )}
        >
            {children}
        </span>
    )
}
