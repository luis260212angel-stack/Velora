import { formatPrice } from "@/lib/format";
import type { CartItem, Product } from "@/lib/types";
import { salePrice } from "@/lib/format";

export function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export function whatsappHref(phone: string, message: string) {
  const digits = digitsOnly(phone);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function orderMessage(
  brand: string,
  items: { product: Product; qty: number }[],
) {
  const lines = items.map((item) => {
    const unit = salePrice(item.product.price, item.product.discount);
    return `• ${item.product.name} ×${item.qty} — ${formatPrice(unit * item.qty)}`;
  });
  const total = items.reduce((sum, item) => {
    return sum + salePrice(item.product.price, item.product.discount) * item.qty;
  }, 0);
  return [
    `Hola, quiero pedir en ${brand}:`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
  ].join("\n");
}

export function resolveCart(items: CartItem[], products: Product[]) {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { product, qty: item.qty };
    })
    .filter((row): row is { product: Product; qty: number } => row !== null);
}
