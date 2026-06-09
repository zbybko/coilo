"use client";

import { useState, useEffect, CSSProperties } from "react";
import SpiralHero from "./components/SpiralHero";

// ── Data ─────────────────────────────────────────────
const SHOPIFY_STORE = "coilo.myshopify.com";
const ETSY_URL = "https://www.etsy.com/shop/Coilo";

const PRODUCTS = [
  { name: "Cyan", tone: "Electric blue", image: "/media/cyan.png", accent: "#0086D6",
    description: "A saturated blue built for desks, gaming shelves and crisp studio spaces.",
    variantId: "61987185787210" },
  { name: "Sakura", tone: "Soft pink", image: "/media/sakura.webp", accent: "#F55A74",
    description: "A bright floral pink that turns favourite books into a soft display moment.",
    variantId: "62010088554826" },
  { name: "Cherry", tone: "Deep maroon", image: "/media/cherry.png", accent: "#9D2235",
    description: "A richer red for bold shelves, editorial stacks and warmer interiors.",
    variantId: "62010088587594" },
  { name: "Sunflower", tone: "Warm yellow", image: "/media/sunflower.png", accent: "#FEC600",
    description: "A sunny yellow that makes the spiral feel like a sculptural accent piece.",
    variantId: "62010088620362" },
  { name: "Rosé", tone: "Hot pink", image: "/media/pink-spiral.png", accent: "#F5547C",
    description: "A delicate rose tone that brings warmth and softness to any shelf or desk.",
    variantId: "62010091077962" },
];

const cartUrl = (variantId: string) => `https://${SHOPIFY_STORE}/cart/${variantId}:1`;

