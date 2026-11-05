"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap">
      <div className="empty">
        <strong>We hit a snag</strong>
        <span>Something went wrong on our side. Please try again in a moment.</span>
        <button type="button" className="btn" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
