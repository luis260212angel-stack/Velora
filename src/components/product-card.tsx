import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, salePrice } from "@/lib/format";
import { recordCartAdd } from "@/lib/boutique-api";
import { useCart } from "@/lib/store";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  const add = useCart((s) => s.add);
  const onSale = product.discount > 0;
  const now = salePrice(product.price, product.discount);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-sm bg-cream",
        onSale && "ring-2 ring-terracotta ring-offset-2 ring-offset-ivory",
      )}
    >
      <button type="button" onClick={onOpen} className="relative block overflow-hidden">
        <div className="aspect-portrait bg-line">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
        {onSale ? (
          <Badge className="absolute top-3 left-3">-{product.discount}%</Badge>
        ) : product.tag ? (
          <span className="absolute top-3 left-3 rounded-full bg-ivory/90 px-2.5 py-1 text-xs uppercase tracking-wider text-ink-soft">
            {product.tag}
          </span>
        ) : null}
      </button>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <button type="button" onClick={onOpen} className="text-left">
          <h3 className="font-display text-2xl leading-tight">{product.name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            {onSale ? (
              <span className="text-sm text-muted line-through">{formatPrice(product.price)}</span>
            ) : null}
            <span className={cn("tabular-nums", onSale ? "font-semibold text-terracotta" : "text-ink-soft")}>
              {formatPrice(now)}
            </span>
          </div>
        </button>
        <Button
          type="button"
          variant={onSale ? "default" : "ink"}
          size="sm"
          className="mt-auto w-full"
          onClick={() => {
            add(product.id);
            void recordCartAdd();
          }}
        >
          <ShoppingBag className="size-3.5" />
          Añadir al carrito
        </Button>
      </div>
    </article>
  );
}
