/** Attr bag for registry-mounted components (may hold live objects, not only JSON). */
export type ComponentType = {
  componentKey: string;
  attr?: Record<string, unknown>;
};
