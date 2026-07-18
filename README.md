# Rutabien

"Every step, mapped." A web app helping non-EU international students navigate moving to Barcelona — visas, document tracking, sworn translation referrals, legal referral, and post-arrival settling-in guidance.

See [CLAUDE.md](./CLAUDE.md) for architecture/product principles, and [MVP_Draft.md](./MVP_Draft.md) for the full product spec.

## Stack

Next.js (App Router) · Drizzle ORM + Neon Postgres · Resend · Cloudflare R2 · Stripe (test mode) + PayPal (sandbox)

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.local` and fill in real values — see inline comments for what each key is for. Nothing runs against real payment/storage providers without them.

## Database

```bash
npm run db:generate   # generate a migration from schema changes
npm run db:push       # push schema to the database
npm run db:studio     # browse the database
npm run db:seed:nigeria  # seed draft Nigeria requirements content (signedOff: false)
npm run db:seed:admin    # create an admin user from SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD
```
