import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getBoutique } from "@/lib/boutique-api";
import { SEED_STATE } from "@/lib/catalog";
import type { BoutiqueState } from "@/lib/types";

const BoutiqueContext = createContext<BoutiqueState>(SEED_STATE);

export function AppQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 8_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function BoutiqueProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["boutique"],
    queryFn: () => getBoutique(),
    placeholderData: SEED_STATE,
  });
  const value = query.data ?? SEED_STATE;
  return <BoutiqueContext.Provider value={value}>{children}</BoutiqueContext.Provider>;
}

export function useBoutique() {
  return useContext(BoutiqueContext);
}

export function useBoutiqueQuery() {
  return useQuery({
    queryKey: ["boutique"],
    queryFn: () => getBoutique(),
    placeholderData: SEED_STATE,
  });
}

export function useInvalidateBoutique() {
  const client = useQueryClient();
  return useMemo(
    () => ({
      refresh: async (state?: BoutiqueState) => {
        if (state) client.setQueryData(["boutique"], state);
        await client.invalidateQueries({ queryKey: ["boutique"] });
        await client.invalidateQueries({ queryKey: ["boutique-stats"] });
        await client.invalidateQueries({ queryKey: ["order-intents"] });
      },
    }),
    [client],
  );
}
