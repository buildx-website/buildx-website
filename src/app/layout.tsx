import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SessionDataType } from "@/types/types";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

const iconSvg = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path></svg>`;
const iconDataUri = `data:image/svg+xml;base64,${btoa(iconSvg)}`;

export const metadata: Metadata = {
  title: "BuildX Website - Build your website in minutes with AI",
  description: "BuildX Website - Build your website in minutes with AI",
  icons: {
    icon: iconDataUri,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: SessionDataType = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="en" className="dark">
      <body
        className={`${fontHeading.variable} ${fontSans.variable} bg-background font-sans antialiased`}
      >
        <Providers session={session}>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}