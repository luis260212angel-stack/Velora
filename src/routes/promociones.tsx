import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductDialog } from "@/components/product-dialog";
import { PromoBanner } from "@/components/promo-banner";
import { useBoutique } from "@/lib/boutique";
import { rankedProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/promociones")({ component: Catalog });

function Catalog() {
  const boutique = useBoutique();
  const products = useMemo(() => rankedProducts(boutique.products), [boutique.products]);
  const [open, setOpen] = useState<Product | null>(null);
  const saleCount = products.filter((p) => p.discount > 0).length;

  return (
    <main>
      <PromoBanner banner={boutique.banner} />
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Colección</p>
        <h1 className="mt-3 font-display text-5xl leading-none">{boutique.labels.catalog}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
          {saleCount > 0
            ? `${saleCount} pieza${saleCount === 1 ? "" : "s"} con descuento, resaltadas al frente.`
            : "Precio claro, foto de taller. Elige y pide por WhatsApp."}
        </p>
        {products.length === 0 ? (
          <p className="mt-16 text-sm text-muted">Aún no hay prendas a la vista.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={() => setOpen(product)} />
            ))}
          </div>
        )}
      </section>
      <ProductDialog product={open} onClose={() => setOpen(null)} />
    </main>
  );
}
