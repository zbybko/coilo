"use client";

import { useState, useEffect, useRef } from "react";

// relative luminance from a computed "rgb(a)" string
function bgLuminance(c: string): number {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return 0;
  const parts = m[1].split(",").map((s) => parseFloat(s));
  const [r, g, b] = parts;
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

// Shared transparent header used on every page (logo-only, no dark background).
// Text/icon colour flips dark/light based on the background sitting under it.
export default function SiteNav({ active }: { active?: "colors" | "about" }) {
  const [menuOpen, setMenu] = useState(false);
  const [onLight, setOnLight] = useState(!active); // home opens on the cream hero; sub-pages open dark
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const PROBE_Y = 30;
    const probe = () => {
      // 1) deterministic: which tagged section sits under the nav line?
      const tagged = document.querySelectorAll("[data-nav-theme]");
      for (const el of Array.from(tagged)) {
        const r = el.getBoundingClientRect();
        if (r.top <= PROBE_Y && r.bottom > PROBE_Y) {
          setOnLight(el.getAttribute("data-nav-theme") === "light");
          return;
        }
      }
      // 2) hero canvas: sample the actual rendered pixel (cream → colour flythrough)
      const canvas = document.querySelector(".sh-canvas") as HTMLCanvasElement | null;
      if (canvas) {
        const r = canvas.getBoundingClientRect();
        if (r.top <= PROBE_Y && r.bottom > PROBE_Y) {
          try {
            const ctx = canvas.getContext("2d");
            const sx = canvas.width / canvas.clientWidth;
            const x = Math.round((window.innerWidth / 2) * sx);
            const p = ctx!.getImageData(x, Math.round(PROBE_Y * sx), 1, 1).data;
            setOnLight(p[3] < 20 ? true : bgLuminance(`rgb(${p[0]},${p[1]},${p[2]})`) > 0.5);
            return;
          } catch { /* tainted/not-ready canvas */ }
          setOnLight(true); // cream hero before first frame paints
          return;
        }
      }
      setOnLight(false);
    };
    let scheduled = false;
    const onScroll = () => { if (scheduled) return; scheduled = true; probe(); scheduled = false; };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // a couple of delayed probes so it settles after fonts/layout/canvas paint
    probe();
    const t1 = setTimeout(probe, 300);
    const t2 = setTimeout(probe, 1200);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t1); clearTimeout(t2);
    };
  }, []);

  return (
    <nav ref={navRef} className={`c-nav ${onLight ? "c-nav--light" : ""}`}>
      <a href="/" className="c-nav__brand" aria-label="Coilo home">
        <img src="/media/coilo-logo.png" alt="Coilo" className="c-nav__logo-img" />
      </a>
      <div className={`c-nav__links ${menuOpen ? "open" : ""}`}>
        <a href="/colors" className={active === "colors" ? "active" : ""} onClick={() => setMenu(false)}>Colors</a>
        <a href="/about" className={active === "about" ? "active" : ""} onClick={() => setMenu(false)}>How It&apos;s Made</a>
        <a href="/#configurator" className="c-nav__cta" onClick={() => setMenu(false)}>
          Pick a Color
        </a>
      </div>
      <button className={`c-nav__burger ${menuOpen ? "open" : ""}`} onClick={() => setMenu(!menuOpen)} aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}
