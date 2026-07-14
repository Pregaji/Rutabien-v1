# Design Brief: Rutabien — Web App (v1)

## What this is
A web app that helps international students moving to Barcelona navigate visas, contracts, and paperwork. Users answer a short questionnaire and get a personalized roadmap of what to do, in what order, by when — then can book a paid consult with a lawyer when their case needs real legal help.

## Brand
- **Name:** Rutabien (from Spanish "ruta" = route + "bien" = well/good)
- **Tagline:** "Every step, mapped."
- **Tone:** Clear, calm, and organized — not corporate/legal-stiff, not overly playful either. Think "a friend who's already done this and made you a checklist," not "a law firm's website."
- **Color palette (revised for a premium feel):** the warmth is right, but premium comes from restraint, not more color. Deepen and narrow the palette:
  - **Primary structural color:** Deep navy-teal, `#1B3A3E` (darkened from the original `#2B5B5E`) — used for backgrounds, headers, and navigation. This carries most of the interface, not the accent color.
  - **Single accent color, used sparingly:** Terracotta `#D4562E` — reserved for primary CTAs, key highlights, and the logo's path motif only. Not spread across multiple UI elements or repeated decoratively.
  - **Base/background neutral:** Warm off-white or stone, `#F5F2EC` (shifted from the original cream `#F7F1E8` toward something less pastel, more neutral-premium) — true cream tones reserved for small accent moments only, not large surfaces.
  - **Text and structure:** A genuine charcoal/near-black, `#1A1F24` (deepened from `#22303C`) for primary text — most premium interfaces are quiet in their bones, with color appearing only in a few deliberate places against a confident neutral base.
  - **What changed and why:** the original palette was warm but evenly distributed across multiple colors, which reads more "friendly consumer app" than "serious institution." Premium fintech/legal UI work (referenced from current Behance/Dribbble work) tends toward deep, muted bases with one restrained accent, generous whitespace, and subtle depth (soft shadows, layered cards) rather than flat, evenly saturated blocks.
- **Typography feel:** Serif for headlines (trustworthy, a little gravitas — this touches legal/bureaucratic topics), clean sans-serif for body text and UI elements. This pairing was already right — no change needed, it matches the premium direction.
- **Layout principles for a premium feel:** more whitespace than feels natural at first, fewer competing visual elements per screen, restrained use of icons/illustration over any stock photography, soft shadows for card depth rather than flat color blocks or heavy borders.
- **Logo motif:** a winding path leading to a destination pin — literal visual metaphor for "the route, mapped."

## Target user
Non-EU international students, arriving in Barcelona for the first time, likely anxious about visa deadlines and unfamiliar with Spanish bureaucracy. Comfortable with English-language interfaces (may not read Spanish). Using this mostly on a laptop before arrival, possibly on mobile after.

## Screens needed (web, v1)

1. **Landing page**
 - Hero section: headline + tagline, single clear CTA ("Get my roadmap")
 - Brief trust-building section: what the platform does, in 3 short points (understand your visa path / track your documents / talk to a real lawyer when needed)
   - Include a visible pricing signal (e.g. "Free roadmap, no card required") — competitors in this space are concierge-style services that hide all pricing behind bespoke quotes, so transparency is a real differentiator worth surfacing immediately
   - Optional: a short, non-snarky contrast line — e.g. "See your personalized roadmap in minutes. Talk to a lawyer only when you actually need one." This implicitly answers "why not just hire a relocation concierge" without naming any competitor
 - No login wall — CTA leads straight into the questionnaire

2. **Intake questionnaire (multi-step)**
 - One question per screen/step, progress indicator at top
 - Questions: nationality, purpose (study/study+work/renewing), acceptance letter status, current NIE status, arrival/expiry dates, part-time work plans, housing status, email
 - Clean, form-forward design — large inputs, clear "Next/Back" navigation

3. **Roadmap (core screen)**
 - Personalized, generated after questionnaire
 - Timeline/checklist layout: each step as a card with title, due-by date, expandable detail (what it is, required documents, official link), and status (not started/in progress/done)
 - This is the single most important screen — give it the most design attention

