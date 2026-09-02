export function LayerLegendSingleColor({
  value,
}: {
  value?: { text: string; color?: string; value?: string };
}) {
  const item = value || { text: '', color: '', value: '' };
  return (
    <div className="legend-item">
      <div className="legend-text">{item.text}:</div>
      <div
        className="legend-item-color"
        style={{ background: item.color || '' }}
      />
      <div className="legend-value">{item.value}</div>
    </div>
  );
}
