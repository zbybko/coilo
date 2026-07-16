"use client";

import { useEffect, useRef, useState, useCallback, CSSProperties, ReactNode } from "react";
import { useI18n, Dict } from "../../lib/i18n";

// stop on the dark tunnel-exit (frames 253-280 brighten to cream — unused so the
// hero hands off into the dark site below)
const FRAME_COUNT = 252;
const SCROLL_VH = 480; // height of the pinned scroll track, in vh
const framePath = (i: number) =>
  `/media/spiral/frame_${String(i + 1).padStart(4, "0")}.webp`;

// Archimedean spiral (centre 70,70 · ~4.25 turns) — drawn proportional to load
// progress via pathLength="100" on the loading screen.
const SPIRAL_PATH = "M73.50 70.00 L73.69 70.38 L73.84 70.80 L73.93 71.25 L73.98 71.73 L73.96 72.23 L73.88 72.75 L73.74 73.27 L73.53 73.79 L73.24 74.30 L72.90 74.79 L72.48 75.25 L72.00 75.67 L71.45 76.05 L70.85 76.38 L70.20 76.64 L69.50 76.84 L68.77 76.96 L68.00 76.99 L67.22 76.95 L66.43 76.81 L65.63 76.58 L64.84 76.26 L64.08 75.85 L63.35 75.34 L62.66 74.75 L62.03 74.06 L61.46 73.30 L60.96 72.46 L60.55 71.56 L60.23 70.59 L60.01 69.58 L59.90 68.53 L59.90 67.45 L60.02 66.35 L60.26 65.26 L60.62 64.17 L61.10 63.11 L61.70 62.09 L62.42 61.12 L63.25 60.22 L64.19 59.39 L65.22 58.66 L66.35 58.03 L67.56 57.51 L68.83 57.12 L70.16 56.86 L71.53 56.74 L72.93 56.76 L74.33 56.93 L75.74 57.25 L77.12 57.73 L78.46 58.35 L79.75 59.12 L80.97 60.04 L82.11 61.09 L83.14 62.27 L84.05 63.57 L84.83 64.98 L85.47 66.48 L85.96 68.06 L86.28 69.70 L86.44 71.39 L86.41 73.11 L86.21 74.84 L85.82 76.55 L85.25 78.24 L84.50 79.88 L83.57 81.45 L82.47 82.93 L81.21 84.31 L79.79 85.56 L78.24 86.67 L76.56 87.62 L74.77 88.40 L72.89 89.00 L70.94 89.41 L68.93 89.61 L66.89 89.61 L64.85 89.39 L62.81 88.95 L60.81 88.30 L58.87 87.44 L57.01 86.37 L55.26 85.10 L53.62 83.65 L52.14 82.01 L50.81 80.22 L49.67 78.28 L48.73 76.21 L48.00 74.03 L47.49 71.77 L47.22 69.45 L47.19 67.09 L47.40 64.72 L47.87 62.36 L48.58 60.05 L49.53 57.79 L50.72 55.63 L52.14 53.59 L53.78 51.69 L55.62 49.95 L57.65 48.40 L59.84 47.06 L62.18 45.94 L64.65 45.06 L67.21 44.43 L69.84 44.07 L72.52 43.98 L75.22 44.17 L77.90 44.64 L80.54 45.40 L83.11 46.42 L85.58 47.72 L87.92 49.28 L90.10 51.08 L92.10 53.11 L93.90 55.36 L95.46 57.79 L96.77 60.40 L97.82 63.14 L98.59 66.00 L99.05 68.95 L99.22 71.94 L99.07 74.97 L98.61 77.98 L97.84 80.94 L96.76 83.84 L95.37 86.62 L93.70 89.27 L91.74 91.74 L89.53 94.02 L87.08 96.07 L84.41 97.87 L81.56 99.40 L78.54 100.63 L75.39 101.55 L72.14 102.15 L68.82 102.41 L65.48 102.32 L62.14 101.89 L58.84 101.12 L55.62 100.00 L52.51 98.54 L49.55 96.77 L46.77 94.68 L44.20 92.30 L41.88 89.66 L39.83 86.78 L38.07 83.68 L36.64 80.40 L35.54 76.96 L34.80 73.41 L34.43 69.79 L34.43 66.12 L34.81 62.45 L35.57 58.81 L36.71 55.26 L38.21 51.82 L40.07 48.53 L42.28 45.44 L44.80 42.57 L47.62 39.96 L50.71 37.65 L54.04 35.65 L57.58 34.00 L61.29 32.71 L65.13 31.80 L69.06 31.30 L73.05 31.19 L77.05 31.51 L81.02 32.23 L84.92 33.37 L88.69 34.90 L92.31 36.83 L95.73 39.13 L98.90 41.79 L101.81 44.77 L104.41 48.05 L106.66 51.60 L108.55 55.38 L110.05 59.36 L111.14 63.48 L111.80 67.73 L112.02 72.03 L111.80 76.36 L111.13 80.67 L110.01 84.90 L108.46 89.02 L106.49 92.97 L104.11 96.72 L101.34 100.22 L98.21 103.44 L94.75 106.33 L91.00 108.86 L86.98 111.00 L82.75 112.72 L78.34 114.01 L73.80 114.84 L69.18 115.21 L64.52 115.09 L59.88 114.50 L55.31 113.42 L50.85 111.88 L46.55 109.88 L42.46 107.43 L38.62 104.56 L35.09 101.31 L31.90 97.68 L29.08 93.74 L26.67 89.50 L24.70 85.02 L23.19 80.34 L22.17 75.51 L21.65 70.58 L21.63 65.60 L22.13 60.63 L23.14 55.71 L24.66 50.90 L26.68 46.25 L29.17 41.82 L32.11 37.64 L35.49 33.78 L39.25 30.26 L43.38 27.14 L47.82 24.45 L52.54 22.22 L57.48 20.48 L62.59 19.25 L67.82 18.54 L73.12 18.38 L78.43 18.77 L83.70 19.70 L88.86 21.17 L93.86 23.18 L98.65 25.69 L103.17 28.70 L107.38 32.17 L111.22 36.07 L114.65 40.36 L117.64 44.99 L120.15 49.93 L122.15 55.12 L123.60 60.51 L124.50 66.04 L124.83 71.66 L124.58 77.30 L123.75 82.90 L122.34 88.42 L120.36 93.77 L117.84 98.92 L114.79 103.80 L111.24 108.36 L107.23 112.54 L102.80 116.31 L97.98 119.61 L92.83 122.41 L87.40 124.67 L81.74 126.37 L75.92 127.49 L70.00 128.00";

