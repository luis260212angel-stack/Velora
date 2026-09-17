import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useBoutique } from "@/lib/boutique";

const ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
};

function mapsUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}

export function ContactFooter() {
  const { contact, labels, home } = useBoutique();
  const query = contact.mapQuery || contact.address;

  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">{labels.contact}</p>
          <h2 className="mt-4 font-display text-4xl leading-none">{home.brand}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">{contact.hours}</p>
          <ul className="mt-6 grid gap-3 text-sm">
            {contact.address ? (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-terracotta" />
                <span>{contact.address}</span>
              </li>
            ) : null}
            {contact.phone ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-terracotta" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-terracotta">
                  {contact.phone}
                </a>
              </li>
            ) : null}
          </ul>
          {contact.socials.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {contact.socials
                .filter((social) => social.url)
                .map((social) => {
                  const Icon = ICONS[social.id] ?? Instagram;
                  return (
                    <li key={social.id}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-ivory px-4 text-sm hover:border-terracotta hover:text-terracotta"
                      >
                        <Icon className="size-4" />
                        {social.label}
                      </a>
                    </li>
                  );
                })}
            </ul>
          ) : null}
        </div>
        <div className="grid gap-3">
          {contact.mapImage ? (
            <a
              href={query ? mapsUrl(query) : undefined}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-sm border border-line"
            >
              <img
                src={contact.mapImage}
                alt={`Mapa de ${contact.address}`}
                className="aspect-lookbook w-full object-cover"
              />
            </a>
          ) : query ? (
            <a
              href={mapsUrl(query)}
              target="_blank"
              rel="noreferrer"
              className="relative block overflow-hidden rounded-sm border border-line bg-ivory"
            >
              <div className="map-grid aspect-lookbook w-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-terracotta text-ivory">
                  <MapPin className="size-5" />
                </span>
                <p className="max-w-xs text-sm leading-relaxed text-ink">{contact.address}</p>
                <span className="text-xs uppercase tracking-wider text-terracotta">
                  Abrir en Google Maps
                </span>
              </div>
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-line px-5 py-4 text-center text-xs text-muted sm:px-8">
        <Link to="/estudio" className="hover:text-ink">
          {labels.studio}
        </Link>
        <span className="mx-2">·</span>
        <span>{home.brand}</span>
      </div>
    </footer>
  );
}
