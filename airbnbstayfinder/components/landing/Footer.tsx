import { Container } from "./ui/Container"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="py-12 border-t border-white/10 bg-black/50">
            <Container>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-xl font-bold text-gradient">AirbnbStayFinder</div>
                    <div className="flex items-center gap-8">
                        <a href="https://github.com/guilhermedecastrogt/airbnbstayfinder-airbnbscraper" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">
                            GitHub
                        </a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                            Privacy
                        </a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                            Terms
                        </a>
                        <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                            Contact
                        </a>
                    </div>
                    <div className="text-sm text-white/40">
                        © {currentYear} AirbnbStayFinder
                    </div>
                </div>
            </Container>
        </footer>
    )
}
