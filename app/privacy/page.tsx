import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <Prose title="Privacy" updated="November 5, 2026">
      <p>A plain-language summary of what we collect and why. It is not legal advice.</p>
      <h2>What we collect</h2>
      <p>Your email address when you sign in, the listings and photos you post, and messages you send to sellers. Saved listings stay in your browser on your device.</p>
      <h2>How it is used</h2>
      <p>To run the site: sign you in, show your listings, and deliver messages. A seller sees the email address of anyone who messages them. We do not sell your data.</p>
      <h2>What is public</h2>
      <p>Listings, their photos, location text and the seller&apos;s display name are public. Do not put private information in a listing.</p>
      <h2>Service providers</h2>
      <p>The site is hosted on Vercel and stores data with Supabase, which also sends sign-in emails.</p>
      <h2>Your choices</h2>
      <p>You can delete your listings from your account at any time. To have your account and messages removed, contact the site owner.</p>
    </Prose>
  );
}