// contextual draw-on icons (monoline). Act 1 = a 4-point design spark (distinct
// from act 2's coil); later acts get their own glyphs.
const HeroIcons: Record<string, ReactNode> = {
  spark: (
    <svg className="sh-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path style={{ "--len": 150 } as CSSProperties} d="M32 6c1 13 5 17 18 18-13 1-17 5-18 18-1-13-5-17-18-18 13-1 17-5 18-18z" />
      <circle className="dot" cx="51" cy="13" r="2.2" />
      <circle className="dot" cx="13" cy="51" r="1.8" />
    </svg>
  ),
  coil: (
    <svg className="sh-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path style={{ "--len": 360 } as CSSProperties} d="M32 8c-13 0-22 9-22 21 0 10 8 17 17 17 8 0 13-5 13-12 0-6-4-10-9-10-4 0-7 3-7 6 0 3 2 5 5 5" />
    </svg>
  ),
  layers: (
    <svg className="sh-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path style={{ "--len": 60 } as CSSProperties} d="M16 44h32" />
      <path style={{ "--len": 60 } as CSSProperties} d="M18 38h28" />
      <path style={{ "--len": 60 } as CSSProperties} d="M20 32h24" />
      <path style={{ "--len": 60 } as CSSProperties} d="M22 26h20" />
      <path style={{ "--len": 40 } as CSSProperties} d="M25 20h14" />
      <path style={{ "--len": 30 } as CSSProperties} d="M32 12v4" />
      <circle className="dot" cx="32" cy="11" r="2.4" />
    </svg>
  ),
  palette: (
    <svg className="sh-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path style={{ "--len": 200 } as CSSProperties} d="M32 12c-12 0-21 8-21 19 0 8 6 13 13 13 3 0 4-2 4-4 0-3 2-4 4-4h6c8 0 12-5 12-12 0-7-8-12-18-12z" />
      <circle className="dot" cx="22" cy="26" r="2.6" />
      <circle className="dot" cx="32" cy="22" r="2.6" />
      <circle className="dot" cx="42" cy="26" r="2.6" />
      <circle className="dot" cx="44" cy="36" r="2.6" />
    </svg>
  ),
};

