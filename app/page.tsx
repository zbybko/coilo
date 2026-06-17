"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import SpiralHero from "./components/SpiralHero";
import SiteNav from "./components/SiteNav";

// ── Data ─────────────────────────────────────────────
const SHOPIFY_STORE = "rxmidd-ww.myshopify.com";
const ETSY_URL = "https://www.etsy.com/shop/Coilo";
const TIKTOK_URL = "https://www.tiktok.com/@coilo.home";
const PINTEREST_URL = "https://de.pinterest.com/coilostudio/";
const SUPPORT_EMAIL = "support@coilo.de";
const A = "/media/site-assets"; // optimized lifestyle/studio assets

type ProductImage = { src: string; alt: string; w: number; h: number };
type Product = {
  name: string;
  tone: string;
  accent: string; // bright finish colour (UI accent)
  text: string;   // deep tone for headings on light backgrounds
  description: string;
  variantId: string;
  soldOut?: boolean;
  images: ProductImage[]; // lifestyle first, studio after
};

// Order: Sakura → Cyan → Cherry → Rosé → Sunflower (Sakura featured, sold out).
const PRODUCTS: Product[] = [
  {
    name: "Sakura", tone: "Soft pink", accent: "#F2A3BE", text: "#8A3A52",
    description: "A bright floral pink that turns favorite books into a soft display moment.",
    variantId: "62010088554826",
    images: [
      { src: `${A}/colors/sakura/sakura-1.webp`, alt: "Coilo Spiral Bookshelf in Sakura in a soft interior", w: 2000, h: 1493 },
      { src: `${A}/colors/sakura/sakura-studio.webp`, alt: "Coilo Spiral Bookshelf in Sakura, studio shot", w: 1600, h: 2143 },
      { src: `${A}/colors/sakura/sakura-studio-2.webp`, alt: "Coilo Spiral Bookshelf in Sakura, studio detail", w: 1600, h: 2128 },
    ],
  },
  {
    name: "Cyan", tone: "Electric blue", accent: "#1BA6DF", text: "#0A4A63",
    description: "A saturated blue built for desks, gaming shelves, and crisp studio spaces.",
    variantId: "61987185787210",
    images: [
      { src: `${A}/colors/cyan/cyan-feature.png`, alt: "Coilo Spiral Bookshelf in Cyan, editorial shot", w: 1083, h: 1452 },
      { src: `${A}/colors/cyan/cyan-studio.webp`, alt: "Coilo Spiral Bookshelf in Cyan, studio shot", w: 1600, h: 2153 },
      { src: `${A}/colors/cyan/cyan-1.webp`, alt: "Coilo Spiral Bookshelf in Cyan on an oak sideboard", w: 2000, h: 1493 },
      { src: `${A}/colors/cyan/cyan-2.webp`, alt: "Coilo Spiral Bookshelf in Cyan in an ocean-toned interior", w: 2000, h: 1493 },
      { src: `${A}/colors/cyan/cyan-3.webp`, alt: "Coilo Spiral Bookshelf in Cyan on a gallery shelf", w: 2000, h: 1493 },
    ],
  },
  {
    name: "Cherry", tone: "Deep red", accent: "#C0303A", text: "#5E1418",
    description: "A richer red for bold shelves, editorial stacks, and warmer interiors.",
    variantId: "62010088587594",
    images: [
      { src: `${A}/colors/cherry/cherry-studio.webp`, alt: "Coilo Spiral Bookshelf in Cherry, studio shot", w: 1600, h: 2143 },
      { src: `${A}/colors/cherry/cherry-1.webp`, alt: "Coilo Spiral Bookshelf in Cherry in a warm interior", w: 2000, h: 1493 },
      { src: `${A}/colors/cherry/cherry-2.webp`, alt: "Coilo Spiral Bookshelf in Cherry on a styled shelf", w: 2000, h: 1493 },
      { src: `${A}/colors/cherry/cherry-studio-2.webp`, alt: "Coilo Spiral Bookshelf in Cherry, studio detail", w: 1600, h: 2143 },
    ],
  },
  {
    name: "Rosé", tone: "Soft rose", accent: "#F0457A", text: "#7A1E3C",
    description: "A delicate rose tone that brings warmth and softness to any shelf or desk.",
    variantId: "62010091077962",
    images: [
      { src: `${A}/colors/rose/rose-studio.webp`, alt: "Coilo Spiral Bookshelf in Rosé, studio shot", w: 1086, h: 1448 },
      { src: `${A}/colors/rose/rose-1.webp`, alt: "Coilo Spiral Bookshelf in Rosé in a soft interior", w: 2000, h: 1493 },
    ],
  },
  {
    name: "Sunflower", tone: "Warm yellow", accent: "#F2A900", text: "#6E4E00",
    description: "A sunny yellow that makes the spiral feel like a sculptural accent piece.",
    variantId: "62010088620362",
    images: [
      { src: `${A}/colors/sunflower/sunflower-studio.webp`, alt: "Coilo Spiral Bookshelf in Sunflower, studio shot", w: 1085, h: 1450 },
      { src: `${A}/colors/sunflower/sunflower-1.webp`, alt: "Coilo Spiral Bookshelf in Sunflower in a bright interior", w: 2000, h: 1493 },
    ],
  },
];

