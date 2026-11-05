# Tristate Market

Local classifieds for the Evansville tristate: cars, real estate, land, livestock, garage sales, events and 18 more categories.

Built with Next.js 16 (App Router), TypeScript and plain CSS. Design follows Apple's Human Interface Guidelines: system font, blue accent, light and dark mode, and a bottom tab bar on phones.

## Run it

Needs Node 24.22.1 or newer.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## What works today

- Browse a full-width grid of listings, filter by category, search from the nav
- Listing details page, with an illustration per category when a listing has no photo
- Save listings (kept in the browser for now)
- Post-a-listing form (saves a draft only)

## Next

Listings currently come from `lib/seed.ts` through `lib/listings.ts`. Sign-in, real posting with photo upload, and saved listings need a Supabase project; the schema is ready in `supabase/migrations/0001_init.sql` and has not been applied yet.
