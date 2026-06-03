import type { CSSProperties } from "react";

const productUrl =
  "https://www.etsy.com/de/listing/4481551698/modern-spiral-bookshelf-3d-printed";
const shopUrl = "https://www.etsy.com/shop/Coilo";

const colors = [
  {
    name: "Cyan",
    tone: "Electric blue",
    image: "/media/cyan.png",
    accent: "#08a6ff",
    description: "A saturated blue built for desks, gaming shelves, and crisp studio spaces.",
  },
  {
    name: "Sakura",
    tone: "Soft pink",
    image: "/media/sakura.webp",
    accent: "#ff7da6",
    description: "A bright floral pink that turns favorite books into a soft display moment.",
  },
  {
    name: "Cherry",
    tone: "Deep red",
    image: "/media/cherry.png",
    accent: "#b80f2d",
    description: "A richer red for bold shelves, editorial stacks, and warmer interiors.",
  },
  {
    name: "Sunflower",
    tone: "Warm yellow",
    image: "/media/sunflower.png",
    accent: "#f2b600",
    description: "A sunny yellow that makes the spiral feel like a sculptural accent piece.",
  },
];

const specs = [
  "3D printed PLA",
  "245 x 178 x 192 mm",
  "Ships from Germany",
  "€39",
];

export default function Home() {
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
            <a href={shopUrl} target="_blank" rel="noreferrer">
              Etsy shop
            </a>
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
            <a className="button button--primary" href={productUrl} target="_blank" rel="noreferrer">
              Buy on Etsy
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
          {specs.map((spec) => (
            <div key={spec}>
              <dt>{spec.includes("€") ? "Price" : "Spec"}</dt>
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
              href={productUrl}
              target="_blank"
              rel="noreferrer"
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
            Made from PLA with a smooth looped profile, Coilo keeps favorite
            books, magazines, notebooks, and art catalogs visible instead of
            stacked away.
          </p>
          <ul>
            <li>Compact footprint for desks, shelves, and sideboards.</li>
            <li>Lightweight 3D printed construction with a bold sculptural shape.</li>
            <li>Available through Etsy with a 30-day return window.</li>
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
          Order the Modern Spiral Bookshelf directly from Coilo on Etsy, or
          visit the shop to see the full color set.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href={productUrl} target="_blank" rel="noreferrer">
            Buy on Etsy
          </a>
          <a className="button button--secondary button--dark" href={shopUrl} target="_blank" rel="noreferrer">
            Visit shop
          </a>
        </div>
      </section>
    </main>
  );
}
