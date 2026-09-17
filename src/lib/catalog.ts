import type {
  Banner,
  BoutiqueState,
  ContactInfo,
  HomeContent,
  PageLabels,
  Product,
  SocialLink,
} from "@/lib/types";

export const BANNER_THEMES = [
  { id: "rebajas", label: "Rebajas" },
  { id: "navidad", label: "Navidad" },
  { id: "verano", label: "Verano" },
  { id: "custom", label: "Personalizado" },
] as const;

export const SOCIAL_PRESETS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "pinterest", label: "Pinterest" },
  { id: "x", label: "X" },
] as const;

export const SEED_STATE: BoutiqueState = {
  home: {
    brand: "Velora",
    kicker: "Atelier de temporada",
    slogan: "Lino, luz y piezas que duran",
    heroImage: "/home/hero.jpg",
    ctaLabel: "Ver la colección",
    collectionTitle: "Cápsula de otoño",
    collectionBody:
      "Siete piezas pensadas para repetir: lino lavado, lana camel y un punto terracotta que enciende cualquier look.",
    collectionImage: "/home/atelier.jpg",
    houseTitle: "El taller",
    houseBody:
      "Cortamos y planchamos en un cuarto con luz de patio. Cada prenda sale con su medida, no con una talla genérica de catálogo.",
    houseImage: "/home/house.jpg",
  },
  labels: {
    home: "Inicio",
    catalog: "Ropa",
    studio: "Estudio",
    contact: "Visítanos",
  },
  banner: {
    enabled: true,
    theme: "rebajas",
    title: "Rebajas de patio",
    subtitle: "Hasta 25% en piezas seleccionadas · esta semana",
    cta: "Ver ofertas",
  },
  contact: {
    address: "Álvaro Obregón 128, Roma Norte, CDMX",
    phone: "+52 55 0000 0000",
    whatsapp: "525500000000",
    hours: "Mar–Sáb · 11 a 19 h",
    mapImage: "",
    mapQuery: "Roma Norte, Ciudad de México",
    socials: [
      { id: "instagram", label: "Instagram", url: "https://instagram.com/" },
      { id: "facebook", label: "Facebook", url: "https://facebook.com/" },
    ],
  },
  products: [
    {
      id: "coat",
      name: "Abrigo camel",
      description: "Lana prensada, solapa ancha y un cinturón que cierra el invierno sin peso extra.",
      image: "/products/coat.jpg",
      price: 4200,
      discount: 20,
      hidden: false,
      tag: "Abrigo",
    },
    {
      id: "blouse",
      name: "Blusa de seda",
      description: "Marfil lavado, botones de nácar y una caída que no pide plancha constante.",
      image: "/products/blouse.jpg",
      price: 1680,
      discount: 0,
      hidden: false,
      tag: "Blusa",
    },
    {
      id: "trousers",
      name: "Pantalón de lino",
      description: "Tiro alto, pinzas suaves y un lino arena que se ve mejor después de tres lavados.",
      image: "/products/trousers.jpg",
      price: 1890,
      discount: 15,
      hidden: false,
      tag: "Pantalón",
    },
    {
      id: "knit",
      name: "Suéter terracotta",
      description: "Merino de punto medio. El color de la casa, para días que piden calor sin recargarse.",
      image: "/products/knit.jpg",
      price: 1540,
      discount: 0,
      hidden: false,
      tag: "Punto",
    },
    {
      id: "dress",
      name: "Vestido de lino",
      description: "Midi sin mangas, costura al bies y un lino marfil que se mueve con el patio.",
      image: "/products/dress.jpg",
      price: 2480,
      discount: 25,
      hidden: false,
      tag: "Vestido",
    },
    {
      id: "bag",
      name: "Bolso de cuero",
      description: "Hombro castaño, herrajes quietos y un tamaño que cabe el día sin parecer maleta.",
      image: "/products/bag.jpg",
      price: 3200,
      discount: 0,
      hidden: false,
      tag: "Accesorio",
    },
    {
      id: "boots",
      name: "Botines de gamuza",
      description: "Taupe cálido, taco bajo y una suela que aguanta adoquín. El cierre de la cápsula.",
      image: "/products/boots.jpg",
      price: 2760,
      discount: 10,
      hidden: false,
      tag: "Calzado",
    },
  ],
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function str(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function bool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeProduct(value: unknown, index: number): Product {
  const row = asRecord(value);
  return {
    id: str(row.id, `pieza-${index + 1}`),
    name: str(row.name, "Pieza nueva"),
    description: str(row.description, ""),
    image: str(row.image, ""),
    price: Math.max(0, num(row.price, 0)),
    discount: Math.min(100, Math.max(0, num(row.discount, 0))),
    hidden: bool(row.hidden, false),
    tag: str(row.tag, ""),
  };
}

function normalizeSocial(value: unknown, index: number): SocialLink {
  const row = asRecord(value);
  return {
    id: str(row.id, `social-${index + 1}`),
    label: str(row.label, "Red"),
    url: str(row.url, ""),
  };
}

function normalizeHome(value: unknown): HomeContent {
  const row = asRecord(value);
  return {
    brand: str(row.brand, SEED_STATE.home.brand),
    kicker: str(row.kicker, SEED_STATE.home.kicker),
    slogan: str(row.slogan, SEED_STATE.home.slogan),
    heroImage: str(row.heroImage, SEED_STATE.home.heroImage),
    ctaLabel: str(row.ctaLabel, SEED_STATE.home.ctaLabel),
    collectionTitle: str(row.collectionTitle, SEED_STATE.home.collectionTitle),
    collectionBody: str(row.collectionBody, SEED_STATE.home.collectionBody),
    collectionImage: str(row.collectionImage, SEED_STATE.home.collectionImage),
    houseTitle: str(row.houseTitle, SEED_STATE.home.houseTitle),
    houseBody: str(row.houseBody, SEED_STATE.home.houseBody),
    houseImage: str(row.houseImage, SEED_STATE.home.houseImage),
  };
}

function normalizeLabels(value: unknown): PageLabels {
  const row = asRecord(value);
  return {
    home: str(row.home, SEED_STATE.labels.home),
    catalog: str(row.catalog, SEED_STATE.labels.catalog),
    studio: str(row.studio, SEED_STATE.labels.studio),
    contact: str(row.contact, SEED_STATE.labels.contact),
  };
}

function normalizeBanner(value: unknown): Banner {
  const row = asRecord(value);
  return {
    enabled: bool(row.enabled, SEED_STATE.banner.enabled),
    theme: str(row.theme, SEED_STATE.banner.theme),
    title: str(row.title, SEED_STATE.banner.title),
    subtitle: str(row.subtitle, SEED_STATE.banner.subtitle),
    cta: str(row.cta, SEED_STATE.banner.cta),
  };
}

function normalizeContact(value: unknown): ContactInfo {
  const row = asRecord(value);
  const socials = Array.isArray(row.socials)
    ? row.socials.map(normalizeSocial)
    : SEED_STATE.contact.socials;
  return {
    address: str(row.address, SEED_STATE.contact.address),
    phone: str(row.phone, SEED_STATE.contact.phone),
    whatsapp: str(row.whatsapp, SEED_STATE.contact.whatsapp),
    hours: str(row.hours, SEED_STATE.contact.hours),
    mapImage: str(row.mapImage, ""),
    mapQuery: str(row.mapQuery, SEED_STATE.contact.mapQuery),
    socials,
  };
}

export function normalizeBoutique(value: unknown): BoutiqueState {
  const row = asRecord(value);
  const products = Array.isArray(row.products)
    ? row.products.map(normalizeProduct)
    : SEED_STATE.products;
  return {
    home: normalizeHome(row.home),
    labels: normalizeLabels(row.labels),
    banner: normalizeBanner(row.banner),
    contact: normalizeContact(row.contact),
    products,
  };
}

export function emptyProduct(): Product {
  return {
    id: `pieza-${Date.now()}`,
    name: "",
    description: "",
    image: "",
    price: 0,
    discount: 0,
    hidden: false,
    tag: "",
  };
}

export function visibleProducts(products: Product[]) {
  return products.filter((product) => !product.hidden);
}

export function rankedProducts(products: Product[]) {
  return [...visibleProducts(products)].sort((a, b) => {
    const da = a.discount > 0 ? 1 : 0;
    const db = b.discount > 0 ? 1 : 0;
    return db - da;
  });
}
