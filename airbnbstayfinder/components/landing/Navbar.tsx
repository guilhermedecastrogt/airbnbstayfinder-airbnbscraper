"use client"

import { useState, useEffect } from "react"
import { Container } from "./ui/Container"
import { Button } from "./ui/Button"

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#demo", label: "Demo" },
    { href: "#faq", label: "FAQ" },
]

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState("")

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)

            const sections = navLinks.map(link => link.href.replace("#", ""))
            for (const section of sections.reverse()) {
                const element = document.getElementById(section)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    if (rect.top <= 100) {
                        setActiveSection(section)
                        break
                    }
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToSection = (href: string) => {
        const element = document.getElementById(href.replace("#", ""))
        element?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? "py-3 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
                    : "py-5 bg-transparent"
                }`}
        >
            <Container>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">AirbnbStayFinder</div>
                            <div className="text-[10px] text-white/40 -mt-0.5">AI-Powered Search</div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center">
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            {navLinks.map((link) => {
                                const isActive = activeSection === link.href.replace("#", "")
                                return (
                                    <button
                                        key={link.href}
                                        onClick={() => scrollToSection(link.href)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${isActive
                                                ? "bg-white/10 text-white"
                                                : "text-white/60 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {link.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-green-400 font-medium">Open Source</span>
                        </div>

                        <Button
                            variant="primary"
                            className="flex items-center gap-2"
                            onClick={() => window.open('https://github.com/guilhermedecastrogt/airbnbstayfinder-airbnbscraper', '_blank')}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="hidden sm:inline">GitHub</span>
                        </Button>
                    </div>
                </div>
            </Container>
        </nav>
    )
}