type Act = {
  from: number;
  to: number;
  kicker?: string;
  title: string;
  sub: string;
  brand?: boolean;
  dark?: boolean;   // white text + halo over the light room frames
  spiral?: boolean; // headings track the spiral's current colour
  icon?: string;
};

// progress ranges (0..1) mapped to the journey, each with a contextual icon
function actsFor(t: Dict): Act[] {
  return [
    { from: 0.0, to: 0.14, kicker: t.hero.kicker, title: "Coilo", sub: t.hero.sub1, brand: true, dark: true, icon: "spark" },
    { from: 0.24, to: 0.36, title: t.hero.title2, sub: t.hero.sub2, spiral: true, icon: "coil" },
    { from: 0.46, to: 0.58, title: t.hero.title3, sub: t.hero.sub3, spiral: true, icon: "layers" },
    { from: 0.68, to: 0.8, title: t.hero.title4, sub: "Sakura · Cyan · Cherry · Rosé · Sunflower", spiral: true, icon: "palette" },
  ];
}

// the tunnel's ring colour at each point of the journey (bright finish accents,
// readable on the dark navy interior). Drives --spiral-color.
const SPIRAL_STOPS: [number, [number, number, number]][] = [
  [0.18, [0x1b, 0xa6, 0xdf]], // Cyan
  [0.30, [0x1b, 0xa6, 0xdf]],
  [0.52, [0xf0, 0x45, 0x7a]], // Rosé / Cherry tunnel
  [0.74, [0xf2, 0xa9, 0x00]], // Sunflower
  [0.86, [0xf2, 0xa9, 0x00]],
];

