"use client"

import { useState } from "react"
import { Container } from "./ui/Container"
import { Section } from "./ui/Section"

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const faqs = [
        {
            question: "Does it work with my Airbnb filters?",
            answer: "Yes! Paste your Airbnb search URL with all filters applied (location, dates, price range, amenities). The system will analyze those exact listings.",
        },
        {
            question: "Can I require a private room?",
            answer: "Absolutely. Just specify 'private room required' in your preferences. The AI will score listings accordingly and reject shared rooms.",
        },
        {
            question: "Does it handle shared bathrooms?",
            answer: "Yes. You can specify 'private bathroom required' or 'shared bathroom OK' in plain English. The AI understands both.",
        },
        {
            question: "Is the AI local?",
            answer: "Yes. The AI analysis runs locally on your system using open-source models. Your search preferences and data stay private.",
        },
        {
            question: "Can I manage multiple trips?",
            answer: "Yes. Organize your searches by trip name (e.g., 'Monaco 2026', 'Dublin Summer'). Each trip maintains its own list of stays.",
        },
        {
            question: "What does the score mean?",
            answer: "The score (0–100) represents how well each listing matches your stated preferences. Higher scores mean better matches.",
        },
        {
            question: "How long does analysis take?",
            answer: "Typically a few seconds per listing. A search with 20 results will complete in under a minute.",
        },
        {
            question: "Is this affiliated with Airbnb?",
            answer: "No. AirbnbStayFinder is an independent tool that analyzes public Airbnb listings. We are not affiliated with or endorsed by Airbnb.",
        },
    ]

    return (
        <Section id="faq">
            <Container className="max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">FAQ</h2>
                    <p className="text-xl text-white/60">Common questions answered</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-primary/30"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between"
                            >
                                <span className="font-semibold pr-4">{faq.question}</span>
                                <span className={`text-primary transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            {openIndex === i && (
                                <div className="px-6 pb-4 text-white/70 leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    )
}
