import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import DashboardNavbar from "@/components/dashboard-navbar";
import Image from "next/image";
import { TripProvider } from "@/components/trip-provider";
import { tripRepo } from "@/features/trip/repo/prisma.trip.repo";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AirbnbStayFinder",
    description: "AI-powered Airbnb stay matching",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const trips = await tripRepo.findAll()

    return (
        <html lang="en" className="dark">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <TripProvider initialTrips={trips}>
                    {/* Background SVG */}
                    <Image
                        src="/images/hero2.svg"
                        alt=""
                        width={1024}
                        height={1024}
                        className="fixed -inset-x-0 -top-[250px] w-full z-0 min-w-full opacity-60 pointer-events-none"
                    />

                    <div className="flex min-h-screen relative">
                        {/* Sidebar */}
                        <aside className="fixed left-0 top-0 bottom-0 w-[76px] z-20 glass">
                            <DashboardNavbar />
                        </aside>

                        {/* Main */}
                        <main className="flex-1 ml-[76px] relative z-10">
                            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
                                {children}
                            </div>
                        </main>
                    </div>

                    {/* Bottom glow */}
                    <div className="fixed z-0 -bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[350px] rounded-full blur-[150px] bg-[radial-gradient(circle,rgba(255,90,95,0.12)0%,transparent_70%)] pointer-events-none" />
                </TripProvider>
            </body>
        </html>
    );
}
