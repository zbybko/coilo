"use client";

// Lightweight client-side EN/DE localisation.
// Language: saved choice → browser language → English.
// The dictionary object is fully typed from the English source so a missing
// German key is a compile error, not a silent fallback.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const EN = {
  nav: {
    colors: "Colors",
    about: "How It's Made",
    cta: "Pick a Color",
  },
  hero: {
    kicker: "3D-printed design object",
    sub1: "Where design unwinds.",
    title2: "One continuous line",
    sub2: "A single sweeping coil holds your books upright — structure becomes ornament.",
    title3: "Printed, not manufactured",
    sub3: "Premium PLA, precision FDM, finished by hand. Made in Germany.",
    title4: "Five finishes. One icon.",
    cta: "Choose your colour",
    scroll: "Scroll to unwind",
  },
  intro: {
    title: "A bookshelf that behaves like an object.",
    text: "The continuous spiral holds printed pieces upright while giving the shelf a clean, intentional line from every angle.",
    material: "Material",
    materialVal: "3D printed PLA",
    dimensions: "Dimensions",
    shipping: "Shipping",
    shippingVal: "Ships from Germany",
    price: "Price",
  },
  config: {
    eyebrow: "Color Configurator",
    title: "Find your color.",
    buy: "Buy Now",
    soldOut: "Sold out",
    support: "Questions?",
  },
  colorsData: {
    sakura: {
      tone: "Soft pink",
      short: "A bright floral pink that turns favorite books into a soft display moment.",
      long: "A bright floral pink that turns favorite books into a soft display moment. Perfect for bedroom shelves and warm reading nooks.",
    },
    cyan: {
      tone: "Electric blue",
      short: "A saturated blue built for desks, gaming shelves, and crisp studio spaces.",
      long: "A saturated blue built for desks, gaming shelves, and crisp studio spaces. Cyan catches the eye without clashing with neutral interiors.",
    },
    cherry: {
      tone: "Deep red",
      short: "A richer red for bold shelves, editorial stacks, and warmer interiors.",
      long: "A richer red for bold shelves, editorial stacks, and warmer interiors. Cherry makes the spiral feel like a statement object.",
    },
    rose: {
      tone: "Soft rose",
      short: "A delicate rose tone that brings warmth and softness to any shelf or desk.",
      long: "A delicate rose tone that brings warmth and softness to any shelf or desk. Rosé is the quiet one — and often the first to sell out.",
    },
    sunflower: {
      tone: "Warm yellow",
      short: "A sunny yellow that makes the spiral feel like a sculptural accent piece.",
      long: "A sunny yellow that makes the spiral feel like a sculptural accent piece. Sunflower brightens any shelf and pairs well with wood tones.",
    },
  },
  details: {
    eyebrow: "Crafted with Care",
    title: "Printed for daily display.",
    lead: "Made from PLA with a smooth looped profile, the spiral keeps favorite books, magazines, and art catalogs visible — not stacked away.",
    f1t: "3D Printed in PLA",
    f1d: "Lightweight, durable and eco-friendly material with a smooth finish.",
    f2t: "Sculptural Spiral Design",
    f2d: "Smooth curves that hold books beautifully from every angle.",
    f3t: "Compact Footprint",
    f3d: "245 × 178 × 192 mm — fits desks, shelves, and sideboards.",
    f4t: "Ships from Germany",
    f4d: "Carefully packed and shipped across Europe. Fast and reliable.",
  },
  motion: {
    eyebrow: "See it in motion",
    title: "One continuous line, in every room.",
  },
  reviews: {
    eyebrow: "Reviews",
    title: "Loved on shelves worldwide.",
    caption: "5.0 ★ · verified Etsy buyers",
    buyer: "Verified buyer",
    readAll: "Read all reviews on Etsy →",
  },
  footer: {
    title1: "Bring the spiral",
    title2: "to your shelf.",
    text: "Order the Modern Spiral Bookshelf and choose the finish that fits your space.",
    pick: "Pick a Color",
    shop: "Shop Now",
    trust: "Trusted by buyers on Etsy · ★★★★★",
    home: "Home",
    legal: "Legal",
  },
  colorsPage: {
    material: "Material",
    weight: "Weight",
    dimensions: "Dimensions",
    finish: "Finish",
    finishVal: "Smooth matte",
  },
  about: {
    eyebrow: "How It's Made",
    h1a: "Printed with ",
    h1em: "precision",
    h1b: ",",
    h1c: "shaped by design.",
    heroText:
      "Every Coilo bookshelf is 3D-printed in Germany — one continuous spiral, no assembly, no waste.",
    tlTitle: "From file to shelf.",
    tlText: "The journey of a single Coilo takes about 18 hours — from digital model to finished product.",
    s1t: "Parametric modeling",
    s1d: "The spiral geometry is defined parametrically — wall thickness, pitch, and curvature are all tuned for strength and visual balance before any material is used.",
    s1l: "Software",
    s1v: "Custom parametric CAD pipeline",
    s2t: "Slicing & path planning",
    s2d: "The 3D model is sliced into thousands of layers, each 0.2 mm thin. The printer path is optimized to minimize seams and maximize surface smoothness.",
    s2l: "Layer height",
    s2v: "0.2 mm — ~900 layers per unit",
    s3t: "FDM printing",
    s3d: "Each unit is printed on a professional FDM machine using PLA filament. The continuous spiral form requires no supports — the geometry is self-supporting by design.",
    s3l: "Print time",
    s3v: "~16–18 hours per unit",
    s4t: "Post-processing",
    s4d: "After printing, each piece is inspected, cleaned, and lightly finished. No painting — the color runs through the entire material.",
    s5t: "Quality check & packing",
    s5d: "Every shelf passes a visual and structural inspection before being carefully packed in recycled cardboard and shipped from Germany.",
    s5l: "Shipping",
    s5v: "EU-wide, tracked & insured",
    tlapseEyebrow: "Printed, not manufactured",
    tlapsePlaceholder: "Print time-lapse — coming soon",
    matEyebrow: "Material",
    matTitle: "PLA — plant-based plastic.",
    matText:
      "Polylactic acid is derived from renewable resources like corn starch. It's rigid, lightweight, and has a smooth matte finish that feels premium to the touch.",
    weight: "Weight",
    dimensions: "Dimensions",
    finish: "Finish",
    finishVal: "Smooth matte",
    durability: "Durability",
    durabilityVal: "High rigidity",
    susTitle: "Made responsibly.",
    susText:
      "3D printing produces near-zero material waste. Each Coilo uses only the filament it needs — no molds, no offcuts, no overproduction.",
    pills: [
      "Zero-waste production",
      "Plant-based PLA",
      "No assembly needed",
      "Made to order",
      "Recycled packaging",
    ],
    ctaTitle: "See it in your color.",
    ctaText: "Five finishes, one sculptural form. Explore them all.",
    ctaExplore: "Explore Colors",
    ctaHome: "Back to Home",
  },
};

