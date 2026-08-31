export function LayerLegendSingleColor({ value }: { value?: { text: string; color: string } }) {
  const item = value || { text: '', color: '' };
  return (
    <div className="legend-item">
      <div>{item.text}:</div>
      <div className="legend-item-color" style={{ background: item.color }} />
    </div>
  );
}
