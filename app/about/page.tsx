"use client";

import { useEffect, useRef, CSSProperties } from "react";
import SiteNav from "../components/SiteNav";
import LegalLinks from "../components/LegalLinks";
import { captureAttribution } from "../../lib/attribution";

const ETSY_URL = "https://www.etsy.com/shop/Coilo";
const TIKTOK_URL = "https://www.tiktok.com/@coilo.home";
const PINTEREST_URL = "https://de.pinterest.com/coilostudio/";

const STEPS = [
  { num: "01", title: "Parametric modeling",
    desc: "The spiral geometry is defined parametrically — wall thickness, pitch, and curvature are all tuned for strength and visual balance before any material is used.",
    detail: { label: "Software", val: "Custom parametric CAD pipeline" } },
  { num: "02", title: "Slicing & path planning",
    desc: "The 3D model is sliced into thousands of layers, each 0.2 mm thin. The printer path is optimized to minimize seams and maximize surface smoothness.",
    detail: { label: "Layer height", val: "0.2 mm — ~900 layers per unit" } },
  { num: "03", title: "FDM printing",
    desc: "Each unit is printed on a professional FDM machine using PLA filament. The continuous spiral form requires no supports — the geometry is self-supporting by design.",
    detail: { label: "Print time", val: "~16–18 hours per unit" } },
  { num: "04", title: "Post-processing",
    desc: "After printing, each piece is inspected, cleaned, and lightly finished. No painting — the color runs through the entire material.",
    detail: null },
  { num: "05", title: "Quality check & packing",
    desc: "Every shelf passes a visual and structural inspection before being carefully packed in recycled cardboard and shipped from Germany.",
    detail: { label: "Shipping", val: "EU-wide, tracked & insured" } },
];

const MAT_PROPS = [
  { label: "Weight", val: "~280 g" },
  { label: "Dimensions", val: "245×178×192 mm" },
  { label: "Finish", val: "Smooth matte" },
  { label: "Durability", val: "High rigidity" },
];

