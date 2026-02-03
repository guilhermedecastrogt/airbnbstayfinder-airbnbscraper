"use client"

import { useState } from "react"
import { Container } from "./ui/Container"
import { Section } from "./ui/Section"

const steps = [
    {
        number: "01",
        title: "Paste your search",
        subtitle: "Copy your Airbnb URL",
        description: "Grab your Airbnb search link with all your filters already applied—location, dates, price range, amenities. We'll analyze exactly what you're looking for.",
        visual: (
            <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 overflow-hidden p-4">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-3xl" />
                <div className="text-xs text-white/40 mb-2">Search URL</div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="mt-2 text-xs text-white/60 font-mono truncate">
                        https://airbnb.com/s/Monaco/homes?adults=2&...
                    </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 border-2 border-primary/30 rounded-full" />
            </div>
        ),
    },
    {
        number: "02",
        title: "Describe preferences",
        subtitle: "Natural language input",
        description: "Tell us what matters in plain English. Private room? Ensuite bathroom? Near the beach? Our AI understands context and nuance like a human would.",
        visual: (
            <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 overflow-hidden p-4">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="text-xs text-white/40 mb-2">Your preferences</div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/10 space-y-1">
                    <div className="text-xs text-white/80">"I need a private room with</div>
                    <div className="text-xs text-primary">double bed</div>
                    <div className="text-xs text-white/80">shared bathroom is OK,</div>
                    <div className="text-xs text-primary">quiet neighborhood</div>
                    <div className="text-xs text-white/80">preferred"</div>
                </div>
            </div>
        ),
    },
    {
        number: "03",
        title: "AI analysis",
        subtitle: "Local inference engine",
        description: "Our local AI reads every listing, extracts key details, and scores them 0–100 based on your requirements. Private, fast, and accurate.",
        visual: (
            <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 overflow-hidden p-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,90,95,0.1),transparent_60%)]" />
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center animate-pulse">
                        <div className="w-14 h-14 rounded-full border-4 border-primary/50 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-xs font-bold">AI</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-2 -right-2 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-[10px] text-green-400">LOCAL</div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 h-2 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
                </div>
            </div>
        ),
    },
    {
        number: "04",
        title: "Triage results",
        subtitle: "Organize by trip",
        description: "Review scored stays, mark as Interested or Not Interested, and organize everything by trip. Monaco summer? Dublin work trip? Keep them separate.",
        visual: (
            <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 overflow-hidden p-4">
                <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="space-y-2">
                    {[
                        { name: "Modern Loft", score: 94, interested: true },
                        { name: "Cozy Studio", score: 87, interested: true },
                        { name: "Shared Room", score: 32, interested: false },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-2 py-1.5 border border-white/5">
                            <div className={`text-sm font-bold ${item.score >= 80 ? 'text-primary' : 'text-white/40'}`}>{item.score}</div>
                            <div className="text-xs text-white/60 flex-1 truncate">{item.name}</div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${item.interested ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}`}>
                                {item.interested ? '✓' : '✕'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
]

export function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0)

    return (
        <Section id="how-it-works" className="overflow-hidden">
            <Container>
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-[var(--color-border-primary)] mb-6">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm text-primary font-medium">Simple 4-step process</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient">How it works</h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        From search link to organized results in under a minute
                    </p>
                </div>

                <div className="hidden lg:block">
                    <div className="relative">
                        <div className="grid grid-cols-4 gap-8">
                            {steps.map((step, i) => (
                                <div
                                    key={i}
                                    className="relative group cursor-pointer"
                                    onMouseEnter={() => setActiveStep(i)}
                                >
                                    <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${activeStep === i ? 'bg-primary scale-110 shadow-lg shadow-primary/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                                        <span className="font-bold text-lg">{step.number}</span>
                                    </div>

                                    <div className={`pt-16 transition-all duration-500 ${activeStep === i ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}>
                                        <div className="text-xs text-primary/80 uppercase tracking-wider mb-2">{step.subtitle}</div>
                                        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                        <p className="text-sm text-white/60 leading-relaxed mb-4">{step.description}</p>

                                        <div className={`transition-all duration-500 transform ${activeStep === i ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                            {step.visual}
                                        </div>
                                    </div>


                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:hidden space-y-8">
                    {steps.map((step, i) => (
                        <div key={i} className="relative">
                            {i < steps.length - 1 && (
                                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                            )}

                            <div className="flex gap-6">
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                        <span className="font-bold">{step.number}</span>
                                    </div>
                                </div>

                                <div className="flex-1 pb-8">
                                    <div className="text-xs text-primary/80 uppercase tracking-wider mb-1">{step.subtitle}</div>
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-sm text-white/60 leading-relaxed mb-4">{step.description}</p>
                                    {step.visual}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-black flex items-center justify-center text-xs">🚀</div>
                            <div className="w-8 h-8 rounded-full bg-purple-500/30 border-2 border-black flex items-center justify-center text-xs">⚡</div>
                            <div className="w-8 h-8 rounded-full bg-cyan-500/30 border-2 border-black flex items-center justify-center text-xs">🎯</div>
                        </div>
                        <span className="text-white/60">Average time: <span className="text-white font-semibold">45 seconds</span> per search</span>
                    </div>
                </div>
            </Container>
        </Section>
    )
}
