import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-line bg-ivory px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-terracotta",
        className,
      )}
      {...props}
    />
  );
}
