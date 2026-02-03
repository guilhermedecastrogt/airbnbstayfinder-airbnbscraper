import { Container } from "./ui/Container"

export function TrustStrip() {
    const features = [
        "AI Scoring",
        "Local Inference",
        "Multi-trip Organization",
        "Fast Triage",
    ]

    return (
        <div className="py-12 border-y border-white/10 bg-white/5 backdrop-blur-sm">
            <Container>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-white/70 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}
