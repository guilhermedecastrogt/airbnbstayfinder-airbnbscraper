"use client"

import Image from "next/image"
import { Container } from "./ui/Container"
import { Button } from "./ui/Button"
import { Badge } from "./ui/Badge"

export function Hero() {
    return (
        <div className="relative min-h-screen flex items-center pt-16 overflow-hidden">
            <Image
                src="/images/hero2.svg"
                alt=""
                width={1920}
                height={1080}
                className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
                priority
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,90,95,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(138,43,226,0.1),transparent_50%)]" />

            <Container className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-[var(--color-border-primary)] backdrop-blur-sm">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-400 font-medium">Open Source</span>
                                </div>
                                <div className="w-px h-4 bg-white/20" />
                                <span className="text-sm text-white/60">AI-Powered Stay Finder</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1]">
                                <span className="text-gradient">Find the perfect</span>
                                <br />
                                <span className="text-white">Airbnb stay</span>
                                <br />
                                <span className="text-gradient">with AI</span>
                            </h1>
                        </div>

                        <p className="text-xl text-white/70 max-w-lg leading-relaxed">
                            Paste your Airbnb search link, describe what you want in
                            <span className="text-white font-medium"> plain English</span>, and get ranked stays with a
                            <span className="text-primary font-semibold"> 0–100 compatibility score</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="primary"
                                className="text-lg px-8 py-4"
                                onClick={() => window.open('https://github.com/guilhermedecastrogt/airbnbstayfinder-airbnbscraper', '_blank')}
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    View on GitHub
                                </span>
                            </Button>
                            <Button
                                variant="secondary"
                                className="text-lg px-8 py-4"
                                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                See features
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {["🚀", "⚡", "🎯"].map((emoji, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-sm">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-white/50">Fast & Accurate</span>
                            </div>
                            <div className="w-px h-6 bg-white/20" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/50">Local AI</span>
                                <div className="px-2 py-1 rounded bg-green-500/20 text-xs text-green-400">Private</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-60" />

                        <div className="relative rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                <span className="ml-4 text-sm text-white/40">Dashboard Preview</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                        🏠
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-white/40 mb-1">Current Trip</div>
                                        <div className="text-sm font-medium">Monaco Summer 2026</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { name: "Modern Loft in Monaco", score: 94, rating: "4.9", type: "Private room", interested: true },
                                        { name: "Cozy Studio Downtown", score: 87, rating: "4.7", type: "Entire apt", interested: true },
                                        { name: "Shared Room Central", score: 32, rating: "4.2", type: "Shared room", interested: false },
                                    ].map((stay, i) => (
                                        <div
                                            key={i}
                                            className={`relative p-4 rounded-2xl border transition-all duration-300 ${stay.interested
                                                    ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/30'
                                                    : 'bg-white/5 border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm mb-1 truncate">{stay.name}</div>
                                                    <div className="flex items-center gap-2 text-xs text-white/50">
                                                        <span>⭐ {stay.rating}</span>
                                                        <span>•</span>
                                                        <span>{stay.type}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-bold ${stay.score >= 80 ? 'text-primary' : stay.score >= 50 ? 'text-yellow-400' : 'text-white/40'}`}>
                                                            {stay.score}
                                                        </div>
                                                        <div className="text-[10px] text-white/40">score</div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${stay.interested ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'
                                                        }`}>
                                                        {stay.interested ? '✓' : '✕'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${stay.score >= 80 ? 'bg-gradient-to-r from-primary to-orange-500' :
                                                            stay.score >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                                'bg-white/20'
                                                        }`}
                                                    style={{ width: `${stay.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-xs text-white/40">3 stays analyzed</div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium">
                                            2 Interested
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl p-4 flex flex-col justify-center items-center">
                            <div className="text-3xl font-bold text-primary">45s</div>
                            <div className="text-xs text-white/50 text-center">avg analysis time</div>
                        </div>
                    </div>
                </div>
            </Container>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
                    <div className="w-1 h-2 rounded-full bg-white/40" />
                </div>
            </div>
        </div>
    )
}
