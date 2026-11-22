/**
 * Split local Export UI overrides for RegistryItem (same idea as AT
 * `cellComponent` / `resolveAttributeTableComponentRef`):
 * - `string` → Registry `componentKey`
 * - otherwise → framework component as `defaultComponent`
 */
export function resolveGeoExportComponentRef(value: unknown): {
  componentKey?: string;
  defaultComponent?: unknown;
} {
  if (value == null || value === '') return {};
  if (typeof value === 'string') {
    const key = value.trim();
    return key ? { componentKey: key } : {};
  }
  return { defaultComponent: value };
}

/**
 * Resolve a form/loading slot with precedence:
 * 1. Local override (`formComponent` / `loadingComponent`) — string or component
 * 2. Global `GEO_EXPORT_COMPONENT_KEY.*` via UniversalRegistry
 * 3. Built-in adapter default
 *
 * Local **component** skips the global key so a map-level registry entry
 * cannot override an explicit per-dataset component.
 */
export function resolveGeoExportUiSlot(
  local: unknown,
  globalKey: string,
  builtin: unknown,
): {
  componentKey?: string;
  defaultComponent?: unknown;
} {
  const ref = resolveGeoExportComponentRef(local);
  if (ref.componentKey) {
    return {
      componentKey: ref.componentKey,
      defaultComponent: builtin,
    };
  }
  if (ref.defaultComponent != null) {
    return { defaultComponent: ref.defaultComponent };
  }
  return {
    componentKey: globalKey,
    defaultComponent: builtin,
  };
}
