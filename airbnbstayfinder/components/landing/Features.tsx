"use client"

import { useState } from "react"
import { Container } from "./ui/Container"
import { Section } from "./ui/Section"

const features = [
    {
        icon: "🤖",
        title: "AI Listing Analysis",
        description: "Advanced AI reads and understands each listing, extracting key details automatically",
        gradient: "from-primary/20 to-orange-500/20",
        accentColor: "primary",
        stats: "50+ data points",
    },
    {
        icon: "📊",
        title: "Compatibility Score",
        description: "Every stay gets a precise 0–100 score based on your requirements",
        gradient: "from-blue-500/20 to-cyan-500/20",
        accentColor: "blue-400",
        stats: "0-100 precision",
    },
    {
        icon: "✅",
        title: "Smart Triage System",
        description: "Mark listings as Interested or Not Interested for easy organization",
        gradient: "from-green-500/20 to-emerald-500/20",
        accentColor: "green-400",
        stats: "One-click action",
    },
    {
        icon: "🗂️",
        title: "Multi-trip Management",
        description: "Organize searches by trip name for multiple destinations",
        gradient: "from-purple-500/20 to-pink-500/20",
        accentColor: "purple-400",
        stats: "Unlimited trips",
    },
    {
        icon: "📝",
        title: "Smart Summaries",
        description: "AI-generated summaries highlighting rating, room type, and bathroom sharing",
        gradient: "from-yellow-500/20 to-amber-500/20",
        accentColor: "yellow-400",
        stats: "Key insights",
    },
    {
        icon: "🔒",
        title: "Local AI Inference",
        description: "Private, local AI analysis—your preferences never leave your system",
        gradient: "from-red-500/20 to-rose-500/20",
        accentColor: "red-400",
        stats: "100% private",
    },
]

const heroFeature = {
    icon: "⚡",
    title: "Lightning Fast Results",
    description: "Get analyzed results in seconds, not hours of manual searching. Our optimized engine processes listings at incredible speed while maintaining accuracy.",
    gradient: "from-primary/30 via-purple-500/20 to-cyan-500/30",
}

export function Features() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <Section id="features" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,90,95,0.08),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.08),transparent_40%)]" />

            <Container className="relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[var(--color-border-primary)] mb-6">
                        <span className="text-sm text-white/60">Built for power users</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient">Powerful features</h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Everything you need to find the perfect Airbnb, organized and automated
                    </p>
                </div>

                <div className="mb-12">
                    <div className={`relative rounded-3xl p-8 md:p-12 border border-white/10 bg-gradient-to-br ${heroFeature.gradient} backdrop-blur-sm overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-5xl shadow-2xl shadow-primary/30">
                                    {heroFeature.icon}
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-bold mb-3">{heroFeature.title}</h3>
                                <p className="text-white/70 text-lg max-w-2xl">{heroFeature.description}</p>
                            </div>
                            <div className="flex-shrink-0 hidden lg:block">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-primary">45s</div>
                                        <div className="text-sm text-white/50">avg time</div>
                                    </div>
                                    <div className="w-px h-12 bg-white/20" />
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-primary">50+</div>
                                        <div className="text-sm text-white/50">listings</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="group relative"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                            <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:transform group-hover:scale-[1.02]">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        {feature.icon}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 transition-all duration-300 ${hoveredIndex === i ? 'bg-white/10 text-white/70' : ''}`}>
                                        {feature.stats}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">{feature.title}</h3>
                                <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/70 transition-colors">{feature.description}</p>

                                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex justify-center">
                    <div className="flex flex-wrap justify-center gap-4">
                        {["Open Source", "TypeScript", "Next.js 16", "Prisma", "Local AI"].map((tech, i) => (
                            <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-[var(--color-border-primary)] text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-default">
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </Section>
    )
}