const PRICE = "€59";

const REVIEWS = [
  { name: "Larin", meta: "June 2026", text: "Really beautiful product!! I would recommend." },
  { name: "Hayley", meta: "New Zealand · May 2026", text: "Arrived in New Zealand safe and well. I love it!" },
];

function cartUrl(variantId: string) {
  return `https://${SHOPIFY_STORE}/cart/${variantId}:1`;
}

// first in-stock finish — used for generic "Shop Now" CTAs (Sakura is sold out)
const FIRST_AVAILABLE = PRODUCTS.find((p) => !p.soldOut) ?? PRODUCTS[0];

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

// ── NavBar: shared <SiteNav /> (app/components/SiteNav.tsx) ──

// ── HeroSection: replaced by <SpiralHero /> (scroll-driven flythrough) ──

// ── IntroStrip ────────────────────────────────────────
function IntroStrip() {
  const specs = [
    { label: "Material", value: "3D printed PLA" },
    { label: "Dimensions", value: "245 × 178 × 192 mm" },
    { label: "Shipping", value: "Ships from Germany" },
    { label: "Price", value: PRICE },
  ];
  return (
    <section className="c-intro" data-nav-theme="light">
      <RevealWrap className="c-intro__copy">
        <h2>A bookshelf that behaves like an object.</h2>
        <p>The continuous spiral holds printed pieces upright while giving the shelf
           a clean, intentional line from every angle.</p>
      </RevealWrap>
      <div className="c-intro__right">
        <div className="c-intro__specs">
          {specs.map((s, i) => (
            <RevealWrap key={s.label} className="c-intro__spec" delay={i * 100}>
              <span className="c-intro__spec-label">{s.label}</span>
              <span className="c-intro__spec-value">{s.value}</span>
            </RevealWrap>
          ))}
        </div>
        <RevealWrap className="c-intro__size" delay={200}>
          <figure>
            <img src={`${A}/shared/size-infographic.webp`}
                 alt="Coilo Spiral Bookshelf dimensions: 245 × 178 × 192 mm"
                 width={2000} height={2000} loading="lazy" />
          </figure>
        </RevealWrap>
      </div>
    </section>
  );
}

