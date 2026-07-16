"use client";

// Legal / policy links required on every page (Impressum is mandatory in
// Germany, §5 DDG; Google Merchant Center checks for visible policies).
// The pages live on the Shopify store. Shopify serves them with
// `X-Frame-Options: DENY` + `frame-ancestors 'none'`, so they cannot be
// embedded in an on-site modal — they open in a new tab instead.
// Labels and target locale follow the site language: DE → /de/policies/…,
// EN → /policies/… (the store's primary language).

import { useI18n } from "../../lib/i18n";

const POLICIES = [
  { slug: "legal-notice", de: "Impressum", en: "Legal Notice" },
  { slug: "privacy-policy", de: "Datenschutzerklärung", en: "Privacy Policy" },
  { slug: "refund-policy", de: "Widerrufsrecht", en: "Refund Policy" },
  { slug: "terms-of-service", de: "AGB", en: "Terms of Service" },
  { slug: "shipping-policy", de: "Versand", en: "Shipping Policy" },
  { slug: "contact-information", de: "Kontakt", en: "Contact" },
];

export default function LegalLinks() {
  const { lang } = useI18n();
  const prefix = lang === "de" ? "/de" : "";
  return (
    <nav className="legal-links" aria-label={lang === "de" ? "Rechtliches" : "Legal"}>
      {POLICIES.map((p) => (
        <a
          key={p.slug}
          href={`https://shop.coilo.de${prefix}/policies/${p.slug}`}
          target="_blank"
          rel="noopener"
        >
          {lang === "de" ? p.de : p.en}
        </a>
      ))}
    </nav>
  );
}
