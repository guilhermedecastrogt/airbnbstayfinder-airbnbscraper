import { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost" | "danger" | "glass"
}

export default function Button({ variant = "default", className, ...props }: Props) {
    const base = "px-3 py-1 rounded-[50px] text-sm transition-all duration-200"
    const styles =
        variant === "default"
            ? "bg-primary text-white"
            : variant === "ghost"
                ? "bg-transparent text-black border border-gray-300"
                : variant === "danger"
                    ? "bg-red-600 text-white"
                    : "bg-white/10 text-white border border-primary backdrop-blur-md shadow-sm hover:bg-white/20 hover:border-white/30 active:scale-[0.98]"

    const cn = className ? base + " " + styles + " " + className : base + " " + styles
    return <button {...props} className={cn} />
}