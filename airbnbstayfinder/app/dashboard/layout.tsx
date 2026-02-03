import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import DashboardNavbar from "@/components/dashboard-navbar";
import Image from "next/image";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AirbnbStayFinder - Dashboard",
    description: "Find your perfect Airbnb stay with AI",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider>
                    <Image
                        src="/images/hero2.svg"
                        alt=""
                        width={1024}
                        height={1024}
                        className="absolute -inset-x-0 -top-[250px] w-full z-0 min-w-full opacity-60 dark:opacity-80"
                    />
                    <div className="flex flex-row p-8 w-full min-h-screen gap-8 relative">
                        <div className="flex flex-col w-[80px] shrink-0 z-10">
                            <DashboardNavbar />
                        </div>
                        <div className="flex flex-col flex-1 z-10">
                            {children}
                        </div>
                    </div>
                    <div className="fixed z-0 -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(255,90,95,0.15)0%,transparent_70%)] pointer-events-none" />
                </ThemeProvider>
            </body>
        </html>
    );
}
