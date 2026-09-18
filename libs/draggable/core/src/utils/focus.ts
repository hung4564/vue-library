const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const INERT_MARK = 'data-draggable-inert';
const MODAL_COUNT = 'data-draggable-modal-count';

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

/** Restore focus to a previously focused element (e.g. after closing a dialog/menu). */
export function restoreFocus(el: HTMLElement | null | undefined) {
  if (!el || typeof el.focus !== 'function') return;
  try {
    el.focus();
  } catch {
    // Element may have been removed from the document.
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

/**
 * When a modal opens, mark siblings under `.draggable-root` as inert
 * (and `aria-hidden`) so assistive tech skips background UI.
 * Pass the modal layer node (or any descendant of the root).
 * Nested open/close is reference-counted.
 */
export function setModalSiblingsInert(
  modalLayerOrDescendant: HTMLElement | null | undefined,
  active: boolean,
) {
  if (!modalLayerOrDescendant) return;
  const root =
    modalLayerOrDescendant.closest('.draggable-root') ||
    modalLayerOrDescendant.parentElement;
  if (!root || !(root instanceof HTMLElement)) return;

  const current = Number(root.getAttribute(MODAL_COUNT) || '0');
  const next = Math.max(0, current + (active ? 1 : -1));
  if (next > 0) {
    root.setAttribute(MODAL_COUNT, String(next));
  } else {
    root.removeAttribute(MODAL_COUNT);
  }

  const shouldInert = next > 0;
  Array.from(root.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    if (child.classList.contains('draggable-modal-layer')) return;
    if (shouldInert) {
      child.setAttribute('inert', '');
      child.setAttribute('aria-hidden', 'true');
      child.setAttribute(INERT_MARK, '1');
    } else if (child.getAttribute(INERT_MARK) === '1') {
      child.removeAttribute('inert');
      child.removeAttribute('aria-hidden');
      child.removeAttribute(INERT_MARK);
    }
  });
}
