import { Container } from "./ui/Container"
import { Section } from "./ui/Section"
import { Card } from "./ui/Card"

export function ProblemSolution() {
    const problems = [
        "Endless scrolling through hundreds of listings",
        "Manually comparing prices and amenities",
        "Reading long descriptions to find key details",
        "Uncertainty about room or bathroom sharing",
    ]

    return (
        <Section>
            <Container>
                <div className="grid lg:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                            Stop wasting hours searching
                        </h2>
                        <div className="space-y-4">
                            {problems.map((problem, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                    </div>
                                    <p className="text-white/70">{problem}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                            Let AI do the work
                        </h2>
                        <Card className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <div className="text-primary font-semibold mb-2">1. Paste your link</div>
                                    <p className="text-white/60 text-sm">Copy your Airbnb search URL with all filters applied</p>
                                </div>
                                <div>
                                    <div className="text-primary font-semibold mb-2">2. Describe preferences</div>
                                    <p className="text-white/60 text-sm">Write in plain English what you need: room type, bathroom, budget</p>
                                </div>
                                <div>
                                    <div className="text-primary font-semibold mb-2">3. Get ranked results</div>
                                    <p className="text-white/60 text-sm">Each listing scored 0–100 with AI-generated summaries</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Container>
        </Section>
    )
}
