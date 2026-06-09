"use client";

import { useState, useEffect, useRef } from "react";

const ETSY_URL = "https://www.etsy.com/shop/Coilo";

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
  const [onLight, setOnLight] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let raf = 0;
    const probe = () => {
      raf = 0;
      const x = Math.round(window.innerWidth / 2);
      const y = 26;
      const prevPE = nav.style.pointerEvents;
      nav.style.pointerEvents = "none"; // let elementFromPoint see behind the nav
      const node = document.elementFromPoint(x, y) as HTMLElement | null;
      nav.style.pointerEvents = prevPE;
      // 1) explicit tag wins (for gradient/image backgrounds we can't read)
      const themed = node?.closest?.("[data-nav-theme]") as HTMLElement | null;
      if (themed) { setOnLight(themed.getAttribute("data-nav-theme") === "light"); return; }
      // 2) fallback: nearest opaque background-colour luminance
      let n: HTMLElement | null = node;
      let bg = "";
      while (n) {
        const c = getComputedStyle(n).backgroundColor;
        if (c && c !== "transparent" && !/,\s*0\)\s*$/.test(c)) { bg = c; break; }
        n = n.parentElement;
      }
      setOnLight(bg ? bgLuminance(bg) > 0.55 : false);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(probe); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // a couple of delayed probes so it settles after fonts/layout/canvas paint
    probe();
    const t1 = setTimeout(probe, 250);
    const t2 = setTimeout(probe, 1000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t1); clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
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
        <a href={ETSY_URL} target="_blank" rel="noopener" className="c-nav__cta" onClick={() => setMenu(false)}>
          Shop on Etsy
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
        </a>
      </div>
      <button className={`c-nav__burger ${menuOpen ? "open" : ""}`} onClick={() => setMenu(!menuOpen)} aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}
