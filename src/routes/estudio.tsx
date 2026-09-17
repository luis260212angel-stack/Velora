import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/field";
import { ImageField } from "@/components/image-field";
import { ProductEditor } from "@/components/product-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  changeStudioPassword,
  getBoutiqueStats,
  getOrderIntents,
  getStudioStatus,
  hideOrderedProducts,
  lockStudio,
  saveBoutique,
  unlockStudio,
} from "@/lib/boutique-api";
import { useBoutiqueQuery, useInvalidateBoutique } from "@/lib/boutique";
import { BANNER_THEMES, emptyProduct, SOCIAL_PRESETS } from "@/lib/catalog";
import { formatPrice, formatWhen } from "@/lib/format";
import type { BoutiqueState, Product, SocialLink } from "@/lib/types";

export const Route = createFileRoute("/estudio")({ component: Estudio });

function Estudio() {
  const boutiqueQuery = useBoutiqueQuery();
  const statusQuery = useQuery({
    queryKey: ["studio-status"],
    queryFn: () => getStudioStatus(),
  });
  const [opened, setOpened] = useState(false);
  const unlocked = opened || statusQuery.data?.unlocked === true;
  const live = boutiqueQuery.data;
  const [draft, setDraft] = useState<BoutiqueState | null>(null);

  useEffect(() => {
    if (unlocked && live && !draft) setDraft(structuredClone(live));
  }, [unlocked, live, draft]);

  if (statusQuery.isLoading) {
    return <StudioFrame>Abriendo el estudio…</StudioFrame>;
  }
  if (!unlocked) return <StudioGate onUnlock={() => setOpened(true)} />;
  if (!draft) return <StudioFrame>Cargando el catálogo…</StudioFrame>;
  return <StudioWorkspace draft={draft} setDraft={setDraft} />;
}

function StudioFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted sm:px-8">{children}</main>
  );
}

function StudioGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await unlockStudio({ data: { password } });
      if (!result.ok) {
        toast.error("Contraseña incorrecta");
        return;
      }
      toast.success("Estudio abierto");
      onUnlock();
    } catch {
      toast.error("No se pudo abrir el estudio. Recarga e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="studio-gate mx-auto flex max-w-md flex-col justify-center px-5 py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Privado</p>
      <h1 className="mt-4 font-display text-5xl leading-none">Estudio</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Solo el dueño entra aquí: fotos, precios, descuentos y el texto de la portada.
      </p>
      <form onSubmit={(e) => void submit(e)} className="mt-8 grid gap-4">
        <Field label="Contraseña">
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={busy || !password}>
          Entrar
        </Button>
      </form>
    </main>
  );
}

