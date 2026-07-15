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
  metadataBase: new URL("https://coilo.de"),
  title: {
    default: "Coilo — Modern Spiral Bookshelf | 3D Printed in Germany",
    template: "%s | Coilo",
  },
  description:
    "A sculptural 3D-printed spiral bookshelf and magazine holder in 5 vivid colors. €59, ships from Germany across Europe. One continuous spiral, no assembly.",
  // Sub-pages override this in their own layout (colors, about).
  alternates: { canonical: "https://coilo.de/" },
  openGraph: {
    type: "website",
    siteName: "Coilo",
    url: "https://coilo.de/",
    title: "Coilo — Modern Spiral Bookshelf",
    description:
      "A sculptural 3D-printed spiral bookshelf in 5 vivid colors. €59, ships from Germany.",
    locale: "en_DE",
    images: [
      {
        url: "/media/site-assets/hero/hero-cyan.webp",
        width: 2400,
        height: 1792,
        alt: "Coilo Spiral Bookshelf in Cyan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coilo — Modern Spiral Bookshelf",
    description:
      "A sculptural 3D-printed spiral bookshelf in 5 vivid colors. €59, ships from Germany.",
    images: ["/media/site-assets/hero/hero-cyan.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Google Merchant Center / Search Console domain verification (coilo.de)
    google: "IhAyGGrcQP4eDDzbK4Uhs3nfPSuIWxgWpxm9hRj1K2s",
  },
};

// Business identity for Google (matches the Impressum on shop.coilo.de).
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "Coilo",
  url: "https://coilo.de",
  logo: "https://coilo.de/media/coilo-logo.png",
  email: "support@coilo.de",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rappenbuckelweg 3",
    addressLocality: "Schriesheim",
    postalCode: "69198",
    addressCountry: "DE",
  },
  sameAs: [
    "https://www.tiktok.com/@coilo.home",
    "https://de.pinterest.com/coilostudio/",
    "https://www.etsy.com/shop/Coilo",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable} ${spaceGrotesk.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}
