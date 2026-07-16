"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import SpiralHero from "./components/SpiralHero";
import SiteNav from "./components/SiteNav";
import LegalLinks from "./components/LegalLinks";
import { captureAttribution, cartUrl, goToCheckout } from "../lib/attribution";
import { LangProvider, useI18n, Dict } from "../lib/i18n";
import { useMarket } from "../lib/use-market";

// ── Data ─────────────────────────────────────────────
const ETSY_URL = "https://www.etsy.com/shop/Coilo";
const TIKTOK_URL = "https://www.tiktok.com/@coilo.home";
const PINTEREST_URL = "https://de.pinterest.com/coilostudio/";
const SUPPORT_EMAIL = "support@coilo.de";
const A = "/media/site-assets"; // optimized lifestyle/studio assets

type ProductImage = { src: string; alt: string; w: number; h: number };
type ColorSlug = keyof Dict["colorsData"];
type Product = {
  name: string;
  slug: ColorSlug; // shared colour slug: /colors?color=<slug>, utm_content, c_color, i18n copy
  accent: string; // bright finish colour (UI accent)
  text: string;   // deep tone for headings on light backgrounds
  variantId: string;
  soldOut?: boolean;
  images: ProductImage[]; // lifestyle first, studio after
};

// Order: Sakura → Cyan → Cherry → Rosé → Sunflower (Sakura featured, sold out).
const PRODUCTS: Product[] = [
  {
    name: "Sakura", slug: "sakura", accent: "#F2A3BE", text: "#8A3A52",
    variantId: "62010088554826",
    images: [
      { src: `${A}/colors/sakura/sakura-1.webp`, alt: "Coilo Spiral Bookshelf in Sakura in a soft interior", w: 2000, h: 1493 },
      { src: `${A}/colors/sakura/sakura-studio.webp`, alt: "Coilo Spiral Bookshelf in Sakura, studio shot", w: 1600, h: 2143 },
      { src: `${A}/colors/sakura/sakura-studio-2.webp`, alt: "Coilo Spiral Bookshelf in Sakura, studio detail", w: 1600, h: 2128 },
    ],
  },
  {
    name: "Cyan", slug: "cyan", accent: "#1BA6DF", text: "#0A4A63",
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
    name: "Cherry", slug: "cherry", accent: "#C0303A", text: "#5E1418",
    variantId: "62010088587594",
    images: [
      { src: `${A}/colors/cherry/cherry-studio.webp`, alt: "Coilo Spiral Bookshelf in Cherry, studio shot", w: 1600, h: 2143 },
      { src: `${A}/colors/cherry/cherry-1.webp`, alt: "Coilo Spiral Bookshelf in Cherry in a warm interior", w: 2000, h: 1493 },
      { src: `${A}/colors/cherry/cherry-2.webp`, alt: "Coilo Spiral Bookshelf in Cherry on a styled shelf", w: 2000, h: 1493 },
      { src: `${A}/colors/cherry/cherry-studio-2.webp`, alt: "Coilo Spiral Bookshelf in Cherry, studio detail", w: 1600, h: 2143 },
    ],
  },
  {
    name: "Rosé", slug: "rose", accent: "#F0457A", text: "#7A1E3C",
    variantId: "62010091077962",
    images: [
      { src: `${A}/colors/rose/rose-studio.webp`, alt: "Coilo Spiral Bookshelf in Rosé, studio shot", w: 1086, h: 1448 },
      { src: `${A}/colors/rose/rose-1.webp`, alt: "Coilo Spiral Bookshelf in Rosé in a soft interior", w: 2000, h: 1493 },
    ],
  },
  {
    name: "Sunflower", slug: "sunflower", accent: "#F2A900", text: "#6E4E00",
    variantId: "62010088620362",
    images: [
      { src: `${A}/colors/sunflower/sunflower-studio.webp`, alt: "Coilo Spiral Bookshelf in Sunflower, studio shot", w: 1085, h: 1450 },
      { src: `${A}/colors/sunflower/sunflower-1.webp`, alt: "Coilo Spiral Bookshelf in Sunflower in a bright interior", w: 2000, h: 1493 },
    ],
  },
];

