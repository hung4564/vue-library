/** Shared DOM class/role expectations for Vue↔React dataset UI parity smoke. */
export const DOM_PARITY = {
  layerLeaf: { itemClass: 'draggable__item', role: 'treeitem' },
  createForm: { formClass: 'form-container' },
  draftTable: { tableClass: 'draft-items-table' },
} as const;
