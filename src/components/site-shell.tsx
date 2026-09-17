import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/cart-drawer";
import { ContactFooter } from "@/components/contact-footer";
import { recordVisit } from "@/lib/boutique-api";
import { useBoutique } from "@/lib/boutique";
import { useCart } from "@/lib/store";
import { getVisitorKey, markSessionVisit } from "@/lib/visitor";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const boutique = useBoutique();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = useCart((s) => s.items.reduce((sum, item) => sum + item.qty, 0));
  const setOpen = useCart((s) => s.setOpen);
  const hideChrome = pathname.startsWith("/estudio");

  useEffect(() => {
    if (!markSessionVisit()) return;
    void recordVisit({ data: { visitorKey: getVisitorKey() } });
  }, []);

  return (
    <div className="min-h-svh bg-ivory text-ink">
      <header className="nav-blur sticky top-0 z-40 border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="font-display text-2xl italic tracking-tight">
            {boutique.home.brand}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/" active={pathname === "/"}>
              {boutique.labels.home}
            </NavLink>
            <NavLink to="/promociones" active={pathname.startsWith("/promociones")}>
              {boutique.labels.catalog}
            </NavLink>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative ml-1 grid size-11 place-items-center rounded-full hover:bg-cream"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="size-4" />
              {count > 0 ? (
                <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-terracotta px-1 text-xs font-semibold text-ivory tabular-nums">
                  {count}
                </span>
              ) : null}
            </button>
          </nav>
        </div>
      </header>
      <div>{children}</div>
      {hideChrome ? null : <ContactFooter />}
      <CartDrawer />
      <Toaster position="bottom-center" richColors />
    </div>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex h-11 items-center px-3 tracking-wide",
        active ? "text-terracotta" : "text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
