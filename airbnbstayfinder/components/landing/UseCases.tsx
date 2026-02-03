"use client"

import { useState } from "react"
import { Container } from "./ui/Container"
import { Section } from "./ui/Section"

const personas = [
    {
        icon: "💼",
        title: "Digital Nomads",
        subtitle: "Work from anywhere",
        description: "Find work-friendly stays with reliable wifi, dedicated workspaces, and quiet environments across multiple cities.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        features: ["Wifi requirements", "Workspace check", "Multi-city planning"],
        stat: "12+ cities",
        statLabel: "avg per year",
    },
    {
        icon: "🗺️",
        title: "Multi-destination Planners",
        subtitle: "Organize everything",
        description: "Plan multiple trips simultaneously with different criteria, budgets, and timelines—all in one place.",
        gradient: "from-purple-500/20 to-pink-500/20",
        features: ["Trip separation", "Budget tracking", "Timeline management"],
        stat: "5+ trips",
        statLabel: "organized",
    },
    {
        icon: "⭐",
        title: "Picky Travelers",
        subtitle: "Specific requirements",
        description: "Have nuanced preferences? Our AI understands complex criteria like 'quiet neighborhood' or 'walkable to metro'.",
        gradient: "from-yellow-500/20 to-orange-500/20",
        features: ["Natural language", "Nuanced matching", "Precise scoring"],
        stat: "50+ filters",
        statLabel: "understood",
    },
    {
        icon: "⏱️",
        title: "Time Savers",
        subtitle: "Minutes not hours",
        description: "Stop endless scrolling. Get AI-ranked results in seconds and make decisions faster with confidence.",
        gradient: "from-green-500/20 to-emerald-500/20",
        features: ["Instant analysis", "Smart ranking", "Quick decisions"],
        stat: "10x faster",
        statLabel: "than manual",
    },
]

export function UseCases() {
    const [activePersona, setActivePersona] = useState(0)

    return (
        <Section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.08),transparent_40%)]" />

            <Container className="relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[var(--color-border-primary)] mb-6">
                        <span className="text-sm text-white/60">Built for you</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient">Who it's for</h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Built for travelers who value their time and have specific needs
                    </p>
                </div>

                <div className="hidden lg:grid lg:grid-cols-12 gap-8">
                    <div className="col-span-5 space-y-4">
                        {personas.map((persona, i) => (
                            <button
                                key={i}
                                onClick={() => setActivePersona(i)}
                                className={`w-full text-left p-5 rounded-2xl border transition-all duration-500 ${activePersona === i
                                        ? `bg-gradient-to-r ${persona.gradient} border-white/20`
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/15'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${activePersona === i ? `bg-gradient-to-br ${persona.gradient}` : 'bg-white/10'
                                        }`}>
                                        {persona.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{persona.title}</h3>
                                        <p className="text-sm text-white/50">{persona.subtitle}</p>
                                    </div>
                                    <div className={`transition-all duration-300 ${activePersona === i ? 'opacity-100' : 'opacity-0'}`}>
                                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="col-span-7">
                        <div className={`relative h-full rounded-3xl border border-white/10 bg-gradient-to-br ${personas[activePersona].gradient} p-8 overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-5xl">
                                        {personas[activePersona].icon}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold text-white">{personas[activePersona].stat}</div>
                                        <div className="text-sm text-white/50">{personas[activePersona].statLabel}</div>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-bold mb-2">{personas[activePersona].title}</h3>
                                <p className="text-white/70 text-lg mb-8 leading-relaxed">{personas[activePersona].description}</p>

                                <div className="mt-auto">
                                    <div className="text-sm text-white/50 mb-3">Key benefits</div>
                                    <div className="flex flex-wrap gap-3">
                                        {personas[activePersona].features.map((feature, i) => (
                                            <div key={i} className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-sm">
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personas.map((persona, i) => (
                        <div
                            key={i}
                            className={`relative rounded-2xl border border-white/10 bg-gradient-to-br ${persona.gradient} p-6 overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                                        {persona.icon}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{persona.stat}</div>
                                        <div className="text-xs text-white/50">{persona.statLabel}</div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-1">{persona.title}</h3>
                                <p className="text-sm text-white/50 mb-3">{persona.subtitle}</p>
                                <p className="text-sm text-white/70 leading-relaxed mb-4">{persona.description}</p>

                                <div className="flex flex-wrap gap-2">
                                    {persona.features.map((feature, j) => (
                                        <div key={j} className="px-3 py-1 rounded-lg bg-white/10 text-xs">
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    )
}