function StudioWorkspace({
  draft,
  setDraft,
}: {
  draft: BoutiqueState;
  setDraft: (next: BoutiqueState) => void;
}) {
  const boutiqueQuery = useBoutiqueQuery();
  const { refresh } = useInvalidateBoutique();
  const statsQuery = useQuery({
    queryKey: ["boutique-stats"],
    queryFn: () => getBoutiqueStats(),
  });
  const ordersQuery = useQuery({
    queryKey: ["order-intents"],
    queryFn: () => getOrderIntents(),
  });
  const [fresh, setFresh] = useState<Product>(() => emptyProduct());
  const [saving, setSaving] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [nextPass, setNextPass] = useState("");
  const live = boutiqueQuery.data;
  const dirty = useMemo(
    () => (live ? JSON.stringify(live) !== JSON.stringify(draft) : true),
    [live, draft],
  );

  function patch(partial: Partial<BoutiqueState>) {
    setDraft({ ...draft, ...partial });
  }

  async function save() {
    setSaving(true);
    try {
      const saved = await saveBoutique({ data: { state: draft } });
      setDraft(saved);
      await refresh(saved);
      toast.success("Cambios publicados");
    } catch {
      toast.error("No se pudieron guardar. Vuelve a entrar al estudio.");
    } finally {
      setSaving(false);
    }
  }

  async function addFresh() {
    if (!fresh.name.trim()) {
      toast.error("Ponle un nombre a la prenda");
      return;
    }
    patch({ products: [{ ...fresh, name: fresh.name.trim() }, ...draft.products] });
    setFresh(emptyProduct());
    toast.success("Prenda en el borrador. Publica con Guardar cambios.");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-32 pt-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Panel</p>
          <h1 className="mt-3 font-display text-5xl leading-none">Estudio</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link to="/">
              <Eye className="size-4" />
              Ver tienda
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await lockStudio();
              window.location.reload();
            }}
          >
            Cerrar
          </Button>
        </div>
      </div>

      <section className="mt-10 grid gap-3 sm:grid-cols-4">
        <Stat label="Visitantes" value={statsQuery.data?.uniqueVisitors ?? "—"} />
        <Stat label="Vistas" value={statsQuery.data?.pageViews ?? "—"} />
        <Stat label="Al carrito" value={statsQuery.data?.cartAdds ?? "—"} />
        <Stat label="Pedidos WA" value={statsQuery.data?.whatsappOrders ?? "—"} />
      </section>

      <Section title="1. Agregar ropa" kicker="Primero">
        <p className="text-sm text-ink-soft">
          En el teléfono usa Cámara: abre el lente trasero, tomas la prenda y queda lista.
        </p>
        <ProductEditor
          product={fresh}
          onChange={setFresh}
          onCommit={() => void addFresh()}
          commitLabel="Añadir al estudio"
        />
      </Section>

      <Section title="Inventario" kicker={`${draft.products.length} piezas`}>
        <ul className="grid gap-4">
          {draft.products.map((product, index) => (
            <li key={product.id}>
              <ProductEditor
                product={product}
                onChange={(next) => {
                  const products = [...draft.products];
                  products[index] = next;
                  patch({ products });
                }}
                onRemove={() =>
                  patch({ products: draft.products.filter((row) => row.id !== product.id) })
                }
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Banner" kicker="Navidad, rebajas…">
        <div className="flex items-center justify-between rounded-sm bg-cream px-3 py-2">
          <span className="text-sm">Mostrar banner</span>
          <Switch
            checked={draft.banner.enabled}
            onCheckedChange={(enabled) => patch({ banner: { ...draft.banner, enabled } })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {BANNER_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => patch({ banner: { ...draft.banner, theme: theme.id } })}
              className={`h-10 rounded-full border px-4 text-xs uppercase tracking-wider ${
                draft.banner.theme === theme.id
                  ? "border-terracotta bg-terracotta text-ivory"
                  : "border-line text-ink-soft"
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
        <Field label="Título">
          <Input
            value={draft.banner.title}
            onChange={(e) => patch({ banner: { ...draft.banner, title: e.target.value } })}
          />
        </Field>
        <Field label="Subtítulo">
          <Input
            value={draft.banner.subtitle}
            onChange={(e) => patch({ banner: { ...draft.banner, subtitle: e.target.value } })}
          />
        </Field>
        <Field label="Botón">
          <Input
            value={draft.banner.cta}
            onChange={(e) => patch({ banner: { ...draft.banner, cta: e.target.value } })}
          />
        </Field>
      </Section>

      <Section title="Portada" kicker="Texto y fotos">
        <Field label="Nombre de la tienda">
          <Input
            value={draft.home.brand}
            onChange={(e) => patch({ home: { ...draft.home, brand: e.target.value } })}
          />
        </Field>
        <Field label="Cintillo">
          <Input
            value={draft.home.kicker}
            onChange={(e) => patch({ home: { ...draft.home, kicker: e.target.value } })}
          />
        </Field>
        <Field label="Eslogan">
          <Textarea
            value={draft.home.slogan}
            onChange={(e) => patch({ home: { ...draft.home, slogan: e.target.value } })}
          />
        </Field>
        <Field label="Texto del botón">
          <Input
            value={draft.home.ctaLabel}
            onChange={(e) => patch({ home: { ...draft.home, ctaLabel: e.target.value } })}
          />
        </Field>
        <ImageField
          label="Foto de portada"
          value={draft.home.heroImage}
          onChange={(heroImage) => patch({ home: { ...draft.home, heroImage } })}
        />
        <Field label="Título de colección">
          <Input
            value={draft.home.collectionTitle}
            onChange={(e) => patch({ home: { ...draft.home, collectionTitle: e.target.value } })}
          />
        </Field>
        <Field label="Texto de colección">
          <Textarea
            value={draft.home.collectionBody}
            onChange={(e) => patch({ home: { ...draft.home, collectionBody: e.target.value } })}
          />
        </Field>
        <ImageField
          label="Foto de colección"
          value={draft.home.collectionImage}
          onChange={(collectionImage) => patch({ home: { ...draft.home, collectionImage } })}
        />
        <Field label="Título del taller">
          <Input
            value={draft.home.houseTitle}
            onChange={(e) => patch({ home: { ...draft.home, houseTitle: e.target.value } })}
          />
        </Field>
        <Field label="Texto del taller">
          <Textarea
            value={draft.home.houseBody}
            onChange={(e) => patch({ home: { ...draft.home, houseBody: e.target.value } })}
          />
        </Field>
        <ImageField
          label="Foto del taller"
          value={draft.home.houseImage}
          onChange={(houseImage) => patch({ home: { ...draft.home, houseImage } })}
        />
      </Section>

      <Section title="Nombres de páginas" kicker="Promociones puede llamarse Ropa">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Inicio">
            <Input
              value={draft.labels.home}
              onChange={(e) => patch({ labels: { ...draft.labels, home: e.target.value } })}
            />
          </Field>
          <Field label="Catálogo">
            <Input
              value={draft.labels.catalog}
              onChange={(e) => patch({ labels: { ...draft.labels, catalog: e.target.value } })}
            />
          </Field>
          <Field label="Estudio">
            <Input
              value={draft.labels.studio}
              onChange={(e) => patch({ labels: { ...draft.labels, studio: e.target.value } })}
            />
          </Field>
          <Field label="Contacto">
            <Input
              value={draft.labels.contact}
              onChange={(e) => patch({ labels: { ...draft.labels, contact: e.target.value } })}
            />
          </Field>
        </div>
      </Section>

      <Section title="Contacto" kicker="Pie de página">
        <Field label="Dirección">
          <Input
            value={draft.contact.address}
            onChange={(e) => patch({ contact: { ...draft.contact, address: e.target.value } })}
          />
        </Field>
        <Field label="Búsqueda de mapa">
          <Input
            value={draft.contact.mapQuery}
            placeholder="Roma Norte, CDMX"
            onChange={(e) => patch({ contact: { ...draft.contact, mapQuery: e.target.value } })}
          />
        </Field>
        <ImageField
          label="Imagen guía del mapa"
          value={draft.contact.mapImage}
          onChange={(mapImage) => patch({ contact: { ...draft.contact, mapImage } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Teléfono">
            <Input
              value={draft.contact.phone}
              onChange={(e) => patch({ contact: { ...draft.contact, phone: e.target.value } })}
            />
          </Field>
          <Field label="WhatsApp (con código de país)">
            <Input
              value={draft.contact.whatsapp}
              placeholder="5215512345678"
              onChange={(e) => patch({ contact: { ...draft.contact, whatsapp: e.target.value } })}
            />
          </Field>
        </div>
        <Field label="Horario">
          <Input
            value={draft.contact.hours}
            onChange={(e) => patch({ contact: { ...draft.contact, hours: e.target.value } })}
          />
        </Field>
        <div className="grid gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Redes</p>
          {draft.contact.socials.map((social, index) => (
            <div key={social.id} className="grid gap-2 rounded-sm border border-line p-3 sm:grid-cols-[8rem_1fr_auto]">
              <Input
                value={social.label}
                onChange={(e) => updateSocial(draft, patch, index, { label: e.target.value })}
              />
              <Input
                value={social.url}
                placeholder="https://"
                onChange={(e) => updateSocial(draft, patch, index, { url: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  patch({
                    contact: {
                      ...draft.contact,
                      socials: draft.contact.socials.filter((row) => row.id !== social.id),
                    },
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {SOCIAL_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSocial(draft, patch, preset)}
              >
                <Plus className="size-3.5" />
                {preset.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addSocial(draft, patch, { id: `red-${Date.now()}`, label: "Otra red" })}
            >
              Otra red
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Pedidos por WhatsApp" kicker="Carritos enviados">
        <p className="text-sm leading-relaxed text-ink-soft">
          El cliente habla contigo en WhatsApp — más simple que un chat dentro de la página, y te llega al teléfono. Si una pieza ya salió, ocúltala para que desaparezca de {draft.labels.catalog}.
        </p>
        {(ordersQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay pedidos.</p>
        ) : (
          <ul className="grid gap-3">
            {(ordersQuery.data ?? []).map((order) => (
              <li key={order.id} className="rounded-sm border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-muted">{formatWhen(order.createdAt)}</p>
                  <p className="font-display text-xl tabular-nums">{formatPrice(order.total)}</p>
                </div>
                <ul className="mt-2 text-sm">
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.name} ×{item.qty}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={order.hiddenApplied}
                  onClick={async () => {
                    const ids = order.items.map((item) => item.productId);
                    const saved = await hideOrderedProducts({
                      data: { ids, intentId: order.id },
                    });
                    setDraft(saved);
                    await refresh(saved);
                    toast.success("Piezas ocultas en la tienda");
                  }}
                >
                  {order.hiddenApplied ? "Ya ocultas" : "Ocultar estas piezas"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Contraseña" kicker="Cámbiala cuando quieras">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Actual">
            <Input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
            />
          </Field>
          <Field label="Nueva">
            <Input type="password" value={nextPass} onChange={(e) => setNextPass(e.target.value)} />
          </Field>
        </div>
        <Button
          type="button"
          variant="ink"
          disabled={!currentPass || nextPass.length < 4}
          onClick={async () => {
            const result = await changeStudioPassword({
              data: { current: currentPass, next: nextPass },
            });
            if (!result.ok) {
              toast.error("message" in result ? result.message : "No se pudo cambiar");
              return;
            }
            setCurrentPass("");
            setNextPass("");
            toast.success("Contraseña actualizada");
          }}
        >
          Cambiar contraseña
        </Button>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 px-5 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {dirty ? "Hay cambios sin publicar" : "Todo está publicado"}
          </p>
          <Button type="button" onClick={() => void save()} disabled={!dirty || saving}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 grid gap-4 border-t border-line pt-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">{kicker}</p>
        <h2 className="font-display text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-sm border border-line bg-cream px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="font-display text-3xl tabular-nums">{value}</p>
    </div>
  );
}

function updateSocial(
  draft: BoutiqueState,
  patch: (partial: Partial<BoutiqueState>) => void,
  index: number,
  partial: Partial<SocialLink>,
) {
  const socials = [...draft.contact.socials];
  socials[index] = { ...socials[index], ...partial };
  patch({ contact: { ...draft.contact, socials } });
}

function addSocial(
  draft: BoutiqueState,
  patch: (partial: Partial<BoutiqueState>) => void,
  preset: { id: string; label: string },
) {
  if (draft.contact.socials.some((row) => row.id === preset.id)) return;
  patch({
    contact: {
      ...draft.contact,
      socials: [...draft.contact.socials, { id: preset.id, label: preset.label, url: "" }],
    },
  });
}
