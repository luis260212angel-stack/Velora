import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { recordCartAdd } from "@/lib/boutique-api";
import { formatPrice, salePrice } from "@/lib/format";
import { useCart } from "@/lib/store";
import type { Product } from "@/lib/types";

export function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const add = useCart((s) => s.add);
  if (!product) return null;
  const onSale = product.discount > 0;
  const now = salePrice(product.price, product.discount);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-sm bg-cream">
            <div className="aspect-portrait">
              {product.image ? (
                <img src={product.image} alt={product.name} className="size-full object-cover" />
              ) : null}
            </div>
            {onSale ? <Badge className="absolute top-3 left-3">-{product.discount}%</Badge> : null}
          </div>
          <div className="flex flex-col gap-4">
            {product.tag ? (
              <p className="text-xs uppercase tracking-widest text-muted">{product.tag}</p>
            ) : null}
            <DialogTitle>{product.name}</DialogTitle>
            <div className="flex items-baseline gap-3">
              {onSale ? (
                <span className="text-muted line-through">{formatPrice(product.price)}</span>
              ) : null}
              <span className="font-display text-3xl text-terracotta tabular-nums">
                {formatPrice(now)}
              </span>
            </div>
            <DialogDescription>{product.description}</DialogDescription>
            <Button
              className="mt-auto"
              onClick={() => {
                add(product.id);
                void recordCartAdd();
                onClose();
              }}
            >
              <ShoppingBag className="size-4" />
              Añadir al carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
