import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-sm border border-line bg-ivory px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-terracotta",
        className,
      )}
      {...props}
    />
  );
}
