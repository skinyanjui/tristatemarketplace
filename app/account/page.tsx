import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = { title: "Account" };

export default function Account() {
  return (
    <main className="form" style={{ maxWidth: 1120 }}>
      <h1>Account</h1>
      <AccountPanel />
      <p><Link href="/saved">Looking for your saved items? They are on the Saved page.</Link></p>
    </main>
  );
}
