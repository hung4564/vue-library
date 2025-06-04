/**
 * Kết hợp filter cũ với điều kiện ['==', '$type', 'LineString']
 * @param oldFilter Filter cũ (có thể null)
 * @returns Filter mới đã kết hợp
 */
export function combineWithLineStringType(oldFilter: any[] | null): any[] {
  const newCondition = ['==', '$type', 'LineString'];

  if (!oldFilter) {
    return newCondition;
  }

  if (Array.isArray(oldFilter) && oldFilter[0] === 'all') {
    // Đã là 'all', chỉ cần thêm điều kiện mới
    return [...oldFilter, newCondition];
  }

  // Chưa phải 'all', kết hợp lại
  return ['all', oldFilter, newCondition];
}
