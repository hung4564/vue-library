export function ExportGeoLoading() {
  return (
    <p className="export-geo__loading" role="status" aria-live="polite">
      Preparing download…
      <style>{`
        .export-geo__loading {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.85;
        }
      `}</style>
    </p>
  );
}
