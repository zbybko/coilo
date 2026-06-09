"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import SpiralHero from "./components/SpiralHero";

// ── Data ─────────────────────────────────────────────
const SHOPIFY_STORE = "coilo.myshopify.com";
const ETSY_URL = "https://www.etsy.com/shop/Coilo";

const PRODUCTS = [
  { name: "Cyan", tone: "Electric blue", image: "/media/cyan.png", accent: "#08a6ff",
    description: "A saturated blue built for desks, gaming shelves, and crisp studio spaces.",
    variantId: "61987185787210" },
  { name: "Sakura", tone: "Soft pink", image: "/media/sakura.webp", accent: "#ff7da6",
    description: "A bright floral pink that turns favorite books into a soft display moment.",
    variantId: "62010088554826" },
  { name: "Cherry", tone: "Deep red", image: "/media/cherry.png", accent: "#b80f2d",
    description: "A richer red for bold shelves, editorial stacks, and warmer interiors.",
    variantId: "62010088587594" },
  { name: "Sunflower", tone: "Warm yellow", image: "/media/sunflower.png", accent: "#f2b600",
    description: "A sunny yellow that makes the spiral feel like a sculptural accent piece.",
    variantId: "62010088620362" },
  { name: "Rosé", tone: "Soft pink", image: "/media/pink-spiral.png", accent: "#f4a0b5",
    description: "A delicate rose tone that brings warmth and softness to any shelf or desk.",
    variantId: "62010091077962" },
];

function cartUrl(variantId: string) {
  return `https://${SHOPIFY_STORE}/cart/${variantId}:1`;
}

// ── Hooks ─────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { el.classList.add("revealed"); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("revealed"); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

function useScrolled(offset = 60) {
  const [s, set] = useState(false);
  useEffect(() => {
    const fn = () => set(window.scrollY > offset);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, [offset]);
  return s;
}

// ── RevealWrap ────────────────────────────────────────
function RevealWrap({ children, className = "", delay = 0, style = {} }:
  { children: React.ReactNode; className?: string; delay?: number; style?: CSSProperties }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal-item ${className}`}
         style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// ── NavBar ────────────────────────────────────────────
function NavBar() {
  // stay transparent over the full-height spiral hero (~480vh); only go
  // solid once the content sections below reach the top
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > window.innerHeight * 4.7);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const [menuOpen, setMenu] = useState(false);
  return (
    <nav className={`c-nav ${scrolled ? "c-nav--solid" : ""}`}>
      <a href="#top" className="c-nav__brand">
        <img src="/media/coilo-logo.png" alt="Coilo" className="c-nav__logo-img" />
        <span>Coilo</span>
      </a>
      <div className={`c-nav__links ${menuOpen ? "open" : ""}`}>
        <a href="/colors" onClick={() => setMenu(false)}>Colors</a>
        <a href="/about" onClick={() => setMenu(false)}>How It's Made</a>
        <a href="#configurator" onClick={() => setMenu(false)}>Configure</a>
        <a href={ETSY_URL} target="_blank" rel="noopener" className="c-nav__cta"
           onClick={() => setMenu(false)}>
          Shop on Etsy
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
        </a>
      </div>
      <button className={`c-nav__burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenu(!menuOpen)} aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}

// ── HeroSection: replaced by <SpiralHero /> (scroll-driven flythrough) ──

// ── IntroStrip ────────────────────────────────────────
function IntroStrip() {
  const specs = [
    { label: "Material", value: "3D printed PLA" },
    { label: "Dimensions", value: "245 × 178 × 192 mm" },
    { label: "Shipping", value: "Ships from Germany" },
    { label: "Price", value: "€39" },
  ];
  return (
    <section className="c-intro">
      <RevealWrap className="c-intro__copy">
        <h2>A bookshelf that behaves like an object.</h2>
        <p>The continuous spiral holds printed pieces upright while giving the shelf
           a clean, intentional line from every angle.</p>
      </RevealWrap>
      <div className="c-intro__specs">
        {specs.map((s, i) => (
          <RevealWrap key={s.label} className="c-intro__spec" delay={i * 100}>
            <span className="c-intro__spec-label">{s.label}</span>
            <span className="c-intro__spec-value">{s.value}</span>
          </RevealWrap>
        ))}
      </div>
    </section>
  );
}

// ── ProductGallery ────────────────────────────────────
function ProductGallery() {
  return (
    <section className="c-gallery" id="colors">
      <RevealWrap className="c-gallery__header">
        <h2>Five colors.<br />One iconic shape.</h2>
        <p>Each finish is matched to a mood — pick the one that fits your shelf.</p>
      </RevealWrap>
      <div className="c-gallery__grid">
        {PRODUCTS.map((p, i) => (
          <RevealWrap key={p.name} className="c-gallery__card" delay={i * 80}
                      style={{ "--card-accent": p.accent } as CSSProperties}>
            <a href={cartUrl(p.variantId)} className="c-gallery__link">
              <div className="c-gallery__img-wrap">
                <img src={p.image} alt={`${p.name} Coilo bookshelf`}
                     className="c-gallery__img" loading="lazy" />
                <div className="c-gallery__hover">
                  <span className="c-gallery__hover-btn">Buy {p.name}</span>
                </div>
              </div>
              <div className="c-gallery__body">
                <span className="c-gallery__tone" style={{ color: p.accent }}>{p.tone}</span>
                <h3 className="c-gallery__name">{p.name}</h3>
              </div>
            </a>
          </RevealWrap>
        ))}
      </div>
    </section>
  );
}