// Real Etsy reviews (shop 64967232), fetched via Etsy API. All 5 stars.
// Photos are buyer "appreciation photos" from the reviews themselves.
type Review = { name?: string; meta: string; text: string; img?: string; alt?: string };
const REVIEWS: Review[] = [
  {
    meta: "July 2026",
    text: "Love this — makes a quirky addition to anyone’s home.",
    img: "/media/reviews/review-quirky.jpg",
    alt: "Customer photo: Coilo Spiral Bookshelf in Cyan holding books on a wooden shelf",
  },
  {
    name: "Hayley", meta: "New Zealand · May 2026",
    text: "Was a little nervous about buying this because of the low price… but it has arrived in New Zealand safe and well. I love it!",
    img: "/media/reviews/review-nz.jpg",
    alt: "Customer photo: Coilo Spiral Bookshelf in Cyan on a pink sideboard",
  },
  { meta: "Juni 2026", text: "Sehr schöne Farbe, genau so, wie ich es mir vorgestellt habe." },
  { name: "Larin", meta: "June 2026", text: "Really beautiful product!! I would recommend." },
];

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
  const { t } = useI18n();
  const market = useMarket();
  const specs = [
    { label: t.intro.material, value: t.intro.materialVal },
    { label: t.intro.dimensions, value: "245 × 178 × 192 mm" },
    { label: t.intro.shipping, value: t.intro.shippingVal },
    { label: t.intro.price, value: market.display },
  ];
  return (
    <section className="c-intro" data-nav-theme="light">
      <RevealWrap className="c-intro__copy">
        <h2>{t.intro.title}</h2>
        <p>{t.intro.text}</p>
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
  const { t } = useI18n();
  const market = useMarket();
  const [sel, setSel] = useState(0);
  const [slide, setSlide] = useState(0);
  const touchX = useRef<number | null>(null);
  const product = PRODUCTS[sel];
  const copy = t.colorsData[product.slug];
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
            <p className="c-config__eyebrow">{t.config.eyebrow}</p>
            <h2 className="c-config__title">{t.config.title}</h2>
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
            <span className="c-config__tone" style={{ color: product.accent }}>{copy.tone}</span>
            <h3 className="c-config__color-name">{product.name}</h3>
            <p className="c-config__desc">{copy.short}</p>
            <div className="c-config__buy-row">
              <span className="c-config__price">{market.display}</span>
              {product.soldOut ? (
                <span className="btn btn--soldout" aria-disabled="true">{t.config.soldOut}</span>
              ) : (
                <a href={cartUrl(product.variantId)}
                   onClick={(e) => goToCheckout(e, product.variantId, product.slug, "configurator")}
                   className="btn btn--accent"
                   style={{ background: product.accent, color: product.name === "Sunflower" ? "#111" : "#fff" }}>
                  {t.config.buy}
                </a>
              )}
            </div>
            <p className="c-config__support">
              {t.config.support} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
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
  const { t } = useI18n();
  const features = [
    { title: t.details.f1t, desc: t.details.f1d },
    { title: t.details.f2t, desc: t.details.f2d },
    { title: t.details.f3t, desc: t.details.f3d },
    { title: t.details.f4t, desc: t.details.f4d },
  ];
  return (
    <section className="c-details" id="details" data-nav-theme="light">
      <div className="c-details__image">
        <img src={`${A}/colors/rose/rose-1.webp`} alt="Coilo Spiral Bookshelf in Rosé in a soft interior"
             width={2000} height={1493} loading="lazy" />
      </div>
      <div className="c-details__copy">
        <RevealWrap>
          <p className="c-details__eyebrow">{t.details.eyebrow}</p>
          <h2>{t.details.title}</h2>
          <p className="c-details__lead">{t.details.lead}</p>
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
  const { t } = useI18n();
  return (
    <section className="c-motion" data-nav-theme="dark">
      <RevealWrap className="c-motion__head">
        <p className="c-motion__eyebrow">{t.motion.eyebrow}</p>
        <h2>{t.motion.title}</h2>
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
  const { t } = useI18n();
  return (
    <section className="c-reviews" id="reviews" data-nav-theme="light">
      <RevealWrap className="c-reviews__head">
        <p className="c-reviews__eyebrow">{t.reviews.eyebrow}</p>
        <h2>{t.reviews.title}</h2>
        <p className="c-reviews__caption">{t.reviews.caption}</p>
      </RevealWrap>
      <div className="c-reviews__grid">
        {REVIEWS.map((r, i) => (
          <RevealWrap key={r.meta + i} className="c-reviews__card" delay={i * 100}>
            {r.img && (
              <img src={r.img} alt={r.alt ?? ""} className="c-reviews__photo"
                   width={675} height={900} loading="lazy" />
            )}
            <div className="c-reviews__stars" aria-label="5 out of 5 stars">★★★★★</div>
            <p className="c-reviews__text">“{r.text}”</p>
            <p className="c-reviews__by"><strong>{r.name ?? t.reviews.buyer}</strong> · {r.meta}</p>
          </RevealWrap>
        ))}
      </div>
    </section>
  );
}

// ── FooterCTA ─────────────────────────────────────────
function FooterCTA() {
  const { t } = useI18n();
  return (
    <section className="c-footer">
      <RevealWrap className="c-footer__inner">
        <img src="/media/coilo-logo.png" alt="" className="c-footer__logo" />
        <h2>{t.footer.title1}<br />{t.footer.title2}</h2>
        <p>{t.footer.text}</p>
        <div className="c-footer__actions">
          <a href="#configurator" className="btn btn--primary">{t.footer.pick}</a>
          <a href={cartUrl(FIRST_AVAILABLE.variantId)} onClick={(e) => goToCheckout(e, FIRST_AVAILABLE.variantId, FIRST_AVAILABLE.slug, "footer")} className="btn btn--outline btn--dark">{t.footer.shop}</a>
        </div>
        <a href={ETSY_URL} target="_blank" rel="noopener" className="c-footer__trust">
          {t.footer.trust}
        </a>
      </RevealWrap>
      <footer className="c-footer__bar">
        <span>© 2026 Coilo · <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></span>
        <div className="c-footer__links">
          <a href="/colors">{t.nav.colors}</a>
          <a href="/about">{t.nav.about}</a>
          <a href={TIKTOK_URL} target="_blank" rel="noopener">TikTok</a>
          <a href={PINTEREST_URL} target="_blank" rel="noopener">Pinterest</a>
          <a href={ETSY_URL} target="_blank" rel="noopener">Etsy</a>
        </div>
      </footer>
      <footer className="c-footer__bar c-footer__bar--legal">
        <span>{t.footer.legal}</span>
        <LegalLinks />
      </footer>
    </section>
  );
}

// ── App ────────────────────────────────────────────────
export default function Home() {
  useEffect(() => {
    captureAttribution(); // store utm_*/click IDs for the checkout hop
  }, []);
  return (
    <LangProvider>
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
    </LangProvider>
  );
}
