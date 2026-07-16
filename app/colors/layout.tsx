import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colors — Sakura, Cyan, Cherry, Rosé & Sunflower",
  description:
    "Explore the Coilo Spiral Bookshelf in 5 vivid colors: Sakura pink, Cyan blue, Cherry red, Rosé and Sunflower yellow. €59 each, 3D printed and shipped from Germany.",
  // Param-less canonical: ?color=... variants are the same page, not duplicates.
  alternates: { canonical: "https://coilo.de/colors" },
  openGraph: {
    url: "https://coilo.de/colors",
    title: "Coilo Colors — pick your spiral",
    description:
      "Sakura, Cyan, Cherry, Rosé & Sunflower. €59, 3D printed in Germany.",
    images: [
      {
        url: "/media/site-assets/colors/cyan/cyan-1.webp",
        width: 2000,
        height: 1493,
        alt: "Coilo Spiral Bookshelf in Cyan on an oak sideboard",
      },
    ],
  },
};

export default function ColorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