// ── ColorConfigurator ─────────────────────────────────
function ColorConfigurator() {
  const [sel, setSel] = useState(0);
  const [slide, setSlide] = useState(0);
  const touchX = useRef<number | null>(null);
  const product = PRODUCTS[sel];
  const images = product.images;

  // reset slider to first frame whenever the colour changes
  const pick = (i: number) => { setSel(i); setSlide(0); };

  const go = (dir: number) =>
    setSlide((s) => (s + dir + images.length) % images.length);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <section className="c-config" id="configurator" data-nav-theme="dark"
             style={{ "--config-accent": product.accent } as CSSProperties}>
      <div className="c-config__content">
        <div className="c-config__header">
          <RevealWrap>
            <p className="c-config__eyebrow">Color Configurator</p>
            <h2 className="c-config__title">Find your color.</h2>
          </RevealWrap>
        </div>
        <div className="c-config__picker">
          <div className="c-config__swatches">
            {PRODUCTS.map((p, i) => (
              <button key={p.name}
                      className={`c-config__swatch ${i === sel ? "active" : ""}`}
                      onClick={() => pick(i)} aria-label={p.name}>
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
              <span className="c-config__price">{PRICE}</span>
              {product.soldOut ? (
                <span className="btn btn--soldout" aria-disabled="true">Sold out</span>
              ) : (
                <a href={cartUrl(product.variantId)}
                   className="btn btn--accent"
                   style={{ background: product.accent, color: product.name === "Sunflower" ? "#111" : "#fff" }}>
                  Buy Now
                </a>
              )}
            </div>
            <p className="c-config__support">
              Questions? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
          </div>
        </div>
      </div>
      <div className="c-config__display">
        <div className="c-config__slider"
             onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {images.map((img, i) => (
            <img key={img.src} src={img.src} alt={img.alt}
                 width={img.w} height={img.h}
                 className={`c-config__product-img ${i === slide ? "active" : ""}`}
                 loading="lazy" />
          ))}
          {images.length > 1 && (
            <>
              <button className="c-config__arrow c-config__arrow--prev"
                      onClick={() => go(-1)} aria-label="Previous image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button className="c-config__arrow c-config__arrow--next"
                      onClick={() => go(1)} aria-label="Next image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="c-config__dots">
                {images.map((_, i) => (
                  <button key={i}
                          className={`c-config__dot ${i === slide ? "active" : ""}`}
                          onClick={() => setSlide(i)}
                          aria-label={`Image ${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </div>
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
    <section className="c-details" id="details" data-nav-theme="light">
      <div className="c-details__image">
        <img src={`${A}/colors/rose/rose-1.webp`} alt="Coilo Spiral Bookshelf in Rosé in a soft interior"
             width={2000} height={1493} loading="lazy" />
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

// ── MotionSection: ad video ───────────────────────────
function MotionSection() {
  return (
    <section className="c-motion" data-nav-theme="dark">
      <RevealWrap className="c-motion__head">
        <p className="c-motion__eyebrow">See it in motion</p>
        <h2>One continuous line, in every room.</h2>
      </RevealWrap>
      <RevealWrap className="c-motion__frame" delay={120}>
        <video
          className="c-motion__video"
          src={`${A}/video/ad-video.mp4`}
          poster={`${A}/video/ad-video-poster.jpg`}
          muted autoPlay loop playsInline preload="metadata"
          aria-label="Coilo Spiral Bookshelf product film"
        />
      </RevealWrap>
    </section>
  );
}

// ── Reviews ───────────────────────────────────────────
function Reviews() {
  return (
    <section className="c-reviews" id="reviews" data-nav-theme="light">
      <RevealWrap className="c-reviews__head">
        <p className="c-reviews__eyebrow">Reviews</p>
        <h2>Loved on shelves worldwide.</h2>
        <p className="c-reviews__caption">5.0 ★ · verified Etsy buyers</p>
      </RevealWrap>
      <div className="c-reviews__grid">
        {REVIEWS.map((r, i) => (
          <RevealWrap key={r.name} className="c-reviews__card" delay={i * 100}>
            <div className="c-reviews__stars" aria-label="5 out of 5 stars">★★★★★</div>
            <p className="c-reviews__text">“{r.text}”</p>
            <p className="c-reviews__by"><strong>{r.name}</strong> · {r.meta}</p>
          </RevealWrap>
        ))}
      </div>
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
          <a href="#configurator" className="btn btn--primary">Pick a Color</a>
          <a href={cartUrl(FIRST_AVAILABLE.variantId)} className="btn btn--outline btn--dark">Shop Now</a>
        </div>
        <a href={ETSY_URL} target="_blank" rel="noopener" className="c-footer__trust">
          Trusted by buyers on Etsy · ★★★★★
        </a>
      </RevealWrap>
      <footer className="c-footer__bar">
        <span>© 2026 Coilo · <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></span>
        <div className="c-footer__links">
          <a href="/colors">Colors</a>
          <a href="/about">How It&apos;s Made</a>
          <a href={TIKTOK_URL} target="_blank" rel="noopener">TikTok</a>
          <a href={PINTEREST_URL} target="_blank" rel="noopener">Pinterest</a>
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
      <SiteNav />
      <div id="top"><SpiralHero /></div>
      <ColorConfigurator />
      <DetailsSection />
      <IntroStrip />
      <MotionSection />
      <Reviews />
      <FooterCTA />
    </div>
  );
}
