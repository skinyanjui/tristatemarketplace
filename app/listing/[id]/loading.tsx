export default function Loading() {
  return (
    <main className="dwrap" aria-busy="true" aria-label="Loading listing">
      <div className="dgrid">
        <div className="skel" style={{ aspectRatio: "16 / 10" }} />
        <div className="skel" style={{ height: 240 }} />
      </div>
    </main>
  );
}
