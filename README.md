This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backend

Listings, sign-in and photos use Supabase (tables prefixed `tm_`, applied in order from `supabase/migrations/` (0001 to 0010)).
Sign-in is an emailed magic link; add `https://tristatemarketplace.vercel.app/**` (and `http://localhost:3000/**`) to Supabase Auth > URL Configuration > Redirect URLs.
Optional env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (public defaults are built in).
Remove the demo listings with `delete from public.tm_listings where is_demo;`.

Features: category browsing, search, price filter and sort (database-side via `price_value`), 48-per-page paging, photo gallery, save, buyer-seller messaging, reporting with moderator review (`tm_admins`), Sold badge (owners mark listings sold from Account), and a Share button.

Featured listings: owners press Feature in Account (7 days, pinned to the top of page 1 with a Featured badge). Sample mode is on by default (free, `tm_settings.featured_demo = 'on'`). To charge: set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` (and optionally `FEATURE_PRICE_CENTS`, default 500) in Vercel, point a Stripe webhook for `checkout.session.completed` at `/api/stripe-webhook`, then run `update tm_settings set value = 'off' where key = 'featured_demo';`.
