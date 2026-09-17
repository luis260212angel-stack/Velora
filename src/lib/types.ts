export type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  discount: number;
  hidden: boolean;
  tag: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
};

export type ContactInfo = {
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
  mapImage: string;
  mapQuery: string;
  socials: SocialLink[];
};

export type HomeContent = {
  brand: string;
  kicker: string;
  slogan: string;
  heroImage: string;
  ctaLabel: string;
  collectionTitle: string;
  collectionBody: string;
  collectionImage: string;
  houseTitle: string;
  houseBody: string;
  houseImage: string;
};

export type PageLabels = {
  home: string;
  catalog: string;
  studio: string;
  contact: string;
};

export type Banner = {
  enabled: boolean;
  theme: string;
  title: string;
  subtitle: string;
  cta: string;
};

export type BoutiqueState = {
  home: HomeContent;
  labels: PageLabels;
  banner: Banner;
  contact: ContactInfo;
  products: Product[];
};

export type CartItem = {
  productId: string;
  qty: number;
};

export type OrderIntent = {
  id: string;
  cartKey: string;
  items: { productId: string; name: string; qty: number; unit: number }[];
  total: number;
  createdAt: string;
  hiddenApplied: boolean;
};

export type BoutiqueStats = {
  uniqueVisitors: number;
  pageViews: number;
  cartAdds: number;
  whatsappOrders: number;
};
