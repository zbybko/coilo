"use client";

// Shared structured footer (brand + link columns + payment strip), used on
// every page. `theme` matches the section it sits on: "light" (cream, home)
// or "dark" (colors / about).
//
// The six Shopify policy pages stay visible on every page (Impressum is
// mandatory, §5 DDG): three under "Help", three under "Legal", localized —
// DE labels link to /de/policies/…, EN to /policies/….

import { useI18n } from "../../lib/i18n";

const ETSY_URL = "https://www.etsy.com/shop/Coilo";
const TIKTOK_URL = "https://www.tiktok.com/@coilo.home";
const PINTEREST_URL = "https://de.pinterest.com/coilostudio/";
const SUPPORT_EMAIL = "support@coilo.de";

const COLORS = [
  { slug: "sakura", name: "Sakura" },
  { slug: "cyan", name: "Cyan" },
  { slug: "cherry", name: "Cherry" },
  { slug: "rose", name: "Rosé" },
  { slug: "sunflower", name: "Sunflower" },
];

const HELP_POLICIES = [
  { slug: "contact-information", de: "Kontakt", en: "Contact" },
  { slug: "shipping-policy", de: "Versand", en: "Shipping" },
  { slug: "refund-policy", de: "Widerrufsrecht", en: "Refund Policy" },
];

const LEGAL_POLICIES = [
  { slug: "legal-notice", de: "Impressum", en: "Legal Notice" },
  { slug: "privacy-policy", de: "Datenschutzerklärung", en: "Privacy Policy" },
  { slug: "terms-of-service", de: "AGB", en: "Terms of Service" },
];

const PAYMENTS = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Klarna", "Shop Pay"];

export default function SiteFooter({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const { t, lang } = useI18n();
  const policyUrl = (slug: string) =>
    `https://shop.coilo.de${lang === "de" ? "/de" : ""}/policies/${slug}`;
  const policyLabel = (p: { de: string; en: string }) => (lang === "de" ? p.de : p.en);

  return (
    <footer className={`sf sf--${theme}`}>
      <div className="sf__top">
        <div className="sf__brand">
          <a href="/" className="sf__logo" aria-label="Coilo home">
            <img src="/media/coilo-logo.png" alt="" width={44} height={44} />
            <span>Coilo</span>
          </a>
          <p className="sf__tagline">{t.footer.tagline}</p>
          <div className="sf__social">
            <a href={TIKTOK_URL} target="_blank" rel="noopener">TikTok</a>
            <a href={PINTEREST_URL} target="_blank" rel="noopener">Pinterest</a>
            <a href={ETSY_URL} target="_blank" rel="noopener">Etsy</a>
          </div>
        </div>

        <div className="sf__cols">
          <nav className="sf__col" aria-label={t.footer.shopCol}>
            <p className="sf__col-title">{t.footer.shopCol}</p>
            <a href="/colors">{t.footer.allColors}</a>
            {COLORS.map((c) => (
              <a key={c.slug} href={`/colors?color=${c.slug}`}>{c.name}</a>
            ))}
          </nav>

          <nav className="sf__col" aria-label={t.footer.helpCol}>
            <p className="sf__col-title">{t.footer.helpCol}</p>
            <a href="/about">{t.nav.about}</a>
            {HELP_POLICIES.map((p) => (
              <a key={p.slug} href={policyUrl(p.slug)} target="_blank" rel="noopener">
                {policyLabel(p)}
              </a>
            ))}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </nav>

          <nav className="sf__col" aria-label={t.footer.legal}>
            <p className="sf__col-title">{t.footer.legal}</p>
            {LEGAL_POLICIES.map((p) => (
              <a key={p.slug} href={policyUrl(p.slug)} target="_blank" rel="noopener">
                {policyLabel(p)}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="sf__bottom">
        <span>© 2026 Coilo · {t.footer.rights}</span>
        <div className="sf__pay" aria-label="Payment methods">
          {PAYMENTS.map((p) => (
            <span key={p} className="sf__pay-badge">{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
