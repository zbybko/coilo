import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coilo | Modern Spiral Bookshelf",
  description:
    "A sculptural 3D printed spiral bookshelf and magazine holder by Coilo. Available in 5 vivid colors.",
  openGraph: {
    title: "Coilo | Modern Spiral Bookshelf",
    description:
      "A sculptural 3D printed spiral bookshelf and magazine holder by Coilo.",
    images: ["/media/site-assets/hero/hero-cyan.webp"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  verification: {
    // Google Merchant Center / Search Console domain verification (coilo.de)
    google: "IhAyGGrcQP4eDDzbK4Uhs3nfPSuIWxgWpxm9hRj1K2s",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