const DE: typeof EN = {
  nav: {
    colors: "Farben",
    about: "So entsteht's",
    cta: "Farbe wählen",
  },
  hero: {
    kicker: "3D-gedrucktes Designobjekt",
    sub1: "Wo Design sich entfaltet.",
    title2: "Eine durchgehende Linie",
    sub2: "Eine einzige geschwungene Spirale hält deine Bücher aufrecht — Struktur wird Ornament.",
    title3: "Gedruckt, nicht gefertigt",
    sub3: "Premium-PLA, präziser FDM-Druck, von Hand veredelt. Made in Germany.",
    title4: "Fünf Farben. Eine Ikone.",
    cta: "Wähle deine Farbe",
    scroll: "Scrollen und entdecken",
  },
  intro: {
    title: "Ein Bücherregal, das sich wie ein Objekt verhält.",
    text: "Die durchgehende Spirale hält deine Lieblingsstücke aufrecht und gibt dem Regal aus jedem Blickwinkel eine klare, bewusste Linie.",
    material: "Material",
    materialVal: "3D-gedrucktes PLA",
    dimensions: "Maße",
    shipping: "Versand",
    shippingVal: "Versand aus Deutschland",
    price: "Preis",
  },
  config: {
    eyebrow: "Farb-Konfigurator",
    title: "Finde deine Farbe.",
    buy: "Jetzt kaufen",
    soldOut: "Ausverkauft",
    support: "Fragen?",
  },
  colorsData: {
    sakura: {
      tone: "Zartes Rosa",
      short: "Ein helles Blütenrosa, das Lieblingsbücher zu einem sanften Blickfang macht.",
      long: "Ein helles Blütenrosa, das Lieblingsbücher zu einem sanften Blickfang macht. Perfekt für Schlafzimmerregale und gemütliche Leseecken.",
    },
    cyan: {
      tone: "Elektroblau",
      short: "Ein sattes Blau für Schreibtische, Gaming-Regale und klare Studio-Räume.",
      long: "Ein sattes Blau für Schreibtische, Gaming-Regale und klare Studio-Räume. Cyan zieht Blicke an, ohne mit neutralen Interieurs zu kollidieren.",
    },
    cherry: {
      tone: "Tiefes Rot",
      short: "Ein kräftiges Rot für mutige Regale, Zeitschriftenstapel und warme Räume.",
      long: "Ein kräftiges Rot für mutige Regale, Zeitschriftenstapel und warme Räume. Cherry macht die Spirale zum Statement-Objekt.",
    },
    rose: {
      tone: "Zartes Rosé",
      short: "Ein feiner Roséton, der jedem Regal und Schreibtisch Wärme und Weichheit verleiht.",
      long: "Ein feiner Roséton, der jedem Regal und Schreibtisch Wärme und Weichheit verleiht. Rosé ist die Leise — und oft zuerst ausverkauft.",
    },
    sunflower: {
      tone: "Warmes Gelb",
      short: "Ein sonniges Gelb, das die Spirale wie ein skulpturales Akzentstück wirken lässt.",
      long: "Ein sonniges Gelb, das die Spirale wie ein skulpturales Akzentstück wirken lässt. Sunflower bringt Licht ins Regal und passt wunderbar zu Holztönen.",
    },
  },
  details: {
    eyebrow: "Mit Sorgfalt gefertigt",
    title: "Gedruckt für den Alltag.",
    lead: "Aus PLA mit glattem, geschwungenem Profil gefertigt, hält die Spirale Lieblingsbücher, Magazine und Kunstkataloge sichtbar — statt weggestapelt.",
    f1t: "3D-gedruckt aus PLA",
    f1d: "Leichtes, robustes und umweltfreundliches Material mit glatter Oberfläche.",
    f2t: "Skulpturales Spiraldesign",
    f2d: "Sanfte Kurven, die Bücher aus jedem Blickwinkel schön halten.",
    f3t: "Kompakte Stellfläche",
    f3d: "245 × 178 × 192 mm — passt auf Schreibtische, Regale und Sideboards.",
    f4t: "Versand aus Deutschland",
    f4d: "Sorgfältig verpackt und europaweit verschickt. Schnell und zuverlässig.",
  },
  motion: {
    eyebrow: "In Bewegung erleben",
    title: "Eine durchgehende Linie — in jedem Raum.",
  },
  reviews: {
    eyebrow: "Bewertungen",
    title: "Geliebt in Regalen weltweit.",
    caption: "5,0 ★ · verifizierte Etsy-Käufer",
    buyer: "Verifizierter Käufer",
    readAll: "Alle Bewertungen auf Etsy →",
  },
  footer: {
    title1: "Hol dir die Spirale",
    title2: "in dein Regal.",
    text: "Bestelle das moderne Spiral-Bücherregal und wähle die Farbe, die zu deinem Raum passt.",
    pick: "Farbe wählen",
    shop: "Jetzt shoppen",
    trust: "Von Etsy-Käufern geschätzt · ★★★★★",
    home: "Start",
    legal: "Rechtliches",
  },
  colorsPage: {
    material: "Material",
    weight: "Gewicht",
    dimensions: "Maße",
    finish: "Oberfläche",
    finishVal: "Seidenmatt",
  },
  about: {
    eyebrow: "So entsteht's",
    h1a: "Mit ",
    h1em: "Präzision",
    h1b: " gedruckt,",
    h1c: "durch Design geformt.",
    heroText:
      "Jedes Coilo-Regal wird in Deutschland 3D-gedruckt — eine durchgehende Spirale, keine Montage, kein Abfall.",
    tlTitle: "Von der Datei ins Regal.",
    tlText: "Die Reise eines einzelnen Coilo dauert etwa 18 Stunden — vom digitalen Modell zum fertigen Produkt.",
    s1t: "Parametrisches Modellieren",
    s1d: "Die Spiralgeometrie wird parametrisch definiert — Wandstärke, Steigung und Krümmung werden für Stabilität und visuelle Balance abgestimmt, bevor Material zum Einsatz kommt.",
    s1l: "Software",
    s1v: "Eigene parametrische CAD-Pipeline",
    s2t: "Slicing & Pfadplanung",
    s2d: "Das 3D-Modell wird in tausende Schichten von je 0,2 mm zerlegt. Der Druckpfad ist optimiert, um Nähte zu minimieren und die Oberfläche zu glätten.",
    s2l: "Schichthöhe",
    s2v: "0,2 mm — ca. 900 Schichten pro Stück",
    s3t: "FDM-Druck",
    s3d: "Jedes Stück wird auf einer professionellen FDM-Maschine aus PLA-Filament gedruckt. Die durchgehende Spiralform braucht keine Stützen — die Geometrie trägt sich selbst.",
    s3l: "Druckzeit",
    s3v: "ca. 16–18 Stunden pro Stück",
    s4t: "Nachbearbeitung",
    s4d: "Nach dem Druck wird jedes Stück geprüft, gereinigt und leicht veredelt. Keine Lackierung — die Farbe durchzieht das gesamte Material.",
    s5t: "Qualitätsprüfung & Verpackung",
    s5d: "Jedes Regal durchläuft eine visuelle und strukturelle Prüfung, bevor es sorgfältig in Recyclingkarton verpackt und aus Deutschland verschickt wird.",
    s5l: "Versand",
    s5v: "EU-weit, mit Tracking & versichert",
    tlapseEyebrow: "Gedruckt, nicht gefertigt",
    tlapsePlaceholder: "Druck-Zeitraffer — bald verfügbar",
    matEyebrow: "Material",
    matTitle: "PLA — Kunststoff auf Pflanzenbasis.",
    matText:
      "Polymilchsäure wird aus nachwachsenden Rohstoffen wie Maisstärke gewonnen. Sie ist steif, leicht und hat eine seidenmatte Oberfläche, die sich hochwertig anfühlt.",
    weight: "Gewicht",
    dimensions: "Maße",
    finish: "Oberfläche",
    finishVal: "Seidenmatt",
    durability: "Haltbarkeit",
    durabilityVal: "Hohe Steifigkeit",
    susTitle: "Verantwortungsvoll produziert.",
    susText:
      "3D-Druck erzeugt nahezu keinen Materialabfall. Jedes Coilo verbraucht nur das Filament, das es braucht — keine Formen, kein Verschnitt, keine Überproduktion.",
    pills: [
      "Zero-Waste-Produktion",
      "PLA auf Pflanzenbasis",
      "Keine Montage nötig",
      "Auf Bestellung gefertigt",
      "Recycelte Verpackung",
    ],
    ctaTitle: "Sieh es in deiner Farbe.",
    ctaText: "Fünf Farben, eine skulpturale Form. Entdecke sie alle.",
    ctaExplore: "Farben entdecken",
    ctaHome: "Zur Startseite",
  },
};

export type Lang = "en" | "de";
export type Dict = typeof EN;

const DICTS: Record<Lang, Dict> = { en: EN, de: DE };
const STORAGE_KEY = "coilo_lang";

type I18n = { lang: Lang; setLang: (l: Lang) => void; t: Dict };

const I18nContext = createContext<I18n>({
  lang: "en",
  setLang: () => {},
  t: EN,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const detected =
        saved === "de" || saved === "en"
          ? (saved as Lang)
          : (navigator.language || "").toLowerCase().startsWith("de")
            ? "de"
            : "en";
      setLangState(detected);
    } catch {
      /* keep English */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* private mode */
    }
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: DICTS[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
