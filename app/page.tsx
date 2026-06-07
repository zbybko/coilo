import type { CSSProperties } from "react";

const SHOPIFY_STORE = "coilo.myshopify.com";

const colors = [
  {
    name: "Cyan",
    tone: "Electric blue",
    image: "/media/cyan.png",
    accent: "#08a6ff",
    description: "A saturated blue built for desks, gaming shelves, and crisp studio spaces.",
    variantId: "61987185787210",
  },
  {
    name: "Sakura",
    tone: "Soft pink",
    image: "/media/sakura.webp",
    accent: "#ff7da6",
    description: "A bright floral pink that turns favorite books into a soft display moment.",
    variantId: "62010088554826",
  },
  {
    name: "Cherry",
    tone: "Deep red",
    image: "/media/cherry.png",
    accent: "#b80f2d",
    description: "A richer red for bold shelves, editorial stacks, and warmer interiors.",
    variantId: "62010088587594",
  },
  {
    name: "Sunflower",
    tone: "Warm yellow",
    image: "/media/sunflower.png",
    accent: "#f2b600",
    description: "A sunny yellow that makes the spiral feel like a sculptural accent piece.",
    variantId: "62010088620362",
  },
  {
    name: "Rosé",
    tone: "Soft pink",
    image: "/media/pink-spiral.png",
    accent: "#f4a0b5",
    description: "A delicate rose tone that brings warmth and softness to any shelf or desk.",
    variantId: "62010091077962",
  },
];

function cartUrl(variantId: string) {
  return `https://${SHOPIFY_STORE}/cart/${variantId}:1`;
}

const specs = [
  "3D printed PLA",
  "245 x 178 x 192 mm",
  "Ships from Germany",
];

export default async function Home() {
  const productTitle = "Modern Spiral Bookshelf";
  const productSpecs = [
    ...specs,
    "€39",
  ];
  const defaultBuyUrl = cartUrl(colors[0].variantId);

  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__media" aria-hidden="true">
          <img
            src="/media/cyan.png"
            alt=""
            className="hero__image"
          />
          <div className="hero__shade" />
        </div>

        <header className="topbar">
          <a className="topbar__brand" href="#top" aria-label="Coilo home">
            <img
              src="/media/coilo-logo.png"
              alt=""
              className="topbar__logo"
            />
            <span>Coilo</span>
          </a>
          <nav className="topbar__nav" aria-label="Primary navigation">
            <a href="#colors">Colors</a>
            <a href="#details">Details</a>
            <a href={defaultBuyUrl}>Shopify checkout</a>
          </nav>
        </header>

        <div className="hero__content" id="top">
          <p className="hero__brand">Coilo</p>
          <h1 id="hero-title">Modern Spiral Bookshelf</h1>
          <p className="hero__copy">
            A sculptural 3D printed holder for books, magazines, and the color
            story you want on the shelf.
          </p>
          <div className="hero__actions" aria-label="Purchase actions">
            <a className="button button--primary" href={defaultBuyUrl}>
              Buy with Shopify
            </a>
            <a className="button button--secondary" href="#colors">
              View colors
            </a>
          </div>
        </div>
      </section>

      <section className="intro-section" aria-labelledby="intro-title">
        <div className="intro-section__copy">
          <h2 id="intro-title">A bookshelf that behaves like an object.</h2>
          <p>
            The continuous spiral holds printed pieces upright while giving the
            shelf a clean, intentional line from every angle.
          </p>
        </div>
        <dl className="spec-strip" aria-label="Product specifications">
          {productSpecs.map((spec) => (
            <div key={spec}>
              <dt>{spec.includes("€") || spec.includes("$") ? "Price" : "Spec"}</dt>
              <dd>{spec}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="video-section" aria-label="Coilo product motion preview">
        <video
          className="product-video"
          src="/media/coilo-motion.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/pink-spiral.png"
        />
      </section>

      <section className="colors-section" id="colors" aria-labelledby="colors-title">
        <div className="section-heading">
          <h2 id="colors-title">Choose the room&apos;s accent.</h2>
          <p>
            Four vivid finishes, each with the same smooth spiral silhouette and
            compact footprint.
          </p>
        </div>

        <div className="color-gallery">
          {colors.map((color) => (
            <a
              className="color-panel"
              href={cartUrl(color.variantId)}
              key={color.name}
              style={{ "--accent": color.accent } as CSSProperties}
            >
              <div className="color-panel__image-wrap">
                <img
                  src={color.image}
                  alt={`${color.name} Coilo spiral bookshelf`}
                  className="color-panel__image"
                />
              </div>
              <div className="color-panel__body">
                <p>{color.tone}</p>
                <h3>{color.name}</h3>
                <span>{color.description}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="details-section" id="details" aria-labelledby="details-title">
        <div className="details-section__image">
          <img
            src="/media/pink-spiral.png"
            alt="Pink Coilo spiral bookshelf holding editorial magazines"
          />
        </div>
        <div className="details-section__copy">
          <h2 id="details-title">Printed for daily display.</h2>
          <p>
            Made from PLA with a smooth looped profile, {productTitle} keeps favorite
            books, magazines, notebooks, and art catalogs visible instead of
            stacked away.
          </p>
          <ul>
            <li>Compact footprint for desks, shelves, and sideboards.</li>
            <li>Lightweight 3D printed construction with a bold sculptural shape.</li>
            <li>Headless Shopify checkout keeps payment and order handling native.</li>
          </ul>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-title">
        <img
          src="/media/coilo-logo.png"
          alt=""
          className="final-cta__logo"
        />
        <h2 id="final-title">Bring the spiral to your shelf.</h2>
        <p>
          Order {productTitle} through Shopify checkout and choose the finish
          that fits your shelf.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href={defaultBuyUrl}>
            Buy with Shopify
          </a>
          <a className="button button--secondary button--dark" href="#colors">
            Pick a color
          </a>
        </div>
      </section>
    </main>
  );
}
