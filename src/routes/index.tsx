import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductDialog } from "@/components/product-dialog";
import { PromoBanner } from "@/components/promo-banner";
import { useBoutique } from "@/lib/boutique";
import { rankedProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const boutique = useBoutique();
  const { home, banner, labels } = boutique;
  const featured = rankedProducts(boutique.products).filter((p) => p.discount > 0).slice(0, 3);
  const [open, setOpen] = useState<Product | null>(null);

  return (
    <main>
      <section className="relative hero-frame overflow-hidden bg-ink">
        {home.heroImage ? (
          <img
            src={home.heroImage}
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
          />
        ) : null}
        <div className="hero-veil absolute inset-0" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end gap-5 px-5 py-16 sm:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-sand">{home.kicker}</p>
          <h1 className="max-w-3xl font-display text-5xl leading-none text-ivory sm:text-7xl">
            {home.slogan}
          </h1>
          <Link
            to="/promociones"
            className="inline-flex h-12 w-fit items-center rounded-full bg-terracotta px-6 text-sm text-ivory hover:bg-terracotta-deep"
          >
            {home.ctaLabel}
          </Link>
        </div>
      </section>

      <PromoBanner banner={banner} />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-sm bg-cream">
          {home.collectionImage ? (
            <img
              src={home.collectionImage}
              alt=""
              className="aspect-lookbook w-full object-cover"
            />
          ) : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">{labels.catalog}</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">{home.collectionTitle}</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            {home.collectionBody}
          </p>
          <Link
            to="/promociones"
            className="mt-6 inline-flex h-11 items-center text-sm tracking-wide text-terracotta underline decoration-sand underline-offset-4"
          >
            Ver todas las piezas
          </Link>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="border-t border-line bg-ivory px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-4xl">Piezas con descuento</h2>
              <Link to="/promociones" className="text-sm text-muted hover:text-ink">
                {labels.catalog}
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} onOpen={() => setOpen(product)} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="lg:order-2">
            <div className="overflow-hidden rounded-sm bg-ivory">
              {home.houseImage ? (
                <img src={home.houseImage} alt="" className="aspect-lookbook w-full object-cover" />
              ) : null}
            </div>
          </div>
          <div className="lg:order-1">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">La casa</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">{home.houseTitle}</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">{home.houseBody}</p>
          </div>
        </div>
      </section>

      <ProductDialog product={open} onClose={() => setOpen(null)} />
    </main>
  );
}
