import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/Sidebar";
import { Navbar } from "@/components/navbar";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Website Builder",
  description: "AI Website Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontHeading.variable} ${fontSans.variable} bg-background font-sans antialiased`}
      >
        <div className="flex relative overflow-hidden min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gradient-to-b from-black to-zinc-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col">
                <Navbar />
                {children}
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}