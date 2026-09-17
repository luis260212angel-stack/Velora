import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-line bg-cream transition-colors data-[state=checked]:border-terracotta data-[state=checked]:bg-terracotta",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 translate-x-1 rounded-full bg-ink shadow-sm transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:bg-ivory" />
    </SwitchPrimitive.Root>
  );
}
