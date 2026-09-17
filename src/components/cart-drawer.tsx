import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordOrderIntent } from "@/lib/boutique-api";
import { formatPrice, salePrice } from "@/lib/format";
import { useBoutique } from "@/lib/boutique";
import { useCart } from "@/lib/store";
import { getCartKey } from "@/lib/visitor";
import { orderMessage, resolveCart, whatsappHref } from "@/lib/whatsapp";

export function CartDrawer() {
  const boutique = useBoutique();
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const resolved = resolveCart(items, boutique.products);
  const total = resolved.reduce(
    (sum, row) => sum + salePrice(row.product.price, row.product.discount) * row.qty,
    0,
  );
  const href = whatsappHref(
    boutique.contact.whatsapp || boutique.contact.phone,
    orderMessage(boutique.home.brand, resolved),
  );

  async function sendWhatsApp() {
    if (!href || resolved.length === 0) return;
    await recordOrderIntent({
      data: {
        cartKey: getCartKey(),
        items: resolved.map((row) => ({
          productId: row.product.id,
          name: row.product.name,
          qty: row.qty,
          unit: salePrice(row.product.price, row.product.discount),
        })),
        total,
      },
    });
    window.open(href, "_blank", "noopener,noreferrer");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Cerrar carrito"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="grid gap-1">
            <p className="text-xs uppercase tracking-widest text-muted">Tu pedido</p>
            <h2 className="font-display text-3xl leading-none">Carrito</h2>
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full hover:bg-cream"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {resolved.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              Aún no hay piezas. Elige algo de {boutique.labels.catalog.toLowerCase()} y lo armamos juntas.
            </p>
          ) : (
            <ul className="grid gap-4">
              {resolved.map((row) => {
                const unit = salePrice(row.product.price, row.product.discount);
                return (
                  <li key={row.product.id} className="flex gap-3">
                    <div className="size-20 shrink-0 overflow-hidden rounded-sm bg-cream">
                      {row.product.image ? (
                        <img
                          src={row.product.image}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.product.name}</p>
                      <p className="text-sm text-terracotta tabular-nums">{formatPrice(unit)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="grid size-9 place-items-center rounded-full border border-line"
                          onClick={() => setQty(row.product.id, row.qty - 1)}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{row.qty}</span>
                        <button
                          type="button"
                          className="grid size-9 place-items-center rounded-full border border-line"
                          onClick={() => setQty(row.product.id, row.qty + 1)}
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          type="button"
                          className="ml-auto grid size-9 place-items-center rounded-full text-muted hover:text-terracotta"
                          onClick={() => remove(row.product.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <footer className="grid gap-3 border-t border-line p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total</span>
            <span className="font-display text-2xl tabular-nums">{formatPrice(total)}</span>
          </div>
          <Button disabled={!href || resolved.length === 0} onClick={() => void sendWhatsApp()}>
            <ShoppingBag className="size-4" />
            Pedir por WhatsApp
          </Button>
          {!href ? (
            <p className="text-xs text-muted">
              Falta el número de WhatsApp. Agrégalo en {boutique.labels.studio}.
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-muted">
              Se abre un chat con el pedido escrito. El dueño responde ahí, en su teléfono.
            </p>
          )}
          {resolved.length > 0 ? (
            <button type="button" className="text-xs text-muted underline" onClick={clear}>
              Vaciar carrito
            </button>
          ) : null}
        </footer>
      </aside>
    </div>
  );
}
