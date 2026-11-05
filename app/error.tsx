"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap">
      <div className="empty">
        <strong>We hit a snag</strong>
        <span>Something went wrong on our side. Please try again in a moment.</span>
        <div className="next-row"><button type="button" className="btn" onClick={reset}>Try again</button><Link href="/" className="btn btn-ghost">Back to home</Link></div>
      </div>
    </main>
  );
}
