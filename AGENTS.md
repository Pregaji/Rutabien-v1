# Working Conventions — Rutabien

For product/business context, see `CLAUDE.md` and the source docs (`MVP_Draft.md`, `Rutabien_Pitch_and_Brand.md`, `Rutabien_Design_Brief_1.md`) at the repo root. This file is about *how* to work in this repo, not *what* to build.

## Session discipline
- This is a large, multi-phase build. Follow the phase order in `MVP_Draft.md`'s build-status section unless told otherwise — foundation (schema, auth, storage) before product logic (Requirements table, intake tree, roadmap generation) before monetization (paywalls, checkout) before retention (reminders, admin dashboard, Bienvenido, live support).
- Don't jump ahead to a later phase's UI work if an earlier phase's foundation isn't confirmed working. Flag it and ask, rather than building on an assumed-but-unverified foundation.
- At the start of a session, briefly state which phase/item you're picking up, so it's easy to track progress against the MVP doc's build-status checklist.

## When to ask before proceeding
- Any change to payment/checkout logic — confirm sandbox mode stays on
- Any change to the Requirements table schema or Nigeria content — this has real legal-accuracy stakes
- Any deviation from the HTML prototypes' visual design — the design work is already approved, don't improve on it unprompted
- Anything touching document storage/encryption/access control — this is the highest-liability part of the product
- Adding any new third-party service not already named in `CLAUDE.md`

## Code conventions
- Match the existing Mindshift project structure and conventions (Next.js app router, Drizzle schema patterns, component organization) rather than introducing a new structure
- Keep the Requirements table (content) and per-user tracking tables (Users/Documents/Progress) in clearly separate schema files — this separation is a deliberate architectural decision, not incidental
- Every checkout/payment surface should share one pricing-display component/pattern (full total shown before commit) rather than each screen implementing its own version

## Testing priorities, given what's actually at risk
- Auth flow (link expiry, single-use enforcement, step-up verification) — this protects real passport/financial data, test thoroughly before considering it done
- Decision-tree intake branching — a wrong branch shows a user an entirely incorrect roadmap, which is a real-world harm, not just a UX bug
- Requirements-table queries — confirm a Nigeria/non-EU/new-applicant user gets exactly the Nigeria-specific content, and every other nationality gets general guidance only, never silently wrong specifics

## What "done" means for any given screen/feature
Cross-check against the relevant row in `MVP_Draft.md`'s feature table before marking something complete — most features have specific constraints attached (e.g. the paywall must show pricing clarity, the vault must never merge to PDF, live support must respect the operational-only boundary) that aren't obvious from the screen alone.
