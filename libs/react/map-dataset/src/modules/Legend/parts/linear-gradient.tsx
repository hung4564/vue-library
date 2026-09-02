export function LayerLegendLinearGradient({
  value,
}: {
  value?: {
    text: string;
    items: { color: string; value: string }[];
  };
}) {
  const item = value || { text: '', items: [] as { color: string; value: string }[] };
  const items = item.items || [];
  const colors = items.map((x) => x.color);
  return (
    <div className="legend-item legend-item--column">
      <div className="legend-text">{item.text}:</div>
      <div className="legend-value-container">
        {items.map((entry, i) => (
          <div className="legend-value" key={i}>
            {entry.value}
          </div>
        ))}
      </div>
      <div>
        <div
          className="legend-item-color"
          style={{
            background: `linear-gradient(to right,${colors.join(',')})`,
          }}
        />
      </div>
    </div>
  );
}
