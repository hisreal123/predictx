import type { FixtureFilters } from "./types";

/** Centralised query keys so invalidation stays consistent. */
export const queryKeys = {
  me: ["me"] as const,

  fixtures: {
    all: ["fixtures"] as const,
    list: (filters: FixtureFilters = {}) => ["fixtures", "list", filters] as const,
    detail: (id: number) => ["fixtures", "detail", id] as const,
    prediction: (fixtureId: number) => ["fixtures", "prediction", fixtureId] as const,
  },

  saved: {
    all: ["saved"] as const,
    list: () => ["saved", "list"] as const,
  },

  subscriptions: {
    all: ["subscriptions"] as const,
    list: () => ["subscriptions", "list"] as const,
  },

  shared: (token: string) => ["shared", token] as const,

  admin: {
    all: ["admin"] as const,
    predictions: (page = 1) => ["admin", "predictions", page] as const,
  },
} as const;
