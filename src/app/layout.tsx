import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Provider";
import { HederaProvider } from "@/context/HederaProvider";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NombreApp | Descripción breve",
  description: "Descripción de la aplicación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <Web3Provider>
          <HederaProvider>
            <MarketplaceProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </MarketplaceProvider>
          </HederaProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
