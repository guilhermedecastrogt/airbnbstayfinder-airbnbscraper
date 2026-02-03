"use client"

import { Container } from "./ui/Container"
import { Section } from "./ui/Section"
import { Button } from "./ui/Button"

export function FinalCTA() {
    return (
        <Section>
            <Container>
                <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-md p-12 md:p-16 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,90,95,0.2),transparent_70%)]" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
                            Ready to find your perfect stay?
                        </h2>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Stop wasting hours searching through listings. Let AI do the work and find stays that actually match what you need.
                        </p>
                        <Button
                            variant="primary"
                            className="mb-4"
                            onClick={() => window.open('https://github.com/guilhermedecastrogt/airbnbstayfinder-airbnbscraper', '_blank')}
                        >
                            View on GitHub
                        </Button>
                        <div className="text-sm text-white/60 italic mt-4">
                            Open source. Stop searching. Start finding.
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    )
}
