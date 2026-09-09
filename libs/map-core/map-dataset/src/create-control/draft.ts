/** Persist CreateControl draft in sessionStorage (client-only). */

export const CREATE_CONTROL_DRAFT_PREFIX = 'hungpvq.map-create-draft:';

export type CreateControlDraft = {
  activeDataTab?: string;
  name?: string;
  crs?: string;
  type?: string;
  updatedAt?: number;
};

export function createControlDraftKey(mapId: string): string {
  return `${CREATE_CONTROL_DRAFT_PREFIX}${mapId || 'default'}`;
}

export function loadCreateControlDraft(mapId: string): CreateControlDraft | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(createControlDraftKey(mapId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreateControlDraft;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCreateControlDraft(
  mapId: string,
  draft: CreateControlDraft,
): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(
      createControlDraftKey(mapId),
      JSON.stringify({ ...draft, updatedAt: Date.now() }),
    );
  } catch {
    // quota / private mode
  }
}

export function clearCreateControlDraft(mapId: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(createControlDraftKey(mapId));
  } catch {
    // ignore
  }
}
