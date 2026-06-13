"use client";

import { useEffect, useRef, useState, useCallback, CSSProperties } from "react";

// stop on the dark tunnel-exit (frames 253-280 brighten to cream — unused so the
// hero hands off into the dark site below)
const FRAME_COUNT = 252;
const SCROLL_VH = 480; // height of the pinned scroll track, in vh
const framePath = (i: number) =>
  `/media/spiral/frame_${String(i + 1).padStart(4, "0")}.webp`;

type Act = {
  from: number;
  to: number;
  kicker?: string;
  title: string;
  sub: string;
  brand?: boolean;
  dark?: boolean;   // dark text over the light room frames
  spiral?: boolean; // headings track the spiral's current colour
};

// progress ranges (0..1) mapped to the 280-frame journey
const ACTS: Act[] = [
  { from: 0.0, to: 0.14, kicker: "3D-printed design object", title: "Coilo", sub: "Where design unwinds.", brand: true, dark: true },
  { from: 0.24, to: 0.36, title: "One continuous line", sub: "A single sweeping coil holds your books upright — structure becomes ornament.", spiral: true },
  { from: 0.46, to: 0.58, title: "Printed, not manufactured", sub: "Premium PLA, precision FDM, finished by hand. Made in Germany.", spiral: true },
  { from: 0.68, to: 0.8, title: "Five finishes. One icon.", sub: "Cyan · Sakura · Cherry · Sunflower · Rosé", spiral: true },
];

