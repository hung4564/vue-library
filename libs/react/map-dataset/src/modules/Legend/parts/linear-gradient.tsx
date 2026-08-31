export function LayerLegendLinearGradient({
  value,
}: {
  value?: {
    text: string;
    items: { color: string; value: string }[];
  };
}) {
  const item = value || { text: '', items: [] };
  const colors = item.items.map((x) => x.color);
  return (
    <div className="legend-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div>{item.text}:</div>
      <div
        className="legend-item-color"
        style={{
          width: '100%',
          background: `linear-gradient(to right, ${colors.join(',')})`,
        }}
      />
    </div>
  );
}
