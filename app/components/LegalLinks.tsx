// Legal / policy links required on every page (Impressum is mandatory in
// Germany, §5 DDG; Google Merchant Center checks for visible policies).
// The pages live on the Shopify store. Shopify serves them with
// `X-Frame-Options: DENY` + `frame-ancestors 'none'`, so they cannot be
// embedded in an on-site modal — they open in a new tab instead.
const LEGAL_LINKS = [
  { label: "Impressum", href: "https://shop.coilo.de/de/policies/legal-notice" },
  { label: "Datenschutzerklärung", href: "https://shop.coilo.de/de/policies/privacy-policy" },
  { label: "Widerrufsrecht", href: "https://shop.coilo.de/de/policies/refund-policy" },
  { label: "AGB", href: "https://shop.coilo.de/de/policies/terms-of-service" },
  { label: "Versand", href: "https://shop.coilo.de/de/policies/shipping-policy" },
  { label: "Kontakt", href: "https://shop.coilo.de/de/policies/contact-information" },
];

export default function LegalLinks() {
  return (
    <nav className="legal-links" aria-label="Rechtliches">
      {LEGAL_LINKS.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener">
          {l.label}
        </a>
      ))}
    </nav>
  );
}