const PILLS = ["Zero-waste production", "Plant-based PLA", "No assembly needed", "Made to order", "Recycled packaging"];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { el.classList.add("rv-on"); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("rv-on"); obs.unobserve(el); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Rv({ children, className = "", delay = 0, style = {} }:
  { children: React.ReactNode; className?: string; delay?: number; style?: CSSProperties }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`rv ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function AboutPage() {
  useEffect(() => {
    captureAttribution(); // store utm_*/click IDs for the checkout hop
  }, []);
  return (
    <>
      <style>{`
        .rv { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s ease; }
        .rv-on { opacity: 1; transform: translateY(0); }

        .about-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(20px,5vw,72px); height: 72px;
          background: rgba(10,10,10,.92); backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 rgba(255,255,255,.06); }
        .about-nav__brand { display: flex; align-items: center; gap: 10px;
          font-size: 18px; font-weight: 700; color: #f8f5ee; text-decoration: none; }
        .about-nav__brand img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .about-nav__links { display: flex; align-items: center; gap: clamp(18px,3vw,36px);
          font-size: 13px; font-weight: 600; color: rgba(248,245,238,0.55); }
        .about-nav__links a { color: inherit; text-decoration: none; transition: color .2s; }
        .about-nav__links a:hover, .about-nav__links a.active { color: #fff; }
        .about-nav__cta { display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border: 1.5px solid rgba(255,255,255,.25); border-radius: 999px;
          color: #fff !important; font-weight: 700; transition: border-color .2s; }
        .about-nav__cta:hover { border-color: rgba(255,255,255,.6); }

        .about-hero { padding: calc(72px + clamp(48px,8vw,96px)) clamp(20px,5vw,72px) clamp(64px,10vw,120px);
          background: linear-gradient(180deg,color-mix(in oklch,#08a6ff 6%,#0a0a0a),#0a0a0a);
          text-align: center; color: #f8f5ee; }
        .about-hero__eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .15em; color: rgba(248,245,238,0.55); margin-bottom: 18px; }
        .about-hero h1 { font-family: var(--font-instrument,Georgia,serif);
          font-size: clamp(44px,7vw,100px); font-weight: 400; line-height: .92; margin-bottom: 20px; }
        .about-hero h1 em { font-style: italic;
          background: linear-gradient(135deg,#1BA6DF,#F0457A);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          /* extend the painted box below the baseline so the italic "p" descender gets filled */
          padding-bottom: .18em; margin-bottom: -.18em; }
        .about-hero p { max-width: 580px; margin: 0 auto; color: rgba(248,245,238,0.55);
          font-size: clamp(16px,1.8vw,20px); line-height: 1.65; }

        .timeline { padding: clamp(64px,9vw,120px) clamp(20px,5vw,72px);
          background: #f5f2eb; color: #111; }
        .timeline__header { text-align: center; margin-bottom: clamp(48px,6vw,80px); }
        .timeline__header h2 { font-family: var(--font-instrument,Georgia,serif);
          font-size: clamp(36px,5vw,68px); font-weight: 400; line-height: 1; margin-bottom: 14px; }
        .timeline__header p { max-width: 520px; margin: 0 auto; color: rgba(17,17,17,.55);
          font-size: clamp(15px,1.5vw,18px); line-height: 1.65; }
        .timeline__grid { display: grid; gap: 0; max-width: 920px; margin: 0 auto; position: relative; }
        .timeline__grid::before { content:""; position:absolute; left:32px; top:0; bottom:0;
          width:2px; background:rgba(17,17,17,.1); }
        .step { display: grid; grid-template-columns: 64px 1fr; gap: 0; padding: 0 0 clamp(48px,5vw,72px); }
        .step__num { width:64px; height:64px; border-radius:50%; display:flex; align-items:center;
          justify-content:center; font-size:20px; font-weight:700; color:#fff;
          background:#111; position:relative; z-index:2; flex-shrink:0; }
        .step__body { padding: 10px 0 0 clamp(20px,3vw,40px); }
        .step__title { font-family: var(--font-instrument,Georgia,serif);
          font-size: clamp(24px,3vw,36px); font-weight:400; margin-bottom:10px; }
        .step__desc { color:rgba(17,17,17,.6); font-size:clamp(14px,1.4vw,16px);
          line-height:1.7; max-width:540px; }
        .step__detail { margin-top:18px; padding:20px 24px; border-radius:10px;
          background:rgba(17,17,17,.04); border:1px solid rgba(17,17,17,.08); }
        .step__detail-label { font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:.1em; color:rgba(17,17,17,.35); margin-bottom:6px; }
        .step__detail-value { font-size:15px; font-weight:600; line-height:1.5; }

        .timelapse { padding:0 clamp(20px,5vw,72px) clamp(56px,8vw,96px); background:#fff; }
        .timelapse__inner { max-width:1080px; margin:0 auto; }
        .timelapse__eyebrow { font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:.15em; color:rgba(17,17,17,.4); margin-bottom:16px; text-align:center; }
        .timelapse__frame { position:relative; border-radius:18px; overflow:hidden;
          aspect-ratio:16/9; background:linear-gradient(135deg,#1a1a1a,#0a0a0a);
          display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(17,17,17,.08); }
        .timelapse__placeholder { font-size:13px; font-weight:600; letter-spacing:.04em;
          color:rgba(248,245,238,.4); }

        .materials { display:grid; grid-template-columns:1fr; }
        .materials__image { position:relative; overflow:hidden; }
        .materials__image img { width:100%; height:100%; object-fit:cover; display:block; }
        .materials__content { padding:clamp(48px,6vw,96px); display:flex; flex-direction:column;
          justify-content:center; background:#141414; color:#f8f5ee; }
        .materials__eyebrow { font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:.15em; color:rgba(248,245,238,0.55); margin-bottom:14px; }
        .materials h2 { font-family:var(--font-instrument,Georgia,serif);
          font-size:clamp(32px,4vw,56px); font-weight:400; line-height:.96; margin-bottom:18px; }
        .materials p { color:rgba(248,245,238,0.55); font-size:clamp(15px,1.4vw,17px);
          line-height:1.7; max-width:480px; margin-bottom:28px; }
        .mat-props { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .mat-prop { padding:16px 20px; background:rgba(255,255,255,.05); border-radius:8px; }
        .mat-prop__label { font-size:11px; font-weight:700; text-transform:uppercase;
          letter-spacing:.08em; color:rgba(248,245,238,0.55); margin-bottom:4px; }
        .mat-prop__val { font-size:17px; font-weight:700; }

        .sustain { padding:clamp(64px,9vw,120px) clamp(20px,5vw,72px); text-align:center;
          background:#0a0a0a; color:#f8f5ee; }
        .sustain h2 { font-family:var(--font-instrument,Georgia,serif);
          font-size:clamp(36px,5vw,64px); font-weight:400; line-height:1; margin-bottom:18px; }
        .sustain p { max-width:560px; margin:0 auto; color:rgba(248,245,238,0.55);
          font-size:clamp(15px,1.5vw,18px); line-height:1.65; }
        .sustain__pills { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-top:36px; }
        .sustain__pill { padding:12px 24px; border:1.5px solid rgba(255,255,255,.15);
          border-radius:999px; font-size:14px; font-weight:600;
          transition:border-color .25s, background .25s; }
        .sustain__pill:hover { border-color:rgba(255,255,255,.35); background:rgba(255,255,255,.04); }

        .about-cta { padding:clamp(64px,9vw,120px) clamp(20px,5vw,72px); text-align:center;
          background:#f5f2eb; color:#111; }
        .about-cta h2 { font-family:var(--font-instrument,Georgia,serif);
          font-size:clamp(36px,5vw,64px); font-weight:400; line-height:.96; margin-bottom:16px; }
        .about-cta p { color:rgba(17,17,17,.55); font-size:clamp(15px,1.5vw,18px); margin-bottom:32px; }
        .about-cta__actions { display:flex; justify-content:center; flex-wrap:wrap; gap:12px; }
        .btn-dark { display:inline-flex; align-items:center; gap:8px; padding:0 28px; height:52px;
          border-radius:999px; font-size:14px; font-weight:600; letter-spacing:.02em;
          background:#111; color:#fff; text-decoration:none; transition:transform .2s, background .2s; }
        .btn-dark:hover { transform:translateY(-2px); background:#222; }
        .btn-outline-dark { display:inline-flex; align-items:center; gap:8px; padding:0 28px; height:52px;
          border-radius:999px; font-size:14px; font-weight:600; letter-spacing:.02em;
          border:1.5px solid rgba(17,17,17,.2); color:#111; text-decoration:none;
          transition:transform .2s, border-color .2s; }
        .btn-outline-dark:hover { transform:translateY(-2px); border-color:rgba(17,17,17,.5); }

        .about-foot { padding:22px clamp(20px,5vw,72px); border-top:1px solid rgba(255,255,255,.08);
          display:flex; flex-direction:column; gap:14px;
          font-size:13px; color:rgba(248,245,238,0.55); background:#0a0a0a; }
        .about-foot__row { display:flex; align-items:center; justify-content:space-between;
          gap:12px; flex-wrap:wrap; }
        .about-foot a { color:inherit; text-decoration:none; transition:color .2s; }
        .about-foot a:hover { color:#fff; }
        .about-foot__links { display:flex; gap:24px; }

        @media (max-width: 900px) {
          .materials { grid-template-columns: 1fr; }
          .materials__image { min-height: 340px; }
          .mat-props { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .about-nav__links { display: none; }
          .timeline__grid::before { left: 20px; }
          .step { grid-template-columns: 40px 1fr; }
          .step__num { width: 40px; height: 40px; font-size: 14px; }
          .about-foot__row { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      {/* Nav */}
      <SiteNav active="about" />

      {/* Hero */}
      <section className="about-hero">
        <p className="about-hero__eyebrow">How It&apos;s Made</p>
        <h1>Printed with <em>precision</em>,<br />shaped by design.</h1>
        <p>Every Coilo bookshelf is 3D-printed in Germany — one continuous spiral, no assembly, no waste.</p>
      </section>

      {/* Timeline */}
      <section className="timeline">
        <Rv className="timeline__header">
          <h2>From file to shelf.</h2>
          <p>The journey of a single Coilo takes about 18 hours — from digital model to finished product.</p>
        </Rv>
        <div className="timeline__grid">
          {STEPS.map((s, i) => (
            <Rv key={s.num} className="step" delay={i * 100} style={{ display: "grid", gridTemplateColumns: "64px 1fr" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div className="step__num">{s.num}</div>
              </div>
              <div className="step__body">
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
                {s.detail && (
                  <div className="step__detail">
                    <p className="step__detail-label">{s.detail.label}</p>
                    <p className="step__detail-value">{s.detail.val}</p>
                  </div>
                )}
              </div>
            </Rv>
          ))}
        </div>
      </section>

      {/* Print time-lapse — reserved container; swap the placeholder for a
          <video src="/media/site-assets/video/print-timelapse.mp4" ...> once provided */}
      <section className="timelapse">
        <Rv className="timelapse__inner">
          <p className="timelapse__eyebrow">Printed, not manufactured</p>
          <div className="timelapse__frame" aria-label="Print time-lapse coming soon">
            <span className="timelapse__placeholder">Print time-lapse — coming soon</span>
          </div>
        </Rv>
      </section>

      {/* Materials */}
      <section className="materials">
        <div className="materials__content">
          <Rv>
            <p className="materials__eyebrow">Material</p>
            <h2>PLA — plant-based plastic.</h2>
            <p>Polylactic acid is derived from renewable resources like corn starch. It&apos;s rigid, lightweight, and has a smooth matte finish that feels premium to the touch.</p>
          </Rv>
          <Rv className="mat-props" delay={120}>
            {MAT_PROPS.map(m => (
              <div key={m.label} className="mat-prop">
                <p className="mat-prop__label">{m.label}</p>
                <p className="mat-prop__val">{m.val}</p>
              </div>
            ))}
          </Rv>
        </div>
      </section>

      {/* Sustainability */}
      <section className="sustain">
        <Rv>
          <h2>Made responsibly.</h2>
          <p>3D printing produces near-zero material waste. Each Coilo uses only the filament it needs — no molds, no offcuts, no overproduction.</p>
          <div className="sustain__pills">
            {PILLS.map(p => <span key={p} className="sustain__pill">{p}</span>)}
          </div>
        </Rv>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <Rv>
          <h2>See it in your color.</h2>
          <p>Five finishes, one sculptural form. Explore them all.</p>
          <div className="about-cta__actions">
            <a href="/colors" className="btn-dark">Explore Colors</a>
            <a href="/" className="btn-outline-dark">Back to Home</a>
          </div>
        </Rv>
      </section>

      {/* Footer */}
      <footer className="about-foot">
        <div className="about-foot__row">
          <span>© 2026 Coilo</span>
          <div className="about-foot__links">
            <a href="/">Home</a>
            <a href="/about">How It&apos;s Made</a>
            <a href="/colors">Colors</a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener">TikTok</a>
            <a href={PINTEREST_URL} target="_blank" rel="noopener">Pinterest</a>
            <a href={ETSY_URL} target="_blank" rel="noopener">Etsy</a>
          </div>
        </div>
        <div className="about-foot__row">
          <span>Rechtliches</span>
          <LegalLinks />
        </div>
      </footer>
    </>
  );
}
