export function LayerLegendSingleText({
  value,
}: {
  value?: { text: string; value: string };
}) {
  const item = value || { text: '', value: '' };
  return (
    <div className="legend-item">
      <div className="legend-text">{item.text}:</div>
      <div className="legend-value">{item.value}</div>
    </div>
  );
}