// the tunnel's ring colour at each point of the journey (bright finish accents,
// readable on the dark navy interior). Drives --spiral-color so the headings
// shift in sync with the render as you scroll.
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
  const fade = 0.03;
  if (p <= a.from - fade || p >= a.to + fade) return 0;
  if (p < a.from) return (p - (a.from - fade)) / fade;
  if (p > a.to) return 1 - (p - a.to) / fade;
  return 1;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
) {
  const ir = img.width / img.height;
  const cr = cw / ch;
  let dw: number, dh: number;
  if (cr > ir) {
    dw = cw;
    dh = cw / ir;
  } else {
    dh = ch;
    dw = ch * ir;
  }
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

export default function SpiralHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [loaded, setLoaded] = useState(0);

  // resize canvas to its display size (dpr-aware) and redraw
  const sizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth,
      h = c.clientHeight;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    lastFrameRef.current = -1; // force redraw
  }, []);

  const renderFrame = useCallback((frame: number) => {
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

  // preload frames (first ones eager, rest in background)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      // load a single representative frame for the static hero
      const im = new Image();
      im.src = framePath(0);
      imgsRef.current[0] = im;
      im.onload = () => { sizeCanvas(); renderFrame(0); };
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
          if (!cancelled && count % 8 === 0) setLoaded(count);
          res();
        };
        im.onload = done;
        im.onerror = done;
      });
    (async () => {
      // eager: first 24 frames so the opening is instant
      for (let i = 0; i < 24 && !cancelled; i++) await loadOne(i);
      sizeCanvas();
      renderFrame(0);
      setLoaded(count);
      // background: the rest
      for (let i = 24; i < FRAME_COUNT && !cancelled; i++) await loadOne(i);
      if (!cancelled) setLoaded(FRAME_COUNT);
    })();
    return () => { cancelled = true; };
  }, [sizeCanvas, renderFrame]);

  // scroll → progress (rAF throttled)
  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        setProgress(p);
        const frame = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(p * (FRAME_COUNT - 1))));
        if (frame !== lastFrameRef.current) {
          lastFrameRef.current = frame;
          renderFrame(frame);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { sizeCanvas(); onScroll(); };
    window.addEventListener("resize", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, renderFrame, sizeCanvas]);

  // ---- reduced-motion: static hero ----
  if (reduced) {
    return (
      <section className="sh-static">
        <canvas ref={canvasRef} className="sh-canvas" />
        <div className="sh-overlay">
          <p className="sh-kicker">3D-printed design object</p>
          <h1 className="sh-brand">Coilo</h1>
          <p className="sh-sub">Where design unwinds. 3D-printed spiral bookshelves, made in Germany.</p>
          <a href="#shop" className="sh-cta">Explore the collection</a>
        </div>
        <StyleTag />
      </section>
    );
  }

  const pct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <div ref={wrapRef} className="sh-track" style={{ height: `${SCROLL_VH}vh` }}>
      <div className="sh-sticky" style={{ "--spiral-color": spiralColorAt(progress) } as CSSProperties}>
        <canvas ref={canvasRef} className="sh-canvas" />

        {/* loading veil */}
        {loaded < 24 && (
          <div className="sh-loader">
            <span>Loading the spiral… {pct}%</span>
          </div>
        )}

        {/* text acts */}
        {ACTS.map((a, i) => {
          const o = actOpacity(progress, a);
          return (
            <div
              key={i}
              className={`sh-act${a.dark ? " sh-act--dark" : ""}${a.spiral ? " sh-act--spiral" : ""}`}
              style={{
                opacity: o,
                transform: `translate(-50%, calc(-50% + ${(1 - o) * 14}px))`,
                pointerEvents: o > 0.6 ? "auto" : "none",
              }}
              aria-hidden={o < 0.5}
            >
              {a.kicker && <p className="sh-kicker">{a.kicker}</p>}
              {a.brand ? (
                <h1 className="sh-brand">{a.title}</h1>
              ) : (
                <h2 className="sh-title">{a.title}</h2>
              )}
              <p className="sh-sub">{a.sub}</p>
            </div>
          );
        })}

        {/* progress rail */}
        <div className="sh-rail" aria-hidden>
          <div className="sh-rail__fill" style={{ height: `${progress * 100}%` }} />
        </div>

        {/* scroll hint (fades after start) */}
        <div className="sh-hint sh-hint--dark" style={{ opacity: progress < 0.04 ? 1 : 0 }}>
          <span>Scroll to unwind</span>
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
      .sh-track { position: relative; background:#05060c; }
      .sh-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden;
        background:#05060c; display:flex; align-items:center; justify-content:center; }
      .sh-canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
      .sh-static { position: relative; height:100vh; overflow:hidden; background:#05060c;
        display:flex; align-items:center; justify-content:center; }

      .sh-act { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
        width:min(720px,86vw); text-align:center; color:#fff; z-index:3;
        transition: opacity .25s ease; will-change:opacity,transform; }
      .sh-overlay { position:relative; z-index:3; text-align:center; color:#2a2118;
        width:min(720px,86vw); }
      .sh-overlay .sh-kicker, .sh-overlay .sh-brand, .sh-overlay .sh-sub,
      .sh-act--dark .sh-kicker, .sh-act--dark .sh-brand, .sh-act--dark .sh-sub {
        text-shadow:0 2px 24px rgba(255,255,255,.55); }
      .sh-act--dark { color:#2a2118; }
      /* headings track the spiral's current colour (--spiral-color, set on .sh-sticky) */
      .sh-act--spiral .sh-title, .sh-act--spiral .sh-kicker {
        color: var(--spiral-color, #fff); transition: color .4s ease; }
      .sh-overlay .sh-cta { background:#2a2118; color:#f6efe6; }
      .sh-kicker { font-family: var(--font-space, system-ui); text-transform:uppercase;
        letter-spacing:.28em; font-size:.72rem; font-weight:500; opacity:.8; margin:0 0 1rem;
        text-shadow:0 2px 20px rgba(0,0,0,.5); }
      .sh-brand { font-family: var(--font-instrument, Georgia, serif); font-weight:400;
        font-size: clamp(4rem, 13vw, 9rem); line-height:.95; margin:0;
        text-shadow:0 4px 40px rgba(0,0,0,.55); }
      .sh-title { font-family: var(--font-instrument, Georgia, serif); font-weight:400;
        font-style:italic; font-size: clamp(2.4rem, 6.2vw, 4.6rem); line-height:1.02; margin:0;
        text-shadow:0 4px 40px rgba(0,0,0,.6); }
      .sh-sub { font-family: var(--font-space, system-ui); font-weight:300;
        font-size: clamp(1rem, 1.5vw, 1.2rem); line-height:1.55; margin:1.1rem auto 0;
        max-width:46ch; opacity:.92; text-shadow:0 2px 24px rgba(0,0,0,.6); }
      .sh-cta { display:inline-block; margin-top:2rem; padding:.95rem 2rem; border-radius:100px;
        background:#fff; color:#0b0b0f; font-family:var(--font-space,system-ui); font-weight:600;
        font-size:.95rem; text-decoration:none; transition:transform .2s, box-shadow .2s; }
      .sh-cta:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(0,0,0,.4); }

      .sh-rail { position:absolute; right:26px; top:50%; transform:translateY(-50%);
        width:2px; height:34vh; background:rgba(255,255,255,.16); border-radius:2px; z-index:3; }
      .sh-rail__fill { width:100%; background:#fff; border-radius:2px; }

      .sh-hint { position:absolute; left:50%; bottom:34px; transform:translateX(-50%);
        display:flex; flex-direction:column; align-items:center; gap:.6rem; color:#fff; z-index:3;
        transition:opacity .4s ease; }
      .sh-hint span { font-family:var(--font-space,system-ui); font-size:.7rem;
        letter-spacing:.24em; text-transform:uppercase; opacity:.8; }
      .sh-hint__line { width:1px; height:40px; background:linear-gradient(#fff,transparent);
        animation: sh-pulse 1.8s ease-in-out infinite; }
      @keyframes sh-pulse { 0%,100%{opacity:.3;transform:scaleY(.6)} 50%{opacity:1;transform:scaleY(1)} }
      .sh-hint--dark { color:#2a2118; }
      .sh-hint--dark .sh-hint__line { background:linear-gradient(#2a2118,transparent); }

      .sh-loader { position:absolute; inset:0; z-index:4; display:flex; align-items:center;
        justify-content:center; color:#cfd6e2; background:#05060c;
        font-family:var(--font-space,system-ui); font-size:.85rem; letter-spacing:.06em; }

      @media (max-width:720px){ .sh-rail{ display:none } }
    `}</style>
  );
}