// ── ColorConfigurator ─────────────────────────────────
function ColorConfigurator() {
  const [sel, setSel] = useState(0);
  const product = PRODUCTS[sel];
  return (
    <section className="c-config" id="configurator"
             style={{ "--config-accent": product.accent } as CSSProperties}>
      <div className="c-config__content">
        <RevealWrap>
          <p className="c-config__eyebrow">Color Configurator</p>
          <h2 className="c-config__title">Find your color.</h2>
        </RevealWrap>
        <div className="c-config__swatches">
          {PRODUCTS.map((p, i) => (
            <button key={p.name}
                    className={`c-config__swatch ${i === sel ? "active" : ""}`}
                    onClick={() => setSel(i)} aria-label={p.name}>
              <span className="c-config__swatch-dot" style={{ background: p.accent }} />
              <span className="c-config__swatch-name">{p.name}</span>
            </button>
          ))}
        </div>
        <div className="c-config__info">
          <span className="c-config__tone" style={{ color: product.accent }}>{product.tone}</span>
          <h3 className="c-config__color-name">{product.name}</h3>
          <p className="c-config__desc">{product.description}</p>
          <div className="c-config__buy-row">
            <span className="c-config__price">€39</span>
            <a href={cartUrl(product.variantId)}
               className="btn btn--accent"
               style={{ background: product.accent, color: product.accent === "#f2b600" ? "#111" : "#fff" }}>
              Buy Now
            </a>
          </div>
        </div>
      </div>
      <div className="c-config__display">
        {PRODUCTS.map((p, i) => (
          <img key={p.name} src={p.image} alt={p.name}
               className={`c-config__product-img ${i === sel ? "active" : ""}`}
               loading="lazy" />
        ))}
      </div>
    </section>
  );
}

// ── DetailsSection ────────────────────────────────────
function DetailsSection() {
  const features = [
    { title: "3D Printed in PLA", desc: "Lightweight, durable and eco-friendly material with a smooth finish." },
    { title: "Sculptural Spiral Design", desc: "Smooth curves that hold books beautifully from every angle." },
    { title: "Compact Footprint", desc: "245 × 178 × 192 mm — fits desks, shelves, and sideboards." },
    { title: "Ships from Germany", desc: "Carefully packed and shipped across Europe. Fast and reliable." },
  ];
  return (
    <section className="c-details" id="details">
      <div className="c-details__image">
        <img src="/media/pink-spiral.png" alt="Rosé Coilo bookshelf" loading="lazy" />
      </div>
      <div className="c-details__copy">
        <RevealWrap>
          <p className="c-details__eyebrow">Crafted with Care</p>
          <h2>Printed for daily display.</h2>
          <p className="c-details__lead">
            Made from PLA with a smooth looped profile, the spiral keeps favorite
            books, magazines, and art catalogs visible — not stacked away.
          </p>
        </RevealWrap>
        <ul className="c-details__features">
          {features.map((f, i) => (
            <RevealWrap key={f.title} delay={i * 100}>
              <li className="c-details__feature">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </li>
            </RevealWrap>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── EtsyBanner ────────────────────────────────────────
function EtsyBanner() {
  return (
    <section className="c-etsy">
      <RevealWrap className="c-etsy__inner">
        <div className="c-etsy__text">
          <h3>Also available on Etsy</h3>
          <p>Support a small business. Secure checkout. 30-day returns.</p>
        </div>
        <a href={ETSY_URL} target="_blank" rel="noopener" className="btn btn--etsy">
          Visit our Etsy Shop
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
        </a>
      </RevealWrap>
    </section>
  );
}

// ── FooterCTA ─────────────────────────────────────────
function FooterCTA() {
  return (
    <section className="c-footer">
      <RevealWrap className="c-footer__inner">
        <img src="/media/coilo-logo.png" alt="" className="c-footer__logo" />
        <h2>Bring the spiral<br />to your shelf.</h2>
        <p>Order the Modern Spiral Bookshelf and choose the finish that fits your space.</p>
        <div className="c-footer__actions">
          <a href={cartUrl(PRODUCTS[0].variantId)} className="btn btn--primary">Shop Now</a>
          <a href="#configurator" className="btn btn--outline btn--dark">Pick a Color</a>
        </div>
      </RevealWrap>
      <footer className="c-footer__bar">
        <span>© 2026 Coilo</span>
        <div className="c-footer__links">
          <a href="/colors">Colors</a>
          <a href="/about">How It's Made</a>
          <a href={ETSY_URL} target="_blank" rel="noopener">Etsy</a>
        </div>
      </footer>
    </section>
  );
}

// ── App ────────────────────────────────────────────────
export default function Home() {
  return (
    <div data-theme="chromatic">
      <NavBar />
      <div id="top"><SpiralHero /></div>
      <IntroStrip />
      <ProductGallery />
      <ColorConfigurator />
      <DetailsSection />
      <EtsyBanner />
      <FooterCTA />
    </div>
  );
}
