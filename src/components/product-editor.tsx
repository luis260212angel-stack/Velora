import { EyeOff } from "lucide-react";
import { ImageField } from "@/components/image-field";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";

export function ProductEditor({
  product,
  onChange,
  onCommit,
  commitLabel,
  onRemove,
}: {
  product: Product;
  onChange: (product: Product) => void;
  onCommit?: () => void;
  commitLabel?: string;
  onRemove?: () => void;
}) {
  function patch(partial: Partial<Product>) {
    onChange({ ...product, ...partial });
  }

  return (
    <div className="grid gap-4 rounded-sm border border-line bg-ivory p-4">
      <ImageField
        label="Foto de la prenda"
        value={product.image}
        onChange={(image) => patch({ image })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre">
          <Input value={product.name} onChange={(e) => patch({ name: e.target.value })} />
        </Field>
        <Field label="Etiqueta">
          <Input
            value={product.tag}
            placeholder="Abrigo, vestido…"
            onChange={(e) => patch({ tag: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Descripción">
        <Textarea
          value={product.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio (MXN)">
          <Input
            type="number"
            min={0}
            value={product.price || ""}
            onChange={(e) => patch({ price: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="Descuento %">
          <Input
            type="number"
            min={0}
            max={100}
            value={product.discount || ""}
            onChange={(e) =>
              patch({ discount: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })
            }
          />
        </Field>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-sm bg-cream px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <EyeOff className="size-4" />
          Ocultar de la tienda
        </div>
        <Switch checked={product.hidden} onCheckedChange={(hidden) => patch({ hidden })} />
      </div>
      <div className="flex flex-wrap gap-2">
        {onCommit ? (
          <Button type="button" onClick={onCommit}>
            {commitLabel ?? "Añadir al estudio"}
          </Button>
        ) : null}
        {onRemove ? (
          <Button type="button" variant="ghost" onClick={onRemove}>
            Quitar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
