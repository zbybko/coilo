import type { Metadata } from "next";

export const metadata: Metadata = {
  // Param-less canonical: ?color=... variants are the same page, not duplicates.
  alternates: { canonical: "https://coilo.de/colors" },
};

export default function ColorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
