"use client";

import { useState, useEffect, useRef, useCallback, CSSProperties } from "react";

// ── Data ─────────────────────────────────────────────
const SHOPIFY_STORE = "coilo.myshopify.com";
const ETSY_URL = "https://www.etsy.com/shop/Coilo";

const PRODUCTS = [
  { name: "Cyan", slug: "cyan", tone: "Electric blue", image: "/media/cyan.png", accent: "#08a6ff",
    description: "A saturated blue built for desks, gaming shelves, and crisp studio spaces.",
    variantId: "61987185787210" },
  { name: "Sakura", slug: "sakura", tone: "Soft pink", image: "/media/sakura.webp", accent: "#ff7da6",
    description: "A bright floral pink that turns favorite books into a soft display moment.",
    variantId: "62010088554826" },
  { name: "Cherry", slug: "cherry", tone: "Deep red", image: "/media/cherry.png", accent: "#b80f2d",
    description: "A richer red for bold shelves, editorial stacks, and warmer interiors.",
    variantId: "62010088587594" },
  { name: "Sunflower", slug: "sunflower", tone: "Warm yellow", image: "/media/sunflower.png", accent: "#f2b600",
    description: "A sunny yellow that makes the spiral feel like a sculptural accent piece.",
    variantId: "62010088620362" },
  { name: "Rosé", slug: "rose", tone: "Soft pink", image: "/media/pink-spiral.png", accent: "#f4a0b5",
    description: "A delicate rose tone that brings warmth and softness to any shelf or desk.",
    variantId: "62010091077962" },
];

function cartUrl(variantId: string) {
  return `https://${SHOPIFY_STORE}/cart/${variantId}:1`;
}

// ── Hooks ─────────────────────────────────────────────
function useMouse() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return pos;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

function useInView(opts: { threshold?: number[]; rootMargin?: string } = {}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fallback = setTimeout(() => setInView(true), 1200);
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.unobserve(el); clearTimeout(fallback); }
    }, { threshold: opts.threshold || [0, 0.05, 0.1, 0.25], rootMargin: opts.rootMargin || "200px 0px" });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return { ref, inView };
}

function useSmoothXY(target: { x: number; y: number }, speed = 0.06) {
  const smoothRef = useRef({ x: target.x, y: target.y });
  const [val, setVal] = useState(target);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      smoothRef.current.x += (target.x - smoothRef.current.x) * speed;
      smoothRef.current.y += (target.y - smoothRef.current.y) * speed;
      const dx = Math.abs(smoothRef.current.x - target.x);
      const dy = Math.abs(smoothRef.current.y - target.y);
      setVal({ x: smoothRef.current.x, y: smoothRef.current.y });
      if (dx > 0.5 || dy > 0.5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target.x, target.y, speed]);
  return val;
}