function spiralColorAt(p: number): string {
  const s = SPIRAL_STOPS;
  if (p <= s[0][0]) return `rgb(${s[0][1].join(",")})`;
  if (p >= s[s.length - 1][0]) return `rgb(${s[s.length - 1][1].join(",")})`;
  for (let i = 0; i < s.length - 1; i++) {
    const [p0, c0] = s[i], [p1, c1] = s[i + 1];
    if (p >= p0 && p <= p1) {
      const t = (p - p0) / (p1 - p0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
      return `rgb(${r},${g},${b})`;
    }
  }
  return `rgb(${s[0][1].join(",")})`;
}

function actOpacity(p: number, a: Act) {
  const fade = 0.035;
  if (p <= a.from - fade || p >= a.to + fade) return 0;
  if (p < a.from) return (p - (a.from - fade)) / fade;
  if (p > a.to) return 1 - (p - a.to) / fade;
  return 1;
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
  const ir = img.width / img.height;
  const cr = cw / ch;
  let dw: number, dh: number;
  if (cr > ir) { dw = cw; dh = cw / ir; } else { dh = ch; dw = ch * ir; }
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

const READY = 24; // first batch of frames that the loader waits for

export default function SpiralHero() {
  const { t } = useI18n();
  const ACTS = actsFor(t);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef(-1);
  const desiredFrameRef = useRef(0);
  const mountTimeRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [hideLoader, setHideLoader] = useState(false);

  const sizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(c.clientWidth * dpr);
    c.height = Math.round(c.clientHeight * dpr);
    lastFrameRef.current = -1; // force redraw
  }, []);

  const renderFrame = useCallback((frame: number) => {
    desiredFrameRef.current = frame;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let img = imgsRef.current[frame];
    // fall back to nearest loaded frame if this one isn't ready
    if (!img || !img.complete || !img.naturalWidth) {
      for (let d = 1; d < FRAME_COUNT; d++) {
        const a = imgsRef.current[frame - d];
        const b = imgsRef.current[frame + d];
        if (a && a.complete && a.naturalWidth) { img = a; break; }
        if (b && b.complete && b.naturalWidth) { img = b; break; }
      }
    }
    if (img && img.complete && img.naturalWidth) drawCover(ctx, img, c.width, c.height);
  }, []);

  // preload: eager first batch sequentially (for the loader count-up), then ALL
  // the rest with a parallel pool so the flythrough never outruns loaded frames.
  // Each frame repaints on load if it's the one currently parked under the camera.
  useEffect(() => {
    mountTimeRef.current = Date.now();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      const im = new Image();
      im.src = framePath(0);
      imgsRef.current[0] = im;
      im.onload = () => { sizeCanvas(); renderFrame(0); setLoaded(READY); };
      return;
    }
    let cancelled = false;
    let count = 0;
    const arr: HTMLImageElement[] = new Array(FRAME_COUNT);
    imgsRef.current = arr;
    const loadOne = (i: number) =>
      new Promise<void>((res) => {
        const im = new Image();
        im.decoding = "async";
        im.src = framePath(i);
        arr[i] = im;
        const done = () => {
          count++;
          if (cancelled) return res();
          setLoaded(count);
          if (i === desiredFrameRef.current) renderFrame(i);
          res();
        };
        if (im.complete && im.naturalWidth) done();
        else { im.onload = done; im.onerror = done; }
      });
    (async () => {
      for (let i = 0; i < READY && !cancelled; i++) await loadOne(i);
      sizeCanvas();
      renderFrame(0);
      const POOL = 16;
      let next = READY;
      const worker = async () => {
        while (!cancelled && next < FRAME_COUNT) await loadOne(next++);
      };
      await Promise.all(Array.from({ length: POOL }, worker));
    })();
    return () => { cancelled = true; };
  }, [sizeCanvas, renderFrame]);

  // scroll → progress → frame
  useEffect(() => {
    if (reduced) return;
    let scheduled = false;
    const compute = () => {
      scheduled = false;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(p);
      if (stickyRef.current) stickyRef.current.style.setProperty("--spiral-color", spiralColorAt(p));
      const frame = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(p * (FRAME_COUNT - 1))));
      if (frame !== lastFrameRef.current) { lastFrameRef.current = frame; renderFrame(frame); }
    };
    const onScroll = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(compute); } };
    const onResize = () => { sizeCanvas(); compute(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, renderFrame, sizeCanvas]);

  const pct = Math.min(100, Math.round((loaded / READY) * 100));
  const ready = loaded >= READY;

  // graceful fade-out: hold a moment after ready (so the spiral is seen even on
  // cached loads), then dissolve via CSS, then unmount.
  useEffect(() => {
    if (!ready || reduced) return;
    const elapsed = Date.now() - mountTimeRef.current;
    const hold = Math.max(0, 650 - elapsed);
    const tClass = setTimeout(() => {
      document.querySelector(".sh-loader")?.classList.add("sh-loader--out");
    }, hold);
    const tHide = setTimeout(() => setHideLoader(true), hold + 600);
    return () => { clearTimeout(tClass); clearTimeout(tHide); };
  }, [ready, reduced]);

  // ---- reduced-motion: static hero ----
  if (reduced) {
    return (
      <section className="sh-static" data-nav-theme="dark">
        <canvas ref={canvasRef} className="sh-canvas" />
        <div className="sh-act sh-act--dark sh-act--static" data-active="1">
          {HeroIcons.spark}
          <p className="sh-kicker">{t.hero.kicker}</p>
          <h1 className="sh-brand">Coilo</h1>
          <p className="sh-sub">{t.hero.sub1}</p>
          <a href="#configurator" className="sh-cta">{t.hero.cta}</a>
        </div>
        <StyleTag />
      </section>
    );
  }

  return (
    <div ref={wrapRef} className="sh-track" style={{ height: `${SCROLL_VH}vh` }}>
      <div className="sh-sticky" ref={stickyRef} style={{ "--spiral-color": "rgb(27,166,223)" } as CSSProperties}>
        <canvas ref={canvasRef} className="sh-canvas" />

        {/* cream spiral loader — draws itself as the first frames arrive */}
        {!hideLoader && (
          <div className="sh-loader" data-nav-theme="light">
            <div className="sh-loader-art">
              <svg className="sh-loader-spiral" viewBox="0 0 140 140" aria-hidden="true">
                <defs>
                  <linearGradient id="coiloSpiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1BA6DF" />
                    <stop offset="48%" stopColor="#F0457A" />
                    <stop offset="100%" stopColor="#F2A900" />
                  </linearGradient>
                </defs>
                <path className="sh-loader-track" d={SPIRAL_PATH} pathLength="100" />
                <path className="sh-loader-draw" d={SPIRAL_PATH} pathLength="100"
                      style={{ strokeDashoffset: 100 - pct }} />
              </svg>
              <span className="sh-loader-pct">{pct}<small>%</small></span>
            </div>
            <p className="sh-loader-word">Coilo</p>
            <p className="sh-loader-sub">Unwinding the spiral</p>
          </div>
        )}

        {/* text acts */}
        <div className="sh-acts">
          {ACTS.map((a, i) => {
            const o = actOpacity(progress, a);
            const activeNow = o > 0.5;
            return (
              <div
                key={i}
                className={`sh-act${a.dark ? " sh-act--dark" : ""}${a.spiral ? " sh-act--spiral" : ""}`}
                data-active={activeNow ? "1" : "0"}
                style={{
                  opacity: o,
                  transform: `translate(-50%, calc(-50% + ${(1 - o) * 16}px))`,
                  pointerEvents: o > 0.6 ? "auto" : "none",
                }}
                aria-hidden={o < 0.5}
              >
                {a.icon && HeroIcons[a.icon]}
                {a.kicker && <p className="sh-kicker">{a.kicker}</p>}
                {a.brand ? <h1 className="sh-brand">{a.title}</h1> : <h2 className="sh-title">{a.title}</h2>}
                <p className="sh-sub">{a.sub}</p>
              </div>
            );
          })}
        </div>

        {/* progress rail */}
        <div className="sh-rail" aria-hidden>
          <div className="sh-rail__fill" style={{ height: `${progress * 100}%` }} />
        </div>

        {/* scroll hint (fades after start) */}
        <div className={`sh-hint${progress < 0.16 ? " sh-hint--dark" : ""}`} style={{ opacity: progress < 0.04 ? 1 : 0 }}>
          <span>{t.hero.scroll}</span>
          <div className="sh-hint__line" />
        </div>
      </div>
      <StyleTag />
    </div>
  );
}

