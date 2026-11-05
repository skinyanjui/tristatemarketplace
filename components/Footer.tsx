import Link from "next/link";

export function Footer() {
  return (
    <footer className="foot">
      <nav aria-label="Footer">
        <Link href="/safety">Safety tips</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/credits">Photo credits</Link>
      </nav>
      <p>© 2026 Tristate Market · Listings are posted by members</p>
    </footer>
  );
}
