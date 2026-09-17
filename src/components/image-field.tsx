import { Camera, ImagePlus, Link2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/compress-image";
import { cn } from "@/lib/utils";

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await compressImage(file));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
      <div className="flex gap-3">
        <div
          className={cn(
            "grid size-24 shrink-0 place-items-center overflow-hidden rounded-sm border border-line bg-cream",
            !value && "text-muted",
          )}
        >
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </div>
        <div className="grid min-w-0 flex-1 gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ink"
              size="sm"
              onClick={() => cameraRef.current?.click()}
              disabled={busy}
            >
              <Camera className="size-3.5" />
              Cámara
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => galleryRef.current?.click()}
              disabled={busy}
            >
              <ImagePlus className="size-3.5" />
              Galería
            </Button>
          </div>
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" />
            <Input
              value={value.startsWith("data:") ? "" : value}
              placeholder="o pega una URL"
              className="pl-9"
              onChange={(event) => {
                const next = event.target.value.trim();
                if (next.startsWith("http") || next.startsWith("/") || next === "") {
                  onChange(next);
                }
              }}
            />
          </div>
        </div>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          void onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          void onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
