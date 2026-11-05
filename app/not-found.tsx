import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap">
      <div className="empty">
        <strong>We could not find that page</strong>
        <span>The listing may have been sold, expired or removed.</span>
        <div className="next-row"><Link href="/" className="btn">Browse all listings</Link><Link href="/post" className="btn btn-ghost">Post a listing</Link></div>
      </div>
    </main>
  );
}