// ── Animation Components ──────────────────────────────
function SplitText({ children, className = "", delay = 0, tag = "div", stagger = 60 }:
  { children: string; className?: string; delay?: number; tag?: string; stagger?: number }) {
  const { ref, inView } = useInView();
  const Tag = tag as keyof JSX.IntrinsicElements;
  const words = children.split(/\s+/);
  return (
    <Tag ref={ref as never} className={`split-text ${className} ${inView ? "split-text--visible" : ""}`}>
      {words.map((word, i) => (
        <span key={i} className="split-word"
              style={{ transitionDelay: `${delay + i * stagger}ms` }}>
          {word}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

function SplitChars({ children, className = "", delay = 0, stagger = 30 }:
  { children: string; className?: string; delay?: number; stagger?: number }) {
  const { ref, inView } = useInView();
  const chars = children.split("");
  return (
    <span ref={ref as never} className={`split-chars ${className} ${inView ? "split-chars--visible" : ""}`}>
      {chars.map((ch, i) => (
        <span key={i} className="split-char"
              style={{ transitionDelay: `${delay + i * stagger}ms` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

function RevealBlock({ children, className = "", delay = 0, direction = "up", style = {} }:
  { children: React.ReactNode; className?: string; delay?: number; direction?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200) { setTimeout(() => setVisible(true), 50); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold: 0.05, rootMargin: "200px 0px" });
    obs.observe(el);
    const fb = setTimeout(() => setVisible(true), 800);
    return () => { obs.disconnect(); clearTimeout(fb); };
  }, []);
  return (
    <div ref={ref} className={`reveal-block ${visible ? "reveal-block--visible" : ""} ${className}`}
         data-dir={direction} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function MagneticWrap({ children, strength = 0.3, className = "" }:
  { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const handleMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength });
  }, [strength]);
  const handleLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);
  return (
    <div ref={ref} className={`magnetic ${className}`}
         onMouseMove={handleMove} onMouseLeave={handleLeave}
         style={{
           transform: `translate(${offset.x}px, ${offset.y}px)`,
           transition: offset.x === 0 ? "transform 0.5s cubic-bezier(0.16,1,0.3,1)" : "none"
         }}>
      {children}
    </div>
  );
}

function CursorGlow({ color = "#08a6ff" }: { color?: string }) {
  const mouse = useMouse();
  const smooth = useSmoothXY(mouse, 0.04);
  return (
    <div className="cursor-glow"
         style={{
           background: `radial-gradient(circle 350px, ${color}15, transparent)`,
           left: smooth.x, top: smooth.y,
           transform: "translate(-50%, -50%)",
         }} />
  );
}

function CountUp({ end, prefix = "", suffix = "", duration = 1800 }:
  { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(end * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);
  return <span ref={ref as never}>{prefix}{val}{suffix}</span>;
}

function HorizontalScroll({ children, className = "" }:
  { children: React.ReactNode; className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    const x = "touches" in e ? e.touches[0].pageX : e.pageX;
    startX.current = x;
    scrollLeft.current = trackRef.current!.scrollLeft;
  };
  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const x = "touches" in e ? e.touches[0].pageX : e.pageX;
    trackRef.current!.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const onUp = () => setDragging(false);
  return (
    <div className={`hscroll ${className} ${isDragging ? "hscroll--dragging" : ""}`}
         ref={trackRef}
         onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
         onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>
      {children}
    </div>
  );
}

// ── Sections ──────────────────────────────────────────
function NavBar() {
  const scrollY = useScrollY();
  const scrolled = scrollY > 60;
  const [menuOpen, setMenu] = useState(false);
  return (
    <nav className={`c-nav ${scrolled ? "c-nav--solid" : ""}`}>
      <MagneticWrap strength={0.15}>
        <a href="#top" className="c-nav__brand">
          <img src="/media/coilo-logo.png" alt="Coilo" className="c-nav__logo-img" />
          <span>Coilo</span>
        </a>
      </MagneticWrap>
      <div className={`c-nav__links ${menuOpen ? "open" : ""}`}>
        <a href="#colors" onClick={() => setMenu(false)}>Colors</a>
        <a href="#details" onClick={() => setMenu(false)}>Details</a>
        <a href="#configurator" onClick={() => setMenu(false)}>Configure</a>
        <MagneticWrap strength={0.2}>
          <a href={ETSY_URL} target="_blank" rel="noopener" className="c-nav__cta">
            Shop on Etsy
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </a>
        </MagneticWrap>
      </div>
      <button className={`c-nav__burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenu(!menuOpen)} aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
  );
}

function HeroSection() {
  const [active, setActive] = useState(0);
  const mouse = useMouse();
  const scrollY = useScrollY();
  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % PRODUCTS.length), 5000);
    return () => clearInterval(id);
  }, []);
  const current = PRODUCTS[active];
  const imgX = typeof window !== "undefined" ? ((mouse.x / window.innerWidth) - 0.5) * -20 : 0;
  const imgY = typeof window !== "undefined" ? ((mouse.y / window.innerHeight) - 0.5) * -15 : 0;
  const textY = scrollY * 0.35;
  const imgParallaxY = scrollY * 0.15;
  return (
    <section className="c-hero" id="top">
      <CursorGlow color={current.accent} />
      <div className="c-hero__media" style={{ transform: `translateY(${imgParallaxY}px)` }}>
        {PRODUCTS.map((p, i) => (
          <img key={p.name} src={p.image} alt=""
               className={`c-hero__bg ${i === active ? "active" : ""}`}
               style={{ transform: `translate(${imgX}px, ${imgY}px) scale(1.1)` }} />
        ))}
        <div className="c-hero__overlay"
             style={{ "--overlay-color": current.accent } as CSSProperties} />
      </div>
      <div className="c-hero__color-indicator">
        {PRODUCTS.map((p, i) => (
          <button key={p.name} className={`c-hero__dot ${i === active ? "active" : ""}`}
                  style={{ "--dot-color": p.accent } as CSSProperties}
                  onClick={() => setActive(i)} aria-label={p.name}>
            {i === active && <span className="c-hero__dot-ring" style={{ borderColor: p.accent }} />}
          </button>
        ))}
      </div>
      <div className="c-hero__content" style={{ transform: `translateY(${textY}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
        <div className="c-hero__eyebrow">
          <SplitChars delay={200} stagger={35}>3D Printed Design Object</SplitChars>
        </div>
        <h1 className="c-hero__title">
          <span className="c-hero__brand-text">
            <SplitChars delay={400} stagger={50}>Coilo</SplitChars>
          </span>
          <SplitText delay={700} stagger={80} tag="span" className="c-hero__subtitle-text">
            The Spiral Bookshelf
          </SplitText>
        </h1>
        <RevealBlock delay={1100}>
          <p className="c-hero__desc">
            A sculptural holder for books, magazines, and the color story you want on your shelf.
          </p>
        </RevealBlock>
        <RevealBlock delay={1300}>
          <div className="c-hero__actions">
            <MagneticWrap strength={0.25}>
              <a href={cartUrl(current.variantId)} className="btn btn--primary btn--glow"
                 style={{ "--btn-glow": current.accent } as CSSProperties}>
                Shop Now
              </a>
            </MagneticWrap>
            <MagneticWrap strength={0.25}>
              <a href="#colors" className="btn btn--outline">Explore Colors</a>
            </MagneticWrap>
          </div>
        </RevealBlock>
      </div>
      <div className="c-hero__scroll">
        <span>Scroll</span>
        <div className="c-hero__scroll-line" />
      </div>
    </section>
  );
}

function IntroStrip() {
  return (
    <section className="c-intro">
      <div className="c-intro__copy">
        <SplitText tag="h2" delay={0} stagger={60} className="c-intro__heading">
          A bookshelf that behaves like an object.
        </SplitText>
        <RevealBlock delay={200}>
          <p>The continuous spiral holds printed pieces upright while giving the shelf
             a clean, intentional line from every angle.</p>
        </RevealBlock>
      </div>
      <div className="c-intro__specs">
        <RevealBlock delay={0} className="c-intro__spec">
          <span className="c-intro__spec-label">Material</span>
          <span className="c-intro__spec-value">3D printed PLA</span>
        </RevealBlock>
        <RevealBlock delay={100} className="c-intro__spec">
          <span className="c-intro__spec-label">Dimensions</span>
          <span className="c-intro__spec-value">
            <CountUp end={245} />×<CountUp end={178} />×<CountUp end={192} suffix=" mm" />
          </span>
        </RevealBlock>
        <RevealBlock delay={200} className="c-intro__spec">
          <span className="c-intro__spec-label">Shipping</span>
          <span className="c-intro__spec-value">Ships from Germany</span>
        </RevealBlock>
        <RevealBlock delay={300} className="c-intro__spec">
          <span className="c-intro__spec-label">Price</span>
          <span className="c-intro__spec-value">€<CountUp end={39} /></span>
        </RevealBlock>
      </div>
    </section>
  );
}

function ProductGallery() {
  return (
    <section className="c-gallery" id="colors">
      <RevealBlock className="c-gallery__header">
        <SplitText tag="h2" stagger={70}>Five colors. One iconic shape.</SplitText>
        <RevealBlock delay={300}>
          <p>Each finish is matched to a mood — pick the one that fits your shelf.</p>
        </RevealBlock>
      </RevealBlock>
      <HorizontalScroll className="c-gallery__track">
        {PRODUCTS.map((p) => (
          <div key={p.name} className="c-gallery__card"
               style={{ "--card-accent": p.accent } as CSSProperties}>
            <a href={cartUrl(p.variantId)} className="c-gallery__link">
              <div className="c-gallery__img-wrap">
                <img src={p.image} alt={`${p.name} Coilo bookshelf`}
                     className="c-gallery__img" loading="lazy" />
                <div className="c-gallery__shimmer" />
                <div className="c-gallery__hover">
                  <MagneticWrap strength={0.3}>
                    <span className="c-gallery__hover-btn">Buy {p.name}</span>
                  </MagneticWrap>
                </div>
              </div>
              <div className="c-gallery__body">
                <span className="c-gallery__tone" style={{ color: p.accent }}>{p.tone}</span>
                <h3 className="c-gallery__name">{p.name}</h3>
                <span className="c-gallery__price">€39</span>
              </div>
            </a>
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}

function ColorConfigurator() {
  const [sel, setSel] = useState(0);
  const [prevSel, setPrev] = useState(0);
  const product = PRODUCTS[sel];
  const handleSelect = (i: number) => {
    if (i !== sel) { setPrev(sel); setSel(i); }
  };
  return (
    <section className="c-config" id="configurator"
             style={{ "--config-accent": product.accent } as CSSProperties}>
      <div className="c-config__content">
        <RevealBlock>
          <p className="c-config__eyebrow">
            <SplitChars stagger={25}>Color Configurator</SplitChars>
          </p>
          <SplitText tag="h2" className="c-config__title" stagger={70}>Find your color.</SplitText>
        </RevealBlock>
        <div className="c-config__swatches">
          {PRODUCTS.map((p, i) => (
            <MagneticWrap key={p.name} strength={0.2}>
              <button className={`c-config__swatch ${i === sel ? "active" : ""}`}
                      onClick={() => handleSelect(i)} aria-label={p.name}>
                <span className="c-config__swatch-dot" style={{ background: p.accent }} />
                <span className="c-config__swatch-name">{p.name}</span>
              </button>
            </MagneticWrap>
          ))}
        </div>
        <div className="c-config__info" key={sel}>
          <span className="c-config__tone" style={{ color: product.accent }}>{product.tone}</span>
          <h3 className="c-config__color-name anim-in">{product.name}</h3>
          <p className="c-config__desc anim-in" style={{ animationDelay: "80ms" }}>{product.description}</p>
          <div className="c-config__buy-row anim-in" style={{ animationDelay: "160ms" }}>
            <span className="c-config__price">€39</span>
            <MagneticWrap strength={0.25}>
              <a href={cartUrl(product.variantId)}
                 className="btn btn--accent"
                 style={{ background: product.accent, color: product.accent === "#f2b600" ? "#111" : "#fff" }}>
                Buy Now
              </a>
            </MagneticWrap>
          </div>
        </div>
      </div>
      <div className="c-config__display">
        <div className="c-config__glow"
             style={{ background: product.accent, opacity: 0.12, filter: "blur(100px)" }} />
        {PRODUCTS.map((p, i) => (
          <img key={p.name} src={p.image} alt={p.name}
               className={`c-config__product-img ${i === sel ? "active" : i === prevSel ? "prev" : ""}`}
               loading="lazy" />
        ))}
      </div>
    </section>
  );
}

function DetailsSection() {
  const features = [
    { icon: "◎", title: "3D Printed in PLA", desc: "Lightweight, durable and eco-friendly material with a smooth finish." },
    { icon: "◉", title: "Sculptural Spiral Design", desc: "Smooth curves that hold books beautifully from every angle." },
    { icon: "□", title: "Compact Footprint", desc: "245 × 178 × 192 mm — fits desks, shelves, and sideboards." },
    { icon: "→", title: "Ships from Germany", desc: "Carefully packed and shipped across Europe. Fast and reliable." },
  ];
  return (
    <section className="c-details" id="details">
      <div className="c-details__image">
        <img src="/media/pink-spiral.png" alt="Rosé Coilo bookshelf" loading="lazy" />
      </div>
      <div className="c-details__copy">
        <RevealBlock>
          <p className="c-details__eyebrow">
            <SplitChars stagger={30}>Crafted with Care</SplitChars>
          </p>
          <SplitText tag="h2" stagger={70}>Printed for daily display.</SplitText>
        </RevealBlock>
        <RevealBlock delay={200}>
          <p className="c-details__lead">
            Made from PLA with a smooth looped profile, the spiral keeps favorite
            books, magazines, and art catalogs visible — not stacked away.
          </p>
        </RevealBlock>
        <ul className="c-details__features">
          {features.map((f, i) => (
            <RevealBlock key={f.title} delay={300 + i * 120} direction="left">
              <li className="c-details__feature">
                <span className="c-details__feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </li>
            </RevealBlock>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EtsyBanner() {
  return (
    <section className="c-etsy">
      <RevealBlock className="c-etsy__inner" direction="scale">
        <div className="c-etsy__text">
          <SplitText tag="h3" stagger={60}>Also available on Etsy</SplitText>
          <p>Support a small business. Secure checkout. 30-day returns.</p>
        </div>
        <MagneticWrap strength={0.2}>
          <a href={ETSY_URL} target="_blank" rel="noopener" className="btn btn--etsy">
            Visit our Etsy Shop
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </a>
        </MagneticWrap>
      </RevealBlock>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="c-footer">
      <div className="c-footer__inner">
        <img src="/media/coilo-logo.png" alt="" className="c-footer__logo" />
        <SplitText tag="h2" stagger={70}>Bring the spiral to your shelf.</SplitText>
        <RevealBlock delay={300}>
          <p>Order the Modern Spiral Bookshelf and choose the finish that fits your space.</p>
        </RevealBlock>
        <RevealBlock delay={500}>
          <div className="c-footer__actions">
            <MagneticWrap strength={0.25}>
              <a href={cartUrl(PRODUCTS[0].variantId)} className="btn btn--primary">Shop Now</a>
            </MagneticWrap>
            <MagneticWrap strength={0.25}>
              <a href="#configurator" className="btn btn--outline btn--dark">Pick a Color</a>
            </MagneticWrap>
          </div>
        </RevealBlock>
      </div>
      <footer className="c-footer__bar">
        <span>© 2026 Coilo</span>
        <div className="c-footer__links">
          <a href="#colors">Colors</a>
          <a href="#details">Details</a>
          <a href={ETSY_URL} target="_blank" rel="noopener">Etsy</a>
        </div>
      </footer>
    </section>
  );
}

// ── App ────────────────────────────────────────────────
export default function Home() {
  return (
    <div>
      <NavBar />
      <HeroSection />
      <IntroStrip />
      <ProductGallery />
      <ColorConfigurator />
      <DetailsSection />
      <EtsyBanner />
      <FooterCTA />
    </div>
  );
}