// ── Nav ───────────────────────────────────────────────
function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 4.3);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`lt-nav ${solid ? "lt-nav--solid" : ""}`}>
      <a href="#top" className="lt-nav__brand">
        <img src="/media/coilo-logo.png" alt="Coilo" className="lt-nav__logo" />
        <span>Coilo</span>
      </a>
      <div className="lt-nav__links">
        <a href="/colors">Colours</a>
        <a href="/about">How it&apos;s made</a>
        <a href="#shop">Shop</a>
        <a href={ETSY_URL} target="_blank" rel="noopener" className="lt-nav__cta">Etsy</a>
      </div>
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────
export default function Home() {
  const [sel, setSel] = useState(0);
  const product = PRODUCTS[sel];

  return (
    <div id="top">
      <Nav />

      {/* Immersive scroll-driven flythrough */}
      <SpiralHero />

      {/* ── Emerge: manifesto + climax CTA (light editorial) ── */}
      <main id="shop" className="lt">
        <section className="lt-emerge">
          <p className="lt-eyebrow">The spiral bookshelf</p>
          <h2 className="lt-emerge__title">
            A shelf that behaves<br />like an <em>object</em>.
          </h2>
          <p className="lt-emerge__lead">
            One continuous 3D-printed coil holds your books upright while drawing a clean,
            intentional line from every angle. Sculpture you can use.
          </p>
          <div className="lt-emerge__cta">
            <a href="#colours" className="lt-btn lt-btn--dark">Choose your colour</a>
            <a href={cartUrl(PRODUCTS[0].variantId)} className="lt-btn lt-btn--ghost">Shop now · €39</a>
          </div>
          <div className="lt-pills">
            <span>Unique spiral design</span>
            <span>Sustainable PLA</span>
            <span>Made in Germany</span>
          </div>
        </section>

        {/* ── Colours ── */}
        <section id="colours" className="lt-colours">
          <header className="lt-colours__head">
            <h3>Five finishes.<br /><em>One icon.</em></h3>
            <p>Each colour is matched to a mood. Pick the one that fits your shelf.</p>
          </header>
          <div className="lt-colours__grid">
            {PRODUCTS.map((p) => (
              <a key={p.name} href={cartUrl(p.variantId)} className="lt-card"
                 style={{ "--accent": p.accent } as CSSProperties}>
                <div className="lt-card__img">
                  <img src={p.image} alt={`${p.name} Coilo spiral bookshelf`} loading="lazy" />
                  <span className="lt-card__buy">Buy {p.name}</span>
                </div>
                <div className="lt-card__row">
                  <span className="lt-card__dot" style={{ background: p.accent }} />
                  <span className="lt-card__name">{p.name}</span>
                  <span className="lt-card__tone">{p.tone}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Configurator ── */}
        <section className="lt-config" style={{ "--accent": product.accent } as CSSProperties}>
          <div className="lt-config__media">
            {PRODUCTS.map((p, i) => (
              <img key={p.name} src={p.image} alt={p.name}
                   className={`lt-config__img ${i === sel ? "is-active" : ""}`} loading="lazy" />
            ))}
          </div>
          <div className="lt-config__panel">
            <p className="lt-eyebrow">Configure</p>
            <h3 className="lt-config__title">Find your colour.</h3>
            <div className="lt-swatches">
              {PRODUCTS.map((p, i) => (
                <button key={p.name} onClick={() => setSel(i)}
                        className={`lt-swatch ${i === sel ? "is-active" : ""}`} aria-label={p.name}>
                  <span style={{ background: p.accent }} />
                  {p.name}
                </button>
              ))}
            </div>
            <p className="lt-config__desc">{product.description}</p>
            <div className="lt-config__buy">
              <span className="lt-config__price">€39</span>
              <a href={cartUrl(product.variantId)} className="lt-btn lt-btn--dark">Add to cart</a>
            </div>
          </div>
        </section>

        {/* ── Specs ── */}
        <section className="lt-specs">
          {[
            ["Material", "3D-printed PLA"],
            ["Dimensions", "245 × 178 × 192 mm"],
            ["Finish", "Smooth matte coil"],
            ["Shipping", "From Germany"],
          ].map(([k, v]) => (
            <div key={k} className="lt-spec">
              <span className="lt-spec__k">{k}</span>
              <span className="lt-spec__v">{v}</span>
            </div>
          ))}
        </section>

        {/* ── Footer CTA ── */}
        <footer className="lt-foot">
          <img src="/media/coilo-logo.png" alt="" className="lt-foot__logo" />
          <h3>Bring the spiral<br /><em>to your shelf.</em></h3>
          <div className="lt-emerge__cta">
            <a href={cartUrl(PRODUCTS[0].variantId)} className="lt-btn lt-btn--dark">Shop the collection</a>
            <a href={ETSY_URL} target="_blank" rel="noopener" className="lt-btn lt-btn--ghost">Visit our Etsy</a>
          </div>
          <div className="lt-foot__bar">
            <span>© 2026 Coilo · Made in Germany</span>
            <div className="lt-foot__links">
              <a href="/colors">Colours</a>
              <a href="/about">How it&apos;s made</a>
              <a href={ETSY_URL} target="_blank" rel="noopener">Etsy</a>
            </div>
          </div>
        </footer>
      </main>

      <PageStyle />
    </div>
  );
}

function PageStyle() {
  return (
    <style>{`
      :root { --ink:#1b1714; --muted:#6b625a; --cream:#f4efe7; --cream2:#ece4d8; --line:#e0d6c8; }
      .lt { background:var(--cream); color:var(--ink); position:relative; z-index:1; }
      .lt em { font-style:italic; }
      .lt-eyebrow { font-family:var(--font-space,system-ui); text-transform:uppercase;
        letter-spacing:.26em; font-size:.72rem; font-weight:500; color:var(--muted); margin:0 0 1rem; }
      .lt-btn { display:inline-block; padding:.95rem 2rem; border-radius:100px; text-decoration:none;
        font-family:var(--font-space,system-ui); font-weight:600; font-size:.95rem;
        transition:transform .2s, box-shadow .2s, background .2s; cursor:pointer; }
      .lt-btn--dark { background:var(--ink); color:#fff; }
      .lt-btn--dark:hover { transform:translateY(-2px); box-shadow:0 14px 34px rgba(0,0,0,.22); }
      .lt-btn--ghost { background:transparent; color:var(--ink); border:1px solid var(--line); }
      .lt-btn--ghost:hover { background:#fff; transform:translateY(-2px); }

      /* nav */
      .lt-nav { position:fixed; top:0; left:0; right:0; z-index:50; display:flex;
        align-items:center; justify-content:space-between; padding:1.1rem clamp(1.2rem,4vw,3rem);
        transition:background .3s, box-shadow .3s, color .3s; color:#fff; }
      .lt-nav--solid { background:rgba(244,239,231,.86); backdrop-filter:blur(12px);
        color:var(--ink); box-shadow:0 1px 0 var(--line); }
      .lt-nav__brand { display:flex; align-items:center; gap:.55rem; text-decoration:none;
        color:inherit; font-family:var(--font-instrument,serif); font-size:1.5rem; }
      .lt-nav__logo { width:26px; height:26px; object-fit:contain; }
      .lt-nav__links { display:flex; align-items:center; gap:clamp(1rem,2.4vw,2rem); }
      .lt-nav__links a { color:inherit; text-decoration:none; font-family:var(--font-space,system-ui);
        font-size:.9rem; font-weight:500; opacity:.92; }
      .lt-nav__links a:hover { opacity:1; }
      .lt-nav__cta { border:1px solid currentColor; padding:.4rem 1rem; border-radius:100px; }
      @media (max-width:680px){ .lt-nav__links a:not(.lt-nav__cta){ display:none } }

      /* emerge */
      .lt-emerge { max-width:760px; margin:0 auto; padding:clamp(5rem,12vh,9rem) 1.5rem 4rem;
        text-align:center; }
      .lt-emerge__title { font-family:var(--font-instrument,serif); font-weight:400;
        font-size:clamp(2.6rem,6.5vw,5rem); line-height:1.02; margin:0; }
      .lt-emerge__lead { font-family:var(--font-space,system-ui); font-weight:300;
        font-size:clamp(1.05rem,1.6vw,1.25rem); line-height:1.6; color:#3a332d;
        max-width:54ch; margin:1.6rem auto 0; }
      .lt-emerge__cta { display:flex; gap:.8rem; justify-content:center; flex-wrap:wrap; margin-top:2.2rem; }
      .lt-pills { display:flex; gap:.6rem; justify-content:center; flex-wrap:wrap; margin-top:2.4rem; }
      .lt-pills span { font-family:var(--font-space,system-ui); font-size:.78rem; color:var(--muted);
        border:1px solid var(--line); border-radius:100px; padding:.4rem .9rem; }

      /* colours */
      .lt-colours { max-width:1200px; margin:0 auto; padding:4rem 1.5rem 6rem; }
      .lt-colours__head { display:flex; justify-content:space-between; align-items:flex-end;
        flex-wrap:wrap; gap:1rem; margin-bottom:2.5rem; }
      .lt-colours__head h3 { font-family:var(--font-instrument,serif); font-weight:400;
        font-size:clamp(2rem,4.5vw,3.4rem); line-height:1; margin:0; }
      .lt-colours__head p { font-family:var(--font-space,system-ui); color:var(--muted);
        max-width:34ch; margin:0; }
      .lt-colours__grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1.2rem; }
      .lt-card { text-decoration:none; color:var(--ink); }
      .lt-card__img { position:relative; aspect-ratio:4/5; border-radius:18px; overflow:hidden;
        background:var(--cream2); }
      .lt-card__img img { width:100%; height:100%; object-fit:cover; transition:transform .5s ease; }
      .lt-card:hover .lt-card__img img { transform:scale(1.05); }
      .lt-card__buy { position:absolute; left:50%; bottom:14px; transform:translateX(-50%) translateY(8px);
        background:var(--accent); color:#fff; padding:.5rem 1.1rem; border-radius:100px; font-size:.82rem;
        font-family:var(--font-space,system-ui); font-weight:600; opacity:0; transition:.3s; white-space:nowrap; }
      .lt-card:hover .lt-card__buy { opacity:1; transform:translateX(-50%) translateY(0); }
      .lt-card__row { display:flex; align-items:center; gap:.5rem; padding:.9rem .2rem 0; }
      .lt-card__dot { width:12px; height:12px; border-radius:50%; flex:none; }
      .lt-card__name { font-family:var(--font-space,system-ui); font-weight:600; font-size:.98rem; }
      .lt-card__tone { font-family:var(--font-space,system-ui); color:var(--muted); font-size:.82rem;
        margin-left:auto; }

      /* configurator */
      .lt-config { max-width:1200px; margin:0 auto; padding:2rem 1.5rem 6rem; display:grid;
        grid-template-columns:1.1fr .9fr; gap:3rem; align-items:center; }
      .lt-config__media { position:relative; aspect-ratio:1; border-radius:24px; overflow:hidden;
        background:var(--cream2); }
      .lt-config__img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
        opacity:0; transition:opacity .5s ease; }
      .lt-config__img.is-active { opacity:1; }
      .lt-config__title { font-family:var(--font-instrument,serif); font-weight:400;
        font-size:clamp(2rem,4vw,3rem); margin:0 0 1.5rem; }
      .lt-swatches { display:flex; flex-wrap:wrap; gap:.6rem; margin-bottom:1.5rem; }
      .lt-swatch { display:inline-flex; align-items:center; gap:.5rem; padding:.45rem .9rem;
        border:1px solid var(--line); border-radius:100px; background:#fff; cursor:pointer;
        font-family:var(--font-space,system-ui); font-size:.85rem; transition:.2s; }
      .lt-swatch span { width:12px; height:12px; border-radius:50%; }
      .lt-swatch.is-active { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent); }
      .lt-config__desc { font-family:var(--font-space,system-ui); color:#3a332d; line-height:1.6;
        max-width:42ch; }
      .lt-config__buy { display:flex; align-items:center; gap:1.2rem; margin-top:1.8rem; }
      .lt-config__price { font-family:var(--font-instrument,serif); font-size:1.8rem; }
      @media (max-width:820px){ .lt-config{ grid-template-columns:1fr; gap:1.6rem } }

      /* specs */
      .lt-specs { max-width:1100px; margin:0 auto; padding:0 1.5rem 6rem; display:grid;
        grid-template-columns:repeat(4,1fr); gap:1px; background:var(--line); border:1px solid var(--line);
        border-radius:18px; overflow:hidden; }
      .lt-spec { background:var(--cream); padding:1.6rem 1.4rem; }
      .lt-spec__k { display:block; font-family:var(--font-space,system-ui); text-transform:uppercase;
        letter-spacing:.16em; font-size:.7rem; color:var(--muted); margin-bottom:.5rem; }
      .lt-spec__v { font-family:var(--font-instrument,serif); font-size:1.25rem; }
      @media (max-width:680px){ .lt-specs{ grid-template-columns:repeat(2,1fr) } }

      /* footer */
      .lt-foot { background:var(--ink); color:#f4efe7; text-align:center; padding:5rem 1.5rem 2rem; }
      .lt-foot__logo { width:42px; height:42px; object-fit:contain; opacity:.9; margin-bottom:1.2rem;
        filter:brightness(0) invert(1); }
      .lt-foot h3 { font-family:var(--font-instrument,serif); font-weight:400;
        font-size:clamp(2.2rem,5vw,3.6rem); line-height:1.02; margin:0 0 2rem; }
      .lt-foot .lt-btn--ghost { color:#f4efe7; border-color:rgba(244,239,231,.3); }
      .lt-foot .lt-btn--ghost:hover { background:rgba(255,255,255,.08); }
      .lt-foot .lt-btn--dark { background:#fff; color:var(--ink); }
      .lt-foot__bar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;
        gap:1rem; max-width:1100px; margin:4rem auto 0; padding-top:1.5rem;
        border-top:1px solid rgba(244,239,231,.14); font-family:var(--font-space,system-ui);
        font-size:.82rem; color:rgba(244,239,231,.6); }
      .lt-foot__links { display:flex; gap:1.4rem; }
      .lt-foot__links a { color:rgba(244,239,231,.8); text-decoration:none; }
      .lt-foot__links a:hover { color:#fff; }
    `}</style>
  );
}
