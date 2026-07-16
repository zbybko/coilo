"use client";

import { useEffect, useRef, useState, CSSProperties } from "react";
import SiteNav from "../components/SiteNav";
import LegalLinks from "../components/LegalLinks";
import { captureAttribution, cartUrl, goToCheckout } from "../../lib/attribution";
import { LangProvider, useI18n, Dict } from "../../lib/i18n";
import { useMarket } from "../../lib/use-market";

const ETSY_URL = "https://www.etsy.com/shop/Coilo";
const TIKTOK_URL = "https://www.tiktok.com/@coilo.home";
const PINTEREST_URL = "https://de.pinterest.com/coilostudio/";

const A = "/media/site-assets";

// Order: Sakura → Cyan → Cherry → Rosé → Sunflower (matches configurator + side dots)
const PRODUCTS = [
  { slug: "sakura", num: "01 / 05", name: "Sakura",
    accent: "#F2A3BE",
    gallery: [`${A}/colors/sakura/sakura-1.webp`, `${A}/colors/sakura/sakura-studio.webp`, `${A}/colors/sakura/sakura-studio-2.webp`],
    variantId: "62010088554826" },
  { slug: "cyan", num: "02 / 05", name: "Cyan",
    accent: "#1BA6DF",
    gallery: [`${A}/colors/cyan/cyan-feature.png`, `${A}/colors/cyan/cyan-studio.webp`, `${A}/colors/cyan/cyan-1.webp`, `${A}/colors/cyan/cyan-2.webp`, `${A}/colors/cyan/cyan-3.webp`],
    variantId: "61987185787210" },
  { slug: "cherry", num: "03 / 05", name: "Cherry",
    accent: "#C0303A",
    gallery: [`${A}/colors/cherry/cherry-studio.webp`, `${A}/colors/cherry/cherry-1.webp`, `${A}/colors/cherry/cherry-2.webp`, `${A}/colors/cherry/cherry-studio-2.webp`],
    variantId: "62010088587594" },
  { slug: "rose", num: "04 / 05", name: "Rosé",
    accent: "#F0457A",
    gallery: [`${A}/colors/rose/rose-studio.webp`, `${A}/colors/rose/rose-1.webp`],
    variantId: "62010091077962" },
  { slug: "sunflower", num: "05 / 05", name: "Sunflower",
    accent: "#F2A900",
    gallery: [`${A}/colors/sunflower/sunflower-studio.webp`, `${A}/colors/sunflower/sunflower-1.webp`],
    variantId: "62010088620362" },
];

type ColorProduct = (typeof PRODUCTS)[number] & { soldOut?: boolean };

