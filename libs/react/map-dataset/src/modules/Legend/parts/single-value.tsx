export function LayerLegendSingleText({ value }: { value?: { text: string; value: string } }) {
  const item = value || { text: '', value: '' };
  return (
    <div className="legend-item">
      <div>{item.text}:</div>
      <div>{item.value}</div>
    </div>
  );
}
