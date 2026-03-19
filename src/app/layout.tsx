import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { SolanaProvider } from "@/components/SolanaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HASHCUBE | Decentralized Index",
  description: "Anonymous decentralized index for IPFS CIDs and magnet links",
  manifest: "/manifest.json",
  themeColor: "#F6851B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HASHCUBE",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-metamask-beige`}
      >
        <SolanaProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </SolanaProvider>
      </body>
    </html>
  );
}
