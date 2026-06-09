"use client";

import { useState } from "react";

const ETSY_URL = "https://www.etsy.com/shop/Coilo";

// Shared transparent header used on every page (logo-only, no dark background).
export default function SiteNav({ active }: { active?: "colors" | "about" }) {
  const [menuOpen, setMenu] = useState(false);
  return (
    <nav className="c-nav">
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