4. **Document checklist**
 - Grouped by roadmap step, simple checkboxes
 - Progress indicator ("4 of 11 ready")
 - Tapping/clicking an item shows a short explainer

5. **Upgrade / unlock moment (revenue touchpoint #1)**
 - The free roadmap shows the full list of steps at a glance, but detail/document tracking beyond the first 1–2 steps is gated behind the platform fee (flat one-time fee or low monthly, per the business model doc)
 - Simple, non-aggressive paywall card: "Unlock your full roadmap + document tracking — €[X]"
 - This is the layer currently missing from the product flow even though it's core to the revenue model — without it, the only monetization moment is the lawyer referral at the end, which undersells the business

6. **"Talk to a lawyer" moment (revenue touchpoint #2)**
 - Triggered contextually from specific roadmap steps flagged as needing legal help
 - Card-style: photo, name (Ida Quintián Pacheco), one-line credential, clear "Book a consult" CTA
 - Should feel like a natural next step, not an ad or upsell
 - This is the screen where "you're not alone" warmth matters most — a self-serve tool can otherwise feel colder than a concierge-style human service, so make this moment feel personally reassuring (real photo, real name, real credential — not a generic "our team" placeholder)
 - **Booking mechanism:** links to a dedicated scheduling page (e.g. a business Calendly) that Ida sets up and controls herself — showing only hours she's opened for these consults. Do not link directly to her personal Google Calendar or Meet — that exposes her actual schedule and isn't her decision to have made for her. This needs to be confirmed with Ida directly, not assumed.

7. **Returning-user access (student-facing)**
 - **Not bookmark-dependent.** A simple "Access your roadmap" page where the user enters their email, and a fresh access link is emailed to them on demand — works from any device, any time, no reliance on remembering to save a link.
 - After payment, the receipt/confirmation email itself includes the roadmap link directly, so there's no gap between "I just paid" and "here's how I get back in."
 - Once accessed, shows: roadmap progress summary, document checklist shortcut, persistent (non-intrusive) lawyer CTA

8. **Admin dashboard (internal — for you and Ida, not students)**
 - This is a separate, properly authenticated tool (real login) — distinct in tone and purpose from the rest of the app. Can be more utilitarian/data-dense; doesn't need the same warmth as the student-facing screens.
 - **Main view:** table/list of all users — name, case type, roadmap progress %, payment status (unlocked/not), documents outstanding count
 - **Filters:** by case type, by status, by date joined
 - **Flag system:** visually distinct marker for cases flagged as needing legal escalation — this is the queue Ida would check
 - **Individual user view:** click into any user to see their full roadmap progress, uploaded documents (viewable/downloadable), and contact info
 - Keep this simple and functional for v1 — a clean table-based layout is fine, this doesn't need the same design polish as the student-facing product

## What to avoid
- Anything that reads as a law firm's website (stiff, text-heavy, intimidating) — applies to the student-facing screens; the admin dashboard can be more plainly functional
- Dark patterns or urgency tactics on the "talk to a lawyer" screen
- Overly playful/startup-generic illustration style — this deals with real anxiety around visas and money, so warmth should read as "organized and calm," not "cute"

## Reference point
No password-based accounts for students in v1 — instead, each user is identified by their email and a secure access token. Rather than relying on the user bookmarking a link (a real trust gap once payment is involved — no one bookmarks a page they've just paid money into with confidence), returning access works via **email re-entry on demand**: the user types their email on an "Access your roadmap" page and a fresh link is sent immediately, from any device, any time. Payment confirmation emails include the access link directly, so there's never a moment of "I paid, now what?" This is the passwordless pattern used by Slack, Notion, and similar products — no signup friction, but a trustworthy, repeatable way back in. The admin dashboard is the one place that does need real password authentication, since it exposes every user's personal data in one view. Keep the overall build lean; this is a v1 meant to validate demand, not a fully-featured platform yet.
