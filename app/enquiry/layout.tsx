import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register interest",
  description: "Let us know your favorite Coilo color and enquire about the sales launch. No order or payment required.",
  alternates: { canonical: "https://coilo.de/enquiry" },
  robots: { index: false, follow: true },
};

export default function EnquiryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
