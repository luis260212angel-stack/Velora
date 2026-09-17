import { Link } from "@tanstack/react-router";
import type { Banner } from "@/lib/types";

const THEME_KICKER: Record<string, string> = {
  rebajas: "Rebajas",
  navidad: "Navidad",
  verano: "Verano",
  custom: "Aviso",
};

export function PromoBanner({ banner, ctaTo = "/promociones" }: { banner: Banner; ctaTo?: string }) {
  if (!banner.enabled) return null;
  return (
    <section className="border-y border-line bg-ink px-5 py-8 text-ivory sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-sand">
            {THEME_KICKER[banner.theme] ?? "Aviso"}
          </p>
          <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">{banner.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-sand">{banner.subtitle}</p>
        </div>
        {banner.cta ? (
          <Link
            to={ctaTo}
            className="inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm text-ivory hover:bg-terracotta-deep"
          >
            {banner.cta}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
