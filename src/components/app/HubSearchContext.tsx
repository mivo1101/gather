"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type HubSearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const HubSearchContext = createContext<HubSearchContextValue | null>(null);

/** Shared search query for Home / Templates hub chrome and list filtering. */
export function HubSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return (
    <HubSearchContext.Provider value={value}>
      {children}
    </HubSearchContext.Provider>
  );
}

export function useHubSearch() {
  const ctx = useContext(HubSearchContext);
  if (!ctx) {
    throw new Error("useHubSearch must be used within HubSearchProvider");
  }
  return ctx;
}
