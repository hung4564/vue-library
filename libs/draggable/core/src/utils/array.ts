export function checkIsLast(popup_id: string, items: string[]) {
  if (items.length < 1) return false;
  return items[items.length - 1] == popup_id;
}
export function checkIsFirst(popup_id: string, items: string[]) {
  if (items.length < 1) return false;
  return items[0] == popup_id;
}