// Full-height colour panel with a manual image slider over that colour's gallery.
function Panel({ p, first, panelRef }:
  { p: ColorProduct; first: boolean; panelRef: (el: HTMLElement | null) => void }) {
  const { t } = useI18n();
  const market = useMarket();
  const copy = t.colorsData[p.slug as keyof Dict["colorsData"]];
  const specs = [
    { label: t.colorsPage.material, val: "PLA" },
    { label: t.colorsPage.weight, val: "~280 g" },
    { label: t.colorsPage.dimensions, val: "245×178×192 mm" },
    { label: t.colorsPage.finish, val: t.colorsPage.finishVal },
  ];
  const [gi, setGi] = useState(0);
  const n = p.gallery.length;
  const go = (d: number) => setGi((g) => (g + d + n) % n);
  return (
    <section className="panel" data-color={p.slug} id={p.slug} ref={panelRef}
             style={{ paddingTop: first ? "72px" : undefined, "--accent": p.accent } as CSSProperties}>
      <div className="panel__media">
        <div className="panel__glow" style={{ background: p.accent }} />
        <div className="panel__slider">
          {p.gallery.map((src, gIdx) => (
            <img key={src} src={src} alt={`Coilo Spiral Bookshelf in ${p.name}`}
                 className={`panel__img ${gIdx === gi ? "active" : ""}`}
                 loading={first && gIdx === 0 ? undefined : "lazy"} />
          ))}
        </div>
        {n > 1 && (
          <>
            <button className="panel__arrow panel__arrow--prev" onClick={() => go(-1)} aria-label="Previous image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button className="panel__arrow panel__arrow--next" onClick={() => go(1)} aria-label="Next image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="panel__dots">
              {p.gallery.map((_, gIdx) => (
                <button key={gIdx} className={`panel__dot ${gIdx === gi ? "active" : ""}`}
                        style={gIdx === gi ? { background: p.accent } : undefined}
                        onClick={() => setGi(gIdx)} aria-label={`Image ${gIdx + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="panel__content">
        <p className="panel__num">{p.num}</p>
        <p className="panel__tone" style={{ color: p.accent }}>{copy.tone}</p>
        <h2 className="panel__name">{p.name}</h2>
        <p className="panel__desc">{copy.long}</p>
        <div className="panel__specs">
          {specs.map(s => (
            <div key={s.label} className="spec">
              <p className="spec__label">{s.label}</p>
              <p className="spec__val">{s.val}</p>
            </div>
          ))}
        </div>
        <div className="panel__buy">
          <span className="panel__price">{market.display}</span>
          {p.soldOut ? (
            <span className="btn-buy btn-buy--soldout" aria-disabled="true">{t.config.soldOut}</span>
          ) : (
            <a href={cartUrl(p.variantId)} onClick={(e) => goToCheckout(e, p.variantId, p.slug, "configurator")}
               className="btn-buy" style={{ background: p.accent }}>
              {t.config.buy}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// Colour deep-link param on /colors: ?color=<slug> (also /colors#<slug>)
function colorSlugFromLocation(): string | undefined {
  const queryColor = new URLSearchParams(window.location.search)
    .get("color")?.trim().toLowerCase();
  return window.location.hash ? window.location.hash.slice(1) : queryColor;
}

export default function ColorsClient() {
  return (
    <LangProvider>
      <ColorsInner />
    </LangProvider>
  );
}

function ColorsInner() {
  const { t } = useI18n();
  const [activeIdx, setActiveIdx] = useState(0);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const didMount = useRef(false);

  useEffect(() => {
    // Store utm_*/click IDs so Buy Now can pass them to checkout
    captureAttribution();

    // Deep link: /colors#cherry (hash) or /colors?color=cherry (ads-friendly)
    // Instant scrollTo, not smooth scrollIntoView: the page's mandatory scroll
    // snap cancels programmatic scrollIntoView and the deep link never lands.
    const scrollToSlug = (slug: string | undefined, delay: number) => {
      if (!slug) return;
      const idx = PRODUCTS.findIndex(p => p.slug === slug);
      if (idx >= 0) {
        setActiveIdx(idx);
        setTimeout(() => {
          const el = panelRefs.current[idx];
          if (el) {
            window.scrollTo({
              top: el.getBoundingClientRect().top + window.scrollY,
              behavior: "instant",
            });
          }
        }, delay);
      }
    };
    scrollToSlug(colorSlugFromLocation(), 100);

    // Back/forward: re-apply whatever colour the restored URL points at
    const onPop = () => scrollToSlug(colorSlugFromLocation(), 0);
    window.addEventListener("popstate", onPop);

    // Track active panel via IntersectionObserver
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const slug = (e.target as HTMLElement).dataset.color;
          const idx = PRODUCTS.findIndex(p => p.slug === slug);
          if (idx >= 0) setActiveIdx(idx);
        }
      });
    }, { threshold: 0.5 });
    panelRefs.current.forEach(p => p && obs.observe(p));
    return () => { obs.disconnect(); window.removeEventListener("popstate", onPop); };
  }, []);

  // Keep the address bar on the visible colour (shareable URLs). replaceState
  // only touches the color param, so inbound utm_*/click IDs stay in the URL.
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    const url = new URL(window.location.href);
    if (url.searchParams.get("color") === PRODUCTS[activeIdx].slug) return;
    url.searchParams.set("color", PRODUCTS[activeIdx].slug);
    url.hash = "";
    history.replaceState(null, "", url);
  }, [activeIdx]);

  return (
    <>
      <style>{`
        html { scroll-snap-type: y mandatory; }
        .colors-page { background: #0a0a0a; }

        .col-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(20px,5vw,72px); height: 72px;
          background: rgba(10,10,10,.85); backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 rgba(255,255,255,.06); }
        .col-nav__brand { display: flex; align-items: center; gap: 10px;
          font-size: 18px; font-weight: 700; color: #f8f5ee; text-decoration: none; }
        .col-nav__brand img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .col-nav__links { display: flex; align-items: center; gap: clamp(18px,3vw,36px);
          font-size: 13px; font-weight: 600; color: rgba(248,245,238,0.55); }
        .col-nav__links a { color: inherit; text-decoration: none; transition: color .2s; }
        .col-nav__links a:hover, .col-nav__links a.active { color: #fff; }
        .col-nav__cta { display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border: 1.5px solid rgba(255,255,255,.25); border-radius: 999px;
          color: #fff !important; font-weight: 700; transition: border-color .2s; }
        .col-nav__cta:hover { border-color: rgba(255,255,255,.6); }

        .side-nav { position: fixed; right: clamp(20px,5vw,72px); top: 50%;
          transform: translateY(-50%); z-index: 90;
          display: flex; flex-direction: column; gap: 14px; }
        .side-dot { width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.3); background: transparent;
          cursor: pointer; transition: all .3s; padding: 0; }
        .side-dot.active { transform: scale(1.25); }
        .side-dot:hover { border-color: rgba(255,255,255,.6); }

        .panel { min-height: 100svh; scroll-snap-align: start;
          display: grid; grid-template-columns: 1fr 1fr;
          position: relative; overflow: hidden; }
        .panel[data-color="cyan"] { background: linear-gradient(135deg,#061a2e,#0a0a0a); }
        .panel[data-color="sakura"] { background: linear-gradient(135deg,#1e0a14,#0a0a0a); }
        .panel[data-color="cherry"] { background: linear-gradient(135deg,#1a0608,#0a0a0a); }
        .panel[data-color="sunflower"] { background: linear-gradient(135deg,#1a1505,#0a0a0a); }
        .panel[data-color="rose"] { background: linear-gradient(135deg,#1a0e12,#0a0a0a); }

        .panel__media { position: relative; display: flex; align-items: center;
          justify-content: center; overflow: hidden; }
        .panel__glow { position: absolute; width: 400px; height: 400px; border-radius: 50%;
          opacity: .1; filter: blur(120px); pointer-events: none; top: 30%; left: 40%; }
        .panel__slider { position: relative; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center; }
        .panel__img { position: absolute; max-width: 78%; max-height: 80vh; object-fit: contain;
          filter: drop-shadow(0 40px 80px rgba(0,0,0,.4));
          opacity: 0; transition: opacity .6s ease, transform .6s ease; display: block; }
        .panel__img.active { opacity: 1; }
        .panel:hover .panel__img.active { transform: scale(1.03) rotate(-1deg); }
        .panel__arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
          width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; background: rgba(255,255,255,.1); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,.18); color: #fff;
          transition: background .2s, transform .2s; }
        .panel__arrow svg { width: 20px; height: 20px; display: block; }
        .panel__arrow:hover { background: rgba(255,255,255,.24); }
        .panel__arrow--prev { left: clamp(12px,2.5vw,32px); }
        .panel__arrow--prev:hover { transform: translateY(-50%) translateX(-2px); }
        .panel__arrow--next { right: clamp(12px,2.5vw,32px); }
        .panel__arrow--next:hover { transform: translateY(-50%) translateX(2px); }
        .panel__dots { position: absolute; left: 50%; bottom: clamp(18px,3vw,34px);
          transform: translateX(-50%); z-index: 4; display: flex; gap: 9px; }
        .panel__dot { width: 9px; height: 9px; border-radius: 50%; padding: 0; cursor: pointer;
          background: rgba(255,255,255,.3); border: none; transition: transform .25s, background .25s; }
        .panel__dot.active { transform: scale(1.25); }

        .panel__content { display: flex; flex-direction: column; justify-content: center;
          padding: clamp(48px,7vw,96px); color: #f8f5ee; }
        .panel__num { font-size: 13px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .15em; color: rgba(248,245,238,0.55); margin-bottom: 18px; }
        .panel__tone { font-size: 12px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .12em; margin-bottom: 8px; }
        .panel__name { font-family: var(--font-instrument, Georgia, serif);
          font-size: clamp(52px,8vw,120px); font-weight: 400; line-height: .88; margin-bottom: 20px; }
        .panel__desc { max-width: 440px; color: rgba(248,245,238,0.55);
          font-size: clamp(15px,1.5vw,18px); line-height: 1.7; margin-bottom: 36px; }
        .panel__specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 36px; }
        .spec { padding: 16px 20px; background: rgba(255,255,255,.06); border-radius: 8px; }
        .spec__label { font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .08em; color: rgba(248,245,238,0.55); margin-bottom: 2px; }
        .spec__val { font-size: 16px; font-weight: 700; }
        .panel__buy { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .panel__price { font-size: 32px; font-weight: 700; }
        .btn-buy--soldout { background: rgba(255,255,255,.08); color: rgba(248,245,238,0.55);
          border: 1.5px solid rgba(255,255,255,.16); cursor: not-allowed; }
        .btn-buy--soldout:hover { transform: none; filter: none; }
        .btn-buy { display: inline-flex; align-items: center; gap: 8px; padding: 0 28px; height: 52px;
          border-radius: 999px; font-size: 14px; font-weight: 700; letter-spacing: .02em;
          transition: transform .2s, filter .2s; white-space: nowrap; text-decoration: none; color: #fff; }
        .btn-buy:hover { transform: translateY(-2px); filter: brightness(1.12); }
        .panel[data-color="sunflower"] .btn-buy { color: #111; }

        .col-foot { padding: 22px clamp(20px,5vw,72px); border-top: 1px solid rgba(255,255,255,.08);
          display: flex; flex-direction: column; gap: 14px;
          font-size: 13px; color: rgba(248,245,238,0.55); scroll-snap-align: end;
          background: #0a0a0a; }
        .col-foot__row { display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap; }
        .col-foot a { color: inherit; text-decoration: none; transition: color .2s; }
        .col-foot a:hover { color: #fff; }
        .col-foot__links { display: flex; gap: 24px; }

        @media (max-width: 900px) {
          .panel { grid-template-columns: 1fr; }
          .panel__media { min-height: 50svh; }
          .panel__img { max-width: 60%; max-height: 50vh; }
          .panel__content { padding: 36px 20px 56px; }
          .panel__specs { grid-template-columns: 1fr; }
          .side-nav { display: none; }
        }
        @media (max-width: 720px) {
          .col-nav__links { display: none; }
          .panel__name { font-size: clamp(40px,14vw,72px); }
          .panel__media { min-height: 40svh; }
          .col-foot__row { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="colors-page">
        {/* Nav */}
        <SiteNav active="colors" />

        {/* Side dots */}
        <div className="side-nav">
          {PRODUCTS.map((p, i) => (
            <button key={p.slug}
                    className={`side-dot ${i === activeIdx ? "active" : ""}`}
                    style={{ background: i === activeIdx ? p.accent : "transparent", borderColor: i === activeIdx ? p.accent : undefined }}
                    onClick={() => panelRefs.current[i]?.scrollIntoView({ behavior: "smooth" })}
                    aria-label={p.name} />
          ))}
        </div>

        {/* Panels */}
        <main>
          {PRODUCTS.map((p, i) => (
            <Panel key={p.slug} p={p} first={i === 0}
                   panelRef={(el) => { panelRefs.current[i] = el; }} />
          ))}
        </main>

        {/* Footer */}
        <footer className="col-foot">
          <div className="col-foot__row">
            <span>© 2026 Coilo</span>
            <div className="col-foot__links">
              <a href="/">{t.footer.home}</a>
              <a href="/about">{t.nav.about}</a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener">TikTok</a>
              <a href={PINTEREST_URL} target="_blank" rel="noopener">Pinterest</a>
              <a href={ETSY_URL} target="_blank" rel="noopener">Etsy</a>
            </div>
          </div>
          <div className="col-foot__row">
            <span>{t.footer.legal}</span>
            <LegalLinks />
          </div>
        </footer>
      </div>
    </>
  );
}
