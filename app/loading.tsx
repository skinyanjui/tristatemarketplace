export default function Loading() {
  return (
    <main className="wrap" aria-busy="true" aria-label="Loading listings">
      <div className="count">Loading listings</div>
      <div className="grid">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="skel skel-card" />
        ))}
      </div>
    </main>
  );
}