function StyleTag() {
  return (
    <style>{`
      .sh-track { position: relative; background:#f1ece1; }
      .sh-sticky { position: sticky; top: 0; height: 100svh; overflow: hidden;
        background:#f1ece1; display:flex; align-items:center; justify-content:center; }
      .sh-canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
      .sh-static { position: relative; height:100vh; overflow:hidden; background:#f1ece1;
        display:flex; align-items:center; justify-content:center; }
      .sh-act--static { position: relative; left: auto; top: auto; transform: none !important; }

      /* cream spiral loader */
      .sh-loader { position:absolute; inset:0; z-index:6; display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:6px; background:#f1ece1; color:#15110e;
        animation: sh-loaderfade .5s ease; transition: opacity .6s ease; }
      .sh-loader--out { opacity:0; pointer-events:none; }
      @keyframes sh-loaderfade { from{opacity:0} to{opacity:1} }
      .sh-loader-art { position:relative; width:clamp(150px,22vw,210px); aspect-ratio:1;
        display:grid; place-items:center; }
      .sh-loader-spiral { position:absolute; inset:0; width:100%; height:100%;
        animation: sh-loaderturn 9s linear infinite; }
      @keyframes sh-loaderturn { to{transform:rotate(360deg)} }
      .sh-loader-track { fill:none; stroke:rgba(21,17,14,.08); stroke-width:2.2; stroke-linecap:round; }
      .sh-loader-draw { fill:none; stroke:url(#coiloSpiralGrad); stroke-width:3.2; stroke-linecap:round;
        stroke-dasharray:100; transition: stroke-dashoffset .45s cubic-bezier(.4,0,.2,1);
        filter: drop-shadow(0 2px 8px rgba(27,166,223,.28)); }
      .sh-loader-pct { position:relative; z-index:1; font-family: var(--font-instrument, Georgia, serif);
        font-weight:400; font-size:clamp(30px,4.4vw,44px); line-height:1; color:#15110e; }
      .sh-loader-pct small { font-family: var(--font-space, system-ui); font-size:.42em; font-weight:600;
        margin-left:2px; color:rgba(21,17,14,.45); vertical-align:super; }
      .sh-loader-word { font-family: var(--font-instrument, Georgia, serif); font-weight:400;
        font-size:clamp(28px,3.4vw,40px); line-height:1; margin-top:14px; color:#15110e; }
      .sh-loader-sub { font-family: var(--font-space, system-ui); font-weight:600; font-size:11px;
        letter-spacing:.26em; text-transform:uppercase; color:rgba(21,17,14,.4); margin:0; }
      @media (prefers-reduced-motion: reduce){ .sh-loader-spiral{ animation:none } }

      .sh-acts { position:absolute; inset:0; z-index:3; }
      .sh-act { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
        width:min(760px,88vw); text-align:center; color:#fff;
        display:flex; flex-direction:column; align-items:center; gap:18px;
        will-change:opacity,transform; }
      .sh-kicker { font-family: var(--font-space, system-ui); text-transform:uppercase;
        letter-spacing:.3em; font-size:12px; font-weight:600; margin:0; }
      .sh-brand { font-family: var(--font-instrument, Georgia, serif); font-weight:400;
        font-size: clamp(4.4rem, 14vw, 10rem); line-height:.92; margin:0; }
      .sh-title { font-family: var(--font-instrument, Georgia, serif); font-weight:400;
        font-style:italic; font-size: clamp(2.5rem, 6.6vw, 5rem); line-height:1.02; margin:0; }
      .sh-sub { font-family: var(--font-space, system-ui); font-weight:300;
        font-size: clamp(1rem, 1.5vw, 1.25rem); line-height:1.6; margin:0 auto; max-width:46ch; }
      .sh-cta { display:inline-block; margin-top:8px; padding:.95rem 2rem; border-radius:100px;
        background:#15110e; color:#f6efe6; font-family:var(--font-space,system-ui); font-weight:600;
        font-size:.95rem; text-decoration:none; transition:transform .2s, box-shadow .2s; }
      .sh-cta:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(0,0,0,.3); }

      /* act 1: airy white wordmark with a soft dark contrast halo (reads over both
         the cream room and the cyan spiral) */
      .sh-act--dark { color:#fff; }
      .sh-act--dark::before { content:""; position:absolute; left:50%; top:50%;
        transform:translate(-50%,-50%); width:124%; height:150%; z-index:-1; pointer-events:none;
        background: radial-gradient(54% 52% at 50% 50%, rgba(12,14,18,.30), rgba(12,14,18,.12) 52%, rgba(12,14,18,0) 74%);
        filter: blur(14px); }
      .sh-act--dark .sh-kicker { color:#fff; text-shadow:0 1px 14px rgba(8,10,14,.55); }
      .sh-act--dark .sh-sub { color:rgba(255,255,255,.9); font-style:italic; text-shadow:0 2px 18px rgba(8,10,14,.5); }
      .sh-act--dark .sh-brand { color:#fff; text-shadow:0 2px 4px rgba(8,10,14,.32), 0 8px 44px rgba(8,10,14,.5); }

      /* tunnel acts: headings track the spiral's current colour */
      .sh-act--spiral { color:#fff; }
      .sh-act--spiral .sh-title, .sh-act--spiral .sh-kicker {
        color: var(--spiral-color, #1BA6DF); transition: color .4s ease; }
      .sh-act--spiral .sh-sub { color:rgba(255,255,255,.88); text-shadow:0 2px 24px rgba(0,0,0,.55); }
      .sh-act--spiral .sh-title { text-shadow:0 4px 40px rgba(0,0,0,.5); }

      /* animated contextual icon (draw-on monoline) */
      .sh-icon { width:clamp(54px,6.5vw,78px); height:clamp(54px,6.5vw,78px); display:block; }
      .sh-icon path, .sh-icon circle {
        fill:none; stroke: var(--spiral-color, #1BA6DF); stroke-width:2.4;
        stroke-linecap:round; stroke-linejoin:round;
        stroke-dasharray: var(--len, 320); stroke-dashoffset: var(--len, 320); }
      .sh-act--dark .sh-icon path, .sh-act--dark .sh-icon circle { stroke:#1BA6DF; }
      .sh-act[data-active="1"] .sh-icon path, .sh-act[data-active="1"] .sh-icon circle {
        animation: sh-drawon 1.15s cubic-bezier(.65,.05,.36,1) forwards; }
      .sh-icon .dot { fill: var(--spiral-color, #1BA6DF); stroke:none;
        stroke-dasharray:0; stroke-dashoffset:0; opacity:0; transform:scale(.4);
        transform-origin:center; transform-box:fill-box; }
      .sh-act--dark .sh-icon .dot { fill:#1BA6DF; }
      .sh-act[data-active="1"] .sh-icon .dot { animation: sh-popdot .5s ease .4s forwards; }
      @keyframes sh-drawon { to{stroke-dashoffset:0} }
      @keyframes sh-popdot { to{opacity:1; transform:scale(1)} }
      @media (prefers-reduced-motion: reduce){
        .sh-icon path, .sh-icon circle { stroke-dashoffset:0; }
        .sh-icon .dot { opacity:1; transform:none; }
      }

      .sh-rail { position:absolute; right:26px; top:50%; transform:translateY(-50%);
        width:2px; height:34vh; background:rgba(255,255,255,.18); border-radius:2px; z-index:5; }
      .sh-rail__fill { width:100%; background:var(--spiral-color,#1BA6DF); border-radius:2px;
        transition: background .4s ease; }

      .sh-hint { position:absolute; left:50%; bottom:34px; transform:translateX(-50%);
        display:flex; flex-direction:column; align-items:center; gap:.6rem; color:#fff; z-index:5;
        transition:opacity .4s ease; }
      .sh-hint span { font-family:var(--font-space,system-ui); font-size:.7rem;
        letter-spacing:.24em; text-transform:uppercase; }
      .sh-hint__line { width:1px; height:40px; background:linear-gradient(currentColor,transparent);
        animation: sh-pulse 1.8s ease-in-out infinite; }
      @keyframes sh-pulse { 0%,100%{opacity:.3;transform:scaleY(.6)} 50%{opacity:1;transform:scaleY(1)} }
      .sh-hint--dark { color:#15110e; }

      @media (max-width:720px){ .sh-rail{ display:none } }
    `}</style>
  );
}
