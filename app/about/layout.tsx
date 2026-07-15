import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It's Made — 3D Printed in Germany",
  description:
    "From parametric model to finished shelf in ~18 hours: how every Coilo spiral bookshelf is 3D printed from plant-based PLA in Germany — zero waste, no assembly.",
  alternates: { canonical: "https://coilo.de/about" },
  openGraph: {
    url: "https://coilo.de/about",
    title: "How the Coilo Spiral Bookshelf is made",
    description:
      "3D printed from plant-based PLA in Germany — zero waste, no assembly.",
    images: [
      {
        url: "/media/site-assets/hero/hero-cyan.webp",
        width: 2400,
        height: 1792,
        alt: "Coilo Spiral Bookshelf in Cyan",
      },
    ],
  },
};

export default function AboutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
