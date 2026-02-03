"use client"

import { useState } from "react"
import { Container } from "./ui/Container"
import { Section } from "./ui/Section"
import { Card } from "./ui/Card"
import { Button } from "./ui/Button"
import { Badge } from "./ui/Badge"

export function Demo() {
    const [url, setUrl] = useState("")
    const [preferences, setPreferences] = useState("")
    const [showResults, setShowResults] = useState(false)

    const mockResults = [
        {
            name: "Modern Loft in City Center",
            score: 94,
            summary: "Private room with ensuite bathroom. 4.9 rating (127 reviews). Double bed, excellent location.",
            price: "$89/night",
        },
        {
            name: "Cozy Studio Downtown",
            score: 87,
            summary: "Entire apartment, private bathroom. 4.7 rating (89 reviews). Queen bed, kitchen included.",
            price: "$105/night",
        },
        {
            name: "Shared Room in Hostel",
            score: 32,
            summary: "Shared room with 4 beds, shared bathroom. 4.2 rating (203 reviews). Not matching preference for private room.",
            price: "$25/night",
        },
    ]

    const handleAnalyze = () => {
        setShowResults(true)
    }

    return (
        <Section id="demo">
            <Container>
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Try the demo</h2>
                    <p className="text-xl text-white/60">See how AI analyzes and ranks Airbnb listings</p>
                </div>

                <Card className="max-w-5xl mx-auto p-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Airbnb Search URL</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.airbnb.com/s/Monaco..."
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Preferences</label>
                            <textarea
                                value={preferences}
                                onChange={(e) => setPreferences(e.target.value)}
                                placeholder="Private room, shared bathroom OK, double bed required..."
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors resize-none h-[52px]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center mb-8">
                        <Button variant="primary" onClick={handleAnalyze}>
                            Analyze stays
                        </Button>
                    </div>

                    {showResults && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="text-sm text-white/60 mb-4">Found 3 results · Sorted by compatibility score</div>
                            {mockResults.map((result, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                                >
                                    <div className="text-center flex-shrink-0">
                                        <div className="text-3xl font-bold text-primary mb-1">{result.score}</div>
                                        <div className="text-xs text-white/40">score</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold mb-1">{result.name}</h4>
                                        <p className="text-sm text-white/60 mb-2">{result.summary}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-primary">{result.price}</span>
                                            {result.score >= 80 && <Badge>Interested</Badge>}
                                            {result.score < 50 && <Badge className="bg-white/10 text-white/50 border-white/20">Not Interested</Badge>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </Container>
        </Section>
    )
}
