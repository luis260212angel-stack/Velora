import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { BoutiqueState, BoutiqueStats, OrderIntent } from "@/lib/types";

export const getBoutique = createServerFn({ method: "GET" }).handler(async () => {
  const mod = await import("./boutique.server");
  return mod.loadBoutique();
});

export const getBoutiqueStats = createServerFn({ method: "GET" }).handler(async () => {
  const mod = await import("./boutique.server");
  if (!(await mod.hasStudioSession())) {
    return { uniqueVisitors: 0, pageViews: 0, cartAdds: 0, whatsappOrders: 0 };
  }
  return mod.getStats();
});

export const getOrderIntents = createServerFn({ method: "GET" }).handler(async () => {
  const mod = await import("./boutique.server");
  if (!(await mod.hasStudioSession())) return [] as OrderIntent[];
  return mod.listOrderIntents();
});

export const getStudioStatus = createServerFn({ method: "GET" }).handler(async () => {
  const mod = await import("./boutique.server");
  return mod.studioStatus();
});

export const unlockStudio = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    const mod = await import("./boutique.server");
    return mod.unlockStudio(data.password);
  });

export const lockStudio = createServerFn({ method: "POST" }).handler(async () => {
  const mod = await import("./boutique.server");
  return mod.lockStudio();
});

export const saveBoutique = createServerFn({ method: "POST" })
  .validator(z.object({ state: z.unknown() }))
  .handler(async ({ data }) => {
    const mod = await import("./boutique.server");
    await mod.requireStudio();
    const { normalizeBoutique } = await import("./catalog");
    return mod.saveBoutiqueState(normalizeBoutique(data.state));
  });

export const changeStudioPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      current: z.string().min(1).max(120),
      next: z.string().min(4).max(120),
    }),
  )
  .handler(async ({ data }) => {
    const mod = await import("./boutique.server");
    return mod.changePassword(data.current, data.next);
  });

export const recordVisit = createServerFn({ method: "POST" })
  .validator(z.object({ visitorKey: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const mod = await import("./boutique.server");
    return mod.recordVisit(data.visitorKey);
  });

export const recordCartAdd = createServerFn({ method: "POST" }).handler(async () => {
  const mod = await import("./boutique.server");
  return mod.recordCartAdd();
});

export const recordOrderIntent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      cartKey: z.string().min(1).max(80),
      items: z.array(
        z.object({
          productId: z.string(),
          name: z.string(),
          qty: z.number().int().positive(),
          unit: z.number().nonnegative(),
        }),
      ),
      total: z.number().nonnegative(),
    }),
  )
  .handler(async ({ data }) => {
    const mod = await import("./boutique.server");
    return mod.recordOrderIntent(data);
  });

export const hideOrderedProducts = createServerFn({ method: "POST" })
  .validator(z.object({ ids: z.array(z.string()).min(1), intentId: z.string() }))
  .handler(async ({ data }) => {
    const mod = await import("./boutique.server");
    const state = await mod.hideProducts(data.ids);
    await mod.markIntentHidden(data.intentId);
    return state;
  });

export type { BoutiqueState, BoutiqueStats, OrderIntent };
