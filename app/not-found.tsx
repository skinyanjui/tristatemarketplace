import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap">
      <div className="empty">
        <strong>We could not find that page</strong>
        <span>The listing may have been sold, expired or removed.</span>
        <Link href="/" className="btn">Browse all listings</Link>
      </div>
    </main>
  );
}
