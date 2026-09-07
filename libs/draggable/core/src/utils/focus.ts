const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
  );
}

/** Focus the first focusable element inside root, or root itself. */
export function focusFirst(root: HTMLElement) {
  const focusables = getFocusableElements(root);
  const target = focusables[0] || root;
  if (typeof target.focus === 'function') {
    target.focus();
  }
}

/**
 * Trap Tab / Shift+Tab inside root. Call from a keydown listener when key is Tab.
 * Returns true if the event was handled.
 */
export function trapTabKey(root: HTMLElement, event: KeyboardEvent): boolean {
  if (event.key !== 'Tab') return false;
  const focusables = getFocusableElements(root);
  if (focusables.length === 0) {
    event.preventDefault();
    if (typeof root.focus === 'function') root.focus();
    return true;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (event.shiftKey) {
    if (active === first || active === root) {
      event.preventDefault();
      last.focus();
      return true;
    }
  } else if (active === last) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}
