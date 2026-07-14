# MVP Draft — Rutabien

*"Every step, mapped."*

*(Full brand rationale — name, mission, values — is in the companion Pitch & Brand document. This doc covers product scope only.)*

## 0. Build status — living checklist

Kept current as prototyping progresses. Split into three tiers: what's actually built, what's UI-only (needs a real backend), and what's not started.

**✅ Built (in the desktop + mobile HTML prototypes):**
- Six core screens: landing, questionnaire, roadmap, documents, lawyer, admin
- Nationality-gated content — confirmed Nigeria-specific detail (legalization chain, IPREM note) only triggers when nationality = Nigeria; every other nationality gets general guidance, so the product isn't Nigeria-only
- Per-document file attach on every roadmap document
- Translation flow: tiered pricing (1–3 docs €35 / 4–6 €55 / 7+ €80), delivery choice (download vs. post +€12), demo checkout, demo "mark as delivered" step
- Consulate directory link

**🔧 UI built, needs a real backend before launch:**
- All checkout/payment flows (currently demo only — see payment method + paywall clarity notes below)
- The "mark as delivered" translation status (currently manual/demo)

**❌ Not yet started:**
- EU/EEA and new-vs-returning as explicit first gating questions in the intake flow (nationality gating exists; confirm these two are also built as separate branches, not just nationality alone)
- Passwordless email re-entry ("Access your roadmap" page) — screens currently likely navigate directly to each other rather than through the real return-access mechanism
- Platform fee paywall/unlock screen (revenue touchpoint #1) — see clarity note below, this needs a redesign pass regardless
- Document validity/expiry windows on the Documents screen
- Lawyer screen framing — verify it leads with "Rutabien's Legal Partner" as the headline, with Ida as supporting detail, not the reverse (flagged earlier as a real risk if the relationship with Ida ever ends)
- Family member (SLF) branch in intake and roadmap
- On-screen indemnification disclaimer near the roadmap/document checklist (distinct from the T&Cs)
- The two-tier Requirements table as an actual data structure (global IPREM/EU rules + nationality-specific overlays) — currently prototype content, not a real backend schema
- Real payment processing, real file storage/encryption, real automated reminders, real admin dashboard wired to live data
- **Live support — confirmed built on mobile (routes to Ida), not yet mirrored on desktop.** Correction from earlier status: this exists already, not fully missing. Still needed: the same icon/entry point on desktop, and confirmation it offers both a livechat (operational) option and the Ida route (legal escalation) — not just one path. Also needs to extend into the Bienvenido/post-arrival phase once that screen is built, with the same operational-only boundary applying there too.
- **Document Vault** — persistent, folder-organized (never merged into one PDF), batch or individual download
- **Bienvenido arrival guide** — static content, auto-surfaces near stated arrival date (SIM, transport, currency exchange, safety notes)
- Hardened auth specifics: expiring/single-use links, real sessions, step-up verification before viewing/downloading documents
- Full decision-tree intake logic (9-question branching structure — see section 4) with a dynamic progress indicator reflecting each user's actual path length

**Business/legal, not prototype work, but blocking real launch:**
- The Ida meeting (equity split, referral commission on legal fees *and* translation fees, exit/non-solicit terms)
- An actual named, MAEC-accredited translator partner — prototype currently says "our translation team" with no real partner behind the pricing yet
- T&Cs draft (indemnification, refund policy, document rejection/reapplication policy, data retention/erasure)
- Housing fee model — unresolved pending Ida's input
- Additional nationalities beyond Nigeria — still "general guidance" only

## 0a. Everything blocked on the Ida meeting — consolidated

Pulled from every Ida-dependent item scattered through this document, so nothing gets missed while building in parallel. You can build UI and architecture around all of these — none of them block engineering — but **none of these should go live to real users until resolved:**

1. Equity split, referral commission on legal fees *and* translation fees, exit/non-solicit terms — the core meeting agenda
2. T&Cs draft (indemnification language, refund policy, document rejection/reapplication policy, data retention/erasure) — Ida must review before any paid feature launches
3. Housing fee model — percentage-based tenant fee likely violates Spain's 2023 housing law; needs an alternative structure resolved with her
4. Sign-off on every piece of Nigeria roadmap content before it's published (legal accuracy dependency)
5. Confirmation of who handles data-protection/GDPR compliance specifically — may not be her specialty; she may need to point you elsewhere
6. Booking mechanism — she needs to set up and control her own scheduling link (not her personal calendar)
7. Named, MAEC-accredited translator partner identified and formally agreed
8. Ongoing content-maintenance cadence commitment (quarterly review of published requirements)
9. Confirmation on Document Vault retention policy as part of the T&Cs
10. Sign-off on the "Rutabien's Legal Partner" framing (screen leads with the role, not her name specifically) — worth confirming she's comfortable with this positioning, since it's about her too

**What this means practically for building now:** architecture, screens, and logic can all be built with these items represented as placeholders/config (e.g., a Requirements table row structure exists even before Nigeria content is legally signed off; a T&Cs page exists as a draft even before Ida finalizes it). Just don't flip anything to "accepting real payment from real users" until items 1–3 specifically are resolved — those carry real legal and financial risk if launched on assumptions.

## 1. The idea, as I understand it (updated)

**Positioning:** a platform for anyone non-EU moving to Spain — students, researchers, workers — who needs help with three recurring pain points:

- **Immigration** — NIE/TIE applications, renewals, permit changes
- **Employment** — understanding Spanish work contracts before signing
- **Housing** — avoiding scams/bad clauses when renting

**Initial wedge (v1 target market):** international students arriving to study in Barcelona. This is the beachhead — a large, predictable, seasonal inflow (September/January intakes), reachable through universities and student-focused ads, with a narrow and well-understood set of needs (student visa → TIE, first rental contract, sometimes a part-time work permit). Workers and other regions of Spain are the expansion path once the Barcelona student flow is validated, not the v1 focus.

**Pre-arrival scope:** the roadmap should start before the student ever lands in Spain — tracking the embassy-side visa application in their home country, not just post-arrival steps like the TIE. This matters because document requirements vary meaningfully by nationality (which consulate, translation/apostille needs, processing times), so "every step, mapped" should genuinely start at step one, not step five.

**Case-type structure — this is two-dimensional, not one.** It's not just "which visa stage" — it's **stage × student type × nationality/consulate**. Confirmed from real source documents: the actual requirement set (legalization chain, proof-of-funds formula, which documents need translation) varies meaningfully by nationality and consulate, not just by visa stage. A generic "student visa" template would be wrong for most users. The three gating questions, in order:

**Each gate blocks and branches the flow — it isn't just a data field collected for later.** This matters as a concrete design rule: an EU/EEA student answering the first question should not proceed through the same onboarding screens as a non-EU student — they should be routed to an entirely different (much shorter) path immediately, not shown the full non-EU questionnaire with their answer merely stored for filtering afterward. Same logic for new-vs-returning: a returning student shouldn't see pre-arrival, embassy-side questions at all. Each gate is a fork in the road, not a filter applied at the end.

**This principle applies to every question in the intake flow, not just the first two — the full questionnaire is a decision tree, not a fixed list.** Every answer should determine which question comes next; a user should never be shown a question that's already irrelevant given what they've told the platform. The tree:

1. **EU/EEA citizen?** Yes → branch immediately to a short EU registration-guidance flow (separate from the visa questionnaire entirely) → end. No → continue to 2.
2. **New applicant or returning/already in Spain?** Returning → branch to a renewal-specific path (skip all pre-arrival/embassy questions; ask current permit type + expiry date instead → generates a renewal roadmap directly). New → continue to 3.
3. **Nationality** → determines which Requirements-table overlay applies (legalization chain, funds-formula document type, consulate quirks).
4. **Do you have a university acceptance letter yet?** No → branch to a short pre-acceptance guidance screen (what to do before a visa application can even start) rather than continuing into visa-specific questions that don't yet apply. Yes → continue to 5.
5. **Will any family members (spouse/children) be accompanying you?** Yes → collect number/relationship, which activates the SLF (family member) branch in both the questionnaire and the eventual roadmap. No → skip family questions entirely, continue to 6.
6. **Do you plan to work part-time while studying?** Yes → the roadmap later includes the part-time work permit add-on step. No → that step is omitted, not just hidden.
7. **Do you already have housing arranged?** Yes → skip the housing-suggestion feature entirely for this user. No → the roadmap includes the housing-suggestion path (see note on housing fee model, still pending Ida's review).
8. **Arrival date / current permit expiry** → used to calculate every deadline shown on the eventual roadmap.
9. **Email** → generates the access token and starts the passwordless-access record (see section 7).

The roadmap that gets generated at the end is a query against the Requirements table using the *specific path* the user took through this tree — not a generic template filtered afterward.

1. **EU/EEA vs. non-EU/EEA** — EU/EEA students don't need a student visa at all, just an EU citizen registration (Certificado de Registro) after arrival. This has to be the first gate in the intake questionnaire, before nationality is even asked in detail — showing the non-EU visa-application branch to an EU student would be actively wrong, not just irrelevant. An EU/EEA answer should immediately branch to a short, separate registration-guidance flow, not continue into the non-EU questionnaire.
2. **New applicant vs. returning/already-in-Spain student** — a first-timer needs the full pre-arrival visa journey; a returning student needs renewal or status-change flows, which are entirely different in structure (often no consulate involvement at all, since it happens inside Spain). This answer should branch the remaining questions, not just tag the record.
3. **Nationality/consulate** — determines the specific document chain. Confirmed via real source material: Nigeria's requirements include a specific legalization chain (Ministry of Education → Ministry of Foreign Affairs → Spanish Embassy), an IPREM-based funds formula (100% IPREM + 75% for the first accompanying family member + 50% for each additional), and Lagos/Abuja-specific consulate quirks. Other nationalities will have comparably different chains — this isn't a find-and-replace exercise per country.

**Nigeria is the proven pilot.** Real, successfully-used application content already exists — an actual case, not hypothetical — covering the full document set, folder structure, and legalization/translation/notarization requirements per document. This is a genuine asset: the honest v1 scope may be narrower than "Barcelona students" broadly — closer to "Barcelona students from a small number of specific, well-researched nationalities," starting with Nigeria since it's already built and lived-tested, then expanding nationality-by-nationality with the same rigor. Each new nationality's content requires Ida's sign-off before publishing, same as any other roadmap content — see indemnification note in section 5.

The platform is *not* a law firm. It's a guidance + document-tracking layer that helps people understand their situation, then routes them to a real lawyer (Ida, or your future legal partner) when the case needs actual legal work. You build and run the product and marketing; the lawyer handles anything that requires a licensed professional.

**Confirmed:** v1 is Barcelona-only. Spain-wide expansion (other cities, other extranjería offices, worker/family-reunification case types) is the explicit v2+ roadmap, not something to build flexibility for prematurely in v1.

---

## 2. What's IN the MVP

| Feature | What it does | Why it's MVP-worthy |
|---|---|---|
| Intake questionnaire | Starts with 3 gating questions (EU/EEA status, new vs. returning, nationality) before the rest — 8–12 questions total | Classifies the user's case type automatically across all three dimensions — this is the entry point for everything else, and getting the gates wrong sends someone down an entirely incorrect roadmap |
| Personalized roadmap (free preview) | A visual checklist/timeline: what to do, by when, which documents — full list visible, detail on first 1–2 steps free. **Includes pre-arrival steps** (home-country embassy application, nationality-specific document requirements), not just post-arrival. Every step links to the relevant official Spanish government source (exteriores.gob.es, extranjeria.mites.gob.es, or the specific consulate page) alongside the plain-language summary | This is the core "aha" — replaces scattered blog posts and Facebook groups |
| Platform fee unlock | **Two tiers, not one flat fee:** Essential (€39 one-time — roadmap, document tracking, reminders) and Complete (€89, valid 12 months — adds Document Vault, Bienvenido arrival guide, extended live support, priority translation referral). Neither is a recurring subscription — Complete is a single payment covering a fixed 12-month window, not auto-renewing billing. **Must show the total price upfront, in full, before checkout** — see clarity principle below. Payment via **PayPal and credit/debit card** (both, side by side as options — not one hidden behind the other) | **Revenue touchpoint #1** — this was missing from the original flow; without it, the lawyer referral is the only monetization moment, which undersells the layered revenue model. Tiering also solves a real problem: bundling everything into one price under-charged users who wanted the full scope while over-charging users who just wanted the core roadmap |
| Document checklist w/ progress + validity tracking | Checkboxes tied to their case type, part of the paid unlock. Tracks not just uploaded/not-uploaded but **validity windows** — some documents (police certificate, medical certificate) expire before submission even if already uploaded | Low-effort to build, high perceived value. Validity tracking prevents a real failure mode: a document that was valid when uploaded but has since expired |
| Reminders & notifications | Automated emails triggered by the same data already tracked — see full breakdown in section 8 | This is what makes "every step, mapped" true over *time*, not just at the moment someone reads the roadmap. Without this, the roadmap is a one-time snapshot that goes stale the moment the user closes the tab |
| Live support | **Target: 24-hour coverage** (matches user expectation and every competitor's WhatsApp-driven responsiveness) — but v1 realistically means a stated response-time commitment (e.g. "we reply within X hours, every day"), not necessarily instant round-the-clock chat, since that requires either a rotating team across time zones or async ticketing tooling, not one founder's personal hours. Scope stays operational only — explicitly NOT for assessing whether someone's specific documents are sufficient or predicting outcomes, which routes to Ida instead. See scope note in section 5 | Users expect a human option, same as every competitor in this space (Barcelona Buddy, Barcelona Students both lead with WhatsApp support) — but the scope has to be bounded to avoid drifting into unlicensed legal advice, and the coverage promise has to be honest about what one person can deliver at launch |
| "Talk to a lawyer" handoff | One button that books a paid consult with Ida | **Revenue touchpoint #2** — must exist even in v1, even if manual at first |
| "Get this translated" handoff | Triggered directly from the document checklist wherever a document is flagged "Translation: Required" — routes to a partner sworn translator (Traductor-Intérprete Jurado), not performed in-house. **Also available as a standalone entry point** — "Just need a translation?" on the landing page skips the entire intake questionnaire (no nationality, EU/non-EU, or new/returning gates needed) and goes straight to upload → tiered pricing → checkout. Still uses the same passwordless email access pattern for order tracking, but shares no other infrastructure with the roadmap flow | **Revenue touchpoint #3** — referral commission on translation bookings. Must route to an officially MAEC-accredited translator; sworn translation is a protected, licensed profession in Spain, and an unaccredited translation is invalid for visa purposes — see note in section 5. **The standalone path is genuinely the simplest revenue stream to launch** — no Requirements-table dependency, no nationality-specific content, minimal Ida-review overhead compared to roadmap content — and works as a two-way funnel (soft upsell into the full roadmap, and a distinct SEO/discovery angle from the core visa positioning) |
| Document Vault | A persistent, central view of every document ever uploaded — **organized into folders mirroring the proven Folder Arrangement Guide structure, never merged into a single PDF.** Downloadable individually or as a batch (ZIP). Stays accessible after the visa process is "done," until the user chooses to delete it | Solves a real post-arrival need: printing/sending individual documents (to a translator, to Ida, to a landlord) requires them to stay separate, not flattened. Retention needs a stated outer bound for GDPR soundness — see section 5 |
| Bienvenido — arrival guide | Static, editorial content (not a tracked/interactive system) that auto-surfaces near the user's stated arrival date: new SIM card, airport transport to their booked accommodation, currency exchange, practical first-day tips, calm/matter-of-fact safety notes. **Also includes a short section on EOI (Escuela Oficial de Idiomas — Spain's affordable public language school system) and local intercambio/language-exchange groups**, plus one honest, empathetic line acknowledging that language and social adjustment is genuinely hard, not just a logistics checklist item | Closes a known competitive gap cheaply — Barcelona Buddy and Barcelona Students both already offer arrival content. The language/EOI addition and empathetic tone are a low-cost differentiator neither reviewed competitor addresses — real, validated pain confirmed by a widely-engaged Reddit thread on long-term language/integration struggle |
| Live support (extended) | Same chat mechanism as pre-arrival support, but now also covers the Bienvenido/arrival window — SIM confusion, transport questions, general first-day help. Same operational-only boundary applies (see section 5) | **Built on mobile already** (routes to Ida) — needs mirroring on desktop with the same icon/pattern, offering both a livechat option and the Ida-escalation route, plus extending into the Bienvenido screen once that's built |
| Housing suggestions | Guidance on finding accommodation for students without it arranged | **Hold — pending Ida's review.** A percentage-based fee charged to the student/tenant likely conflicts with Spain's 2023 housing law, which requires agency fees on standard long-term leases to be paid by the landlord, not the tenant (see note below). Don't build a specific fee model into the product until this is resolved. |
| Admin dashboard | Properly authenticated (real login) view for you and Ida — all users, case types, progress %, payment status, documents outstanding, legal-escalation flags | Needed from day one — this is how you actually run the business day-to-day, not a v2 nice-to-have |

## 3. What's OUT of the MVP (deliberately deferred)

- Contract clause-explainer (flagging risky contract terms) — valuable, but needs legal review of every clause template before launch; risk of giving de facto legal advice without a lawyer's sign-off
- Housing red-flag checker (contract review tool) — different domain, different data needs, dilutes early focus. Basic housing *suggestions* are now in scope (see feature table above), but the fee model behind it is pending Ida's legal review — see note in section 5.
- Multiple paid subscription tiers — v1 should validate demand with a single flat unlock fee, not a full pricing ladder (the unlock itself is now in scope — see above — just not multiple tiers of it)
- Referral partnerships (banks, insurers, housing platforms) — sequencing problem, no users to refer yet
- **Additional nationalities beyond the pilot** — given the real complexity confirmed in nationality-specific requirements (legalization chains, funds formulas, consulate quirks), each new nationality is a genuine content-development effort requiring Ida's review, not a quick copy-paste. Nigeria launches first; others are added deliberately, one at a time.
- **WhatsApp integration for reminders — confirmed v2.** Automated reminders require the WhatsApp Business API (not the free Business app), which needs a verified Meta Business Manager account, a Business Solution Provider (Twilio, 360dialog, Wati, or similar), Meta-approved message templates for each reminder type, and explicit user opt-in consent (feeds into the T&Cs review). Meta bills per delivered template message at a rate set by the *recipient's* country code, which matters here since users span many home countries during the pre-arrival phase. The volume economics only favor this once sending hundreds of automated messages a day — well beyond MVP scale — so email remains the v1 default. Live support via WhatsApp (student-initiated replies) is actually free under WhatsApp's model even before this is built, so that piece could move faster than the automated-reminder piece if it becomes a priority.
- **Language school referral partnership — named, not built.** Long-term language/social integration is confirmed as a real, significant pain point (widely-engaged Reddit discussion), and Barcelona Students already bundles language-course referrals as a service. Structurally identical to the translator/lawyer referral model if pursued. Deliberately **not** a v1 feature — language learning is a genuinely different core competency from documents/bureaucracy, and building it now would be real scope creep away from the working wedge. Flagged here so it isn't forgotten, not so it gets built.

*(Flag if any of these "deferred" items are actually the ones you consider core — happy to move them.)*

## 4. Core user flow (v1)

1. User lands on site (from an Instagram/Meta ad or UIC referral)
2. Completes intake questionnaire (~3 minutes)
3. Gets an instant, personalized roadmap preview (visual, not a wall of text) — full step list visible, detail gated after step 1–2
4. Pays the platform fee to unlock full roadmap detail and document tracking
5. Can download/save checklist and track progress
6. At any point, sees a clear CTA: "This needs a lawyer — book a consult with Ida" → links to a dedicated scheduling page Ida controls (not her personal calendar — see note below)

## 5. What needs to be true for this to work

- **Legal accuracy**: every roadmap template needs Ida's sign-off before it goes live — this is a hard dependency, not a nice-to-have
- **Indemnification — a standing content practice, not a one-time task.** This is exactly what every serious competitor in this space does explicitly: state plainly that guidance is based on official published requirements, not a guarantee of approval, and that the consulate makes the actual decision. This needs to live in three places, not just the T&Cs: (1) the T&Cs themselves (Ida's review), (2) a visible, plain-language line on the roadmap screen itself near the document checklist, and (3) anywhere a specific number is cited (fund thresholds, processing times) since those are exactly the details that go stale or vary by consulate. Treat this as a standing content rule applied to every roadmap, not a single disclaimer written once.
- **No AI for roadmap content — an explicit product principle, not just a current default.** Given the indemnification stakes above, static, human-authored, Ida-reviewed content is far more defensible than AI-generated per-user guidance that could hallucinate a wrong requirement. Worth writing down now so it doesn't quietly drift later. If AI is ever used for something narrow and low-stakes (e.g. OCR to auto-detect which document was uploaded), that's a utility function, not roadmap-content generation — a clearly different thing.
- **Live support — needs explicit boundaries, not just "add a chat widget."** This is where the "not a law firm" line gets easiest to blur. Live support (you, early on) can help with platform navigation, clarify what a checklist item means, or answer "where do I find X" — operational support. It must **not** assess whether someone's specific documents are sufficient, predict visa outcomes, or give case-specific guidance — that's Ida's lane. This needs a defined, visible escalation trigger (a specific list of question types that route to "book a consult with Ida"), not agent discretion in the moment.
- **Document validity windows, not just upload status.** Confirmed from real source material: several required documents have expiry rules baked in (police certificate ≤3 months old at time of application, similar for medical certificates). The tracker needs to distinguish "uploaded" from "still valid" — a document uploaded months ago may need re-issuing before submission, and the platform should flag this rather than showing a false-positive green checkmark.
- **Content-maintenance process — an ongoing operational cost, not a one-time build task.** Consulate requirements change; Spain's own rules changed again in May 2025 (study-visa applications must now go through home-country consulates only, not from within Spain). Someone needs a recurring cadence (quarterly is a reasonable starting cadence) with Ida to re-verify published roadmap content hasn't gone stale. Worth naming explicitly now so it isn't discovered as a surprise cost later.
- **Language scope**: v1 is being built for English-speaking non-EU students — worth deciding explicitly whether the platform is English-only, since official Spanish source documents and forms are often only bilingual at best (Spanish/Catalan), not English.
- **Terms & Conditions**: needs to be drafted and reviewed by Ida before any paid feature (platform unlock, lawyer booking, housing referral) goes live — this is a prerequisite for launch, not a later cleanup task
- **Housing fee model — needs resolution before building**: Spain's 2023 housing law (Ley por el Derecho a la Vivienda) requires agency/finder's fees on standard long-term residential leases to be paid by the landlord, not the tenant — this applies regardless of whether the landlord is an individual or a company. A flat percentage fee charged to the student would likely violate this. There's a partial carve-out for seasonal contracts (under 11 months), but courts reclassify de facto primary residences as long-term leases regardless of contract label, which is a real risk here since students are living in these places full-time. Alternatives worth discussing with Ida: charging the landlord side instead, charging a flat facilitation fee for the service itself rather than a percentage tied to the rental transaction, or partnering with compliant housing platforms for referral commissions instead of acting as an agent directly. Acting as a real estate intermediary in Catalonia/Spain also typically requires separate professional registration — another reason not to build this without her input.
- **Case-type coverage**: given the stage × student-type × nationality structure above, start with Nigeria as the proven pilot (initial student visa, non-returning, non-EU), then TIE renewal and the returning-student flow, before expanding to additional nationalities — rather than trying to cover every nationality or worker/family-reunification categories on day one
- **Translation partnership — needs a real accredited partner, not an in-house service.** Sworn translation (traducción jurada) for Spanish visa/residency documents is a protected, licensed profession — only a Traductor-Intérprete Jurado accredited by Spain's Ministry of Foreign Affairs (MAEC) can produce a translation Spanish authorities will accept. Rutabien cannot perform this in-house without holding that specific accreditation; it needs a referral partnership with an actual accredited translator, structured the same way as the legal referral with Ida. Also worth building into the roadmap content: documents often need to be apostilled/legalized *before* translation, not after — getting this order wrong invalidates the translation, so this sequencing needs Ida's review same as everything else touching document requirements. The Ministry publishes a public, searchable directory of accredited translators, useful for vetting a partner.
  - **Pricing validated against real market rates:** English-Spanish sworn translation in Barcelona runs €30–70/page or €0.10–0.14/word, with a standard 500-word page typically €40–70+IVA. Rutabien's existing tiers (€35 for 1–3 docs, €55 for 4–6, €80 for 7+) land squarely in this range — no adjustment needed, just confirmed. Rush/24h delivery commands a 30–50% surcharge industry-wide, worth factoring in if an expedited option is ever added.
  - **Outreach shortlist (get quotes, don't commit to the first one):** Ibidem Group (Barcelona, 850+ five-star reviews, full MAEC-accredited team) and CBLingua (Barcelona, agency structure covering multiple languages) are both credible first contacts. Ask each for: per-page rate on the specific document types in the Nigeria checklist (police certificate, academic transcript, birth certificate), whether they'll offer a volume/partner rate for recurring referral business, and confirmation they can meet the promised 2-working-day turnaround. Cross-check any candidate against the official MAEC registry directly to confirm accreditation before formalizing anything.
- **A real handoff mechanism**: a dedicated scheduling link (e.g. a business Calendly Ida sets up and controls herself) counts as MVP — doesn't need to be automated. **Do not link directly to Ida's personal Google Calendar or Meet** — that exposes her actual availability and isn't a decision to make on her behalf. Raise this explicitly with Ida as a discussion point, not an assumption.

## 5a. Pricing clarity — a fix needed now, not a later polish pass

**Pricing model decision: one-time/fixed-window payment, not a recurring subscription — but tiered, not a single flat fee.** This product's value is concentrated in a finite journey (apply → arrive → settle → maybe renew a year later), not continuous daily use the way a subscription needs to justify recurring billing. A monthly charge on a student who logs in a few times and forgets about it risks chargebacks and directly undercuts the trust this product depends on. Recurring revenue still happens naturally — a returning student re-entering the flow for renewal pays again at that point — without needing subscription mechanics to force it.

**Important framing boundary:** pricing must never be justified internally or in marketing as "we ensure your safety" or "we guarantee your outcome" — this directly conflicts with the indemnification language already built into the product (guidance based on official requirements; the consulate makes the actual decision, not Rutabien). What's being charged for is reducing the risk of preventable errors through organization and accurate information — a real, valuable thing — not bearing responsibility for the outcome itself. This distinction protects both the pricing logic and the legal position.

**Confirmed structure: two tiers, not one number.**
- **Essential — €39, one-time.** Roadmap, document tracking, reminders. The original core scope.
- **Complete — €89, valid 12 months** (not auto-renewing — a single payment covering a fixed window). Adds Document Vault, Bienvenido arrival guide, extended live support (pre-arrival and post-arrival), and priority translation referral.

This replaces the earlier single €50 anchor. Even at €89, Complete is roughly 94% cheaper than Barcelona Buddy's ~€1,470 concierge bundle — and Barcelona Buddy's bundle (visa + housing + orientation + bank account) is actually the more comparable reference point for Complete specifically, since it covers similar breadth, not just a generic anchor. Worth updating the pitch doc's pricing table to match this two-tier structure.

Flagged directly: the current platform-fee paywall doesn't show the user the total cost clearly, and that's a real conversion risk, not a cosmetic detail — someone deciding whether to trust a new platform with money needs to see the full number before committing, or the moment reads as evasive rather than reassuring. This applies to *every* checkout in the product (platform unlock, translation, eventually lawyer consult), not just one screen.

**The fix, as a standing design rule:**
- Show **one clear total** before the user clicks to pay — not a starting price that grows after the click, not fees revealed only at a later step.
- If there are optional add-ons (e.g. postal delivery +€12 in the translation flow), show the base price and the add-on price together, with the running total updating visibly as options are chosen — never a surprise total at the final step.
- State plainly what's included for that price (e.g. "Unlocks: full roadmap detail, document tracking, reminders" as a short list next to the number) — a small fee framed clearly reads as reasonable; the same fee framed vaguely reads as suspicious, even when the actual number is identical.
- **Payment methods: PayPal and credit/debit card**, shown as two clear options side by side at checkout — not one buried behind the other, and not requiring an account with either provider beyond what's needed to pay.

## 6. Known gaps to resolve before launch

These are real scenarios users will hit that nothing currently addresses. Worth resolving deliberately rather than discovering them from an upset user after launch.

- **Document rejection / visa refusal.** No current path for what happens next. Does the roadmap have a "reapply" flow? Does it route straight to Ida? Is any re-guidance covered by the original platform fee, or is it a new charge? This needs a stated answer before launch, not an improvised one after the first refusal.
- **Refund policy for the platform fee.** If someone pays to unlock the roadmap and their visa is denied through no fault of the platform (a common, expected outcome in immigration generally, not a failure of the product), what's the policy? Needs to be decided and stated clearly — silence here reads badly to a user who's already had a bad outcome.
- **Consulate appointment (cita previa) bottlenecks — confirmed by a real case, worse than initially assumed.** A detailed first-hand account (Canada → Madrid) showed the consulate assigning an appointment with under a month's notice, tied to program start date rather than applicant choice — not a vague "can take weeks" risk, a concrete example of how little control or warning applicants actually get. This changes the roadmap's messaging, not just its buffer time: **users need to be told to have documents ready *before* an appointment date even exists**, not advised to plan backward from a date they'll choose themselves. The roadmap should set this expectation explicitly and early, not as a footnote.
- **Editable intake / changed circumstances.** If a user answers a gating question incorrectly, or their situation changes mid-process (e.g. a family member joins their application), there's currently no path to correct the intake and regenerate the roadmap. Needs at least a basic "edit my answers" flow.
- **Editable intake / changed circumstances — confirmed as required, not yet built.** If a user answers a gating question incorrectly, or their situation changes mid-process (e.g. a family member joins their application), they need a path to correct their answers and have the roadmap regenerate accordingly — every document/answer should stay correctable prior to final validation/submission. Needs at least a basic "edit my answers" flow before launch, not an assumption that intake is a one-shot form.
- **Family members (SLF).** The Nigeria source material explicitly separates individual (SLU) requirements from accompanying family member (SLF) requirements — the current intake questionnaire doesn't ask about accompanying family at all. Real gap if any users bring dependents; needs its own branch in both the intake questions and the Requirements table.
- **Nigeria-specific funds/forex friction.** Proof-of-funds requirements can run into Central Bank of Nigeria forex restrictions in practice — a real, country-specific pain point that a generic "upload a bank statement" step doesn't surface or prepare users for. Worth a dedicated note in the Nigeria requirements content, not just a generic funds-proof instruction.
- **Multiple/companion applicants — confirmed decision.** A parent and adult child, or two friends, traveling and applying together are **separate accounts/roadmaps**, not linked — the SLF (family member) branch only applies when there's an actual dependency relationship (spouse/child under the primary applicant), not simply two people traveling together. No shared-application feature needed for the companion case.
- **Case-type confirmation: short-course/language-school students, not just degree students.** Confirmed via real discussion (a parent planning a 6-month language course with their adult child) — this is a distinct case type from full degree programs, likely intersecting with the existing duration-based conditional rule already noted (e.g. criminal record check not required under 6 months at some consulates). Worth explicitly covering "language school, 6-month course" as its own path in the Requirements table when nationalities beyond Nigeria are built out, not assuming all students are degree-seeking.
- **Document Vault retention — needs a stated outer bound.** User-controlled deletion satisfies GDPR's right to erasure, but "access until I no longer want them" needs one addition to be fully compliant: a stated policy for indefinite inactivity (e.g. "retained while your account is active; after [X years] of inactivity, you'll be notified before anything is removed"). An entirely open-ended retention policy with no outer bound is its own compliance risk — fold into the same T&Cs conversation with Ida.

## 6a. Pre-launch operational checklist — outside product design, but blocking real launch

Items that don't fit neatly into "product feature" or "Ida dependency" but still need resolving before accepting real users and real payments:

- **VAT.** For digital services sold to EU consumers, VAT is charged based on the *customer's* location and included in the price they pay — the cost isn't Rutabien's to absorb, you collect and remit it. But your users are non-EU nationals, often paying before establishing Spanish tax residency, which complicates the exact treatment. **This needs a Spanish accountant/gestoría to confirm specifics — not something to assume or resolve without professional input.**
- **Business registration (SL) timeline.** Trademark research was done, but actual company formation — and whether it needs to be live before accepting any real payment — hasn't been decided. Needs a date, not just "eventually."
- **Technical stack — confirmed, reusing the Mindshift stack.** Next.js on Vercel, Drizzle ORM, Neon (Postgres), Resend for email. Set Vercel and Neon to their **Frankfurt/EU region** explicitly (not left on a US default), and sign Neon's Data Processing Agreement. One nuance worth knowing, not acting on yet: Neon and Vercel are both US-incorporated, so the US CLOUD Act technically applies even to EU-hosted data — the DPA covers transfer legality, not US jurisdiction over the company itself. This is standard, reasonable practice for a startup at this stage (nearly every popular platform has the same exposure), not a flag to switch providers now — but worth revisiting once data-protection responsibility is actually assigned (see below), since immigration documents carry a different sensitivity profile than typical SaaS data. **Still missing from the stack entirely: file storage** for uploaded documents (passport scans, financial statements) — Postgres/Drizzle isn't where those live. Needs a separate object storage decision (S3-compatible: AWS S3, Cloudflare R2, Supabase Storage), also pinned to an EU region, before the Document Vault can be built for real.
- **Payment processor viability check for Nigerian users specifically.** Flagged earlier as a risk, never confirmed. Since Nigeria is the only proven pilot market, worth testing that your chosen processor (Stripe, PayPal, etc.) actually works reliably for Nigerian cards/PayPal accounts before assuming frictionless payment.
- **Support coverage hours, stated explicitly.** Ties to the 24-hour support target above — needs an actual stated commitment on the website/T&Cs, not an implicit assumption.
- **Meta ad-copy compliance rule.** Ads cannot reference immigration status, national origin, or financial situation when addressing the viewer directly (e.g. "Are you a Nigerian student worried about your visa?" is a policy violation, not just clumsy copy). Worth a written rule for whoever writes ad copy, since the growth plan depends on Meta ads working reliably.
- **Quantitative success metrics.** "What done looks like" (final section of this doc) is currently qualitative only. Needs actual target numbers before launch — intake-to-paid-tier conversion rate, roadmap completion rate, referral-to-Ida conversion rate — so "did the MVP validate demand" has a real answer, not a vibe-based one.
- **Launch sequencing.** Given how much is now in scope (two pricing tiers, Document Vault, Bienvenido, translation referral, extended live support), launching everything simultaneously is a much bigger lift than a tighter true-MVP first. Worth explicitly deciding what launches in the first real cohort versus what follows shortly after — not by default, by decision.

## 7. Data architecture — how tracking works without user accounts

"No login for the user" doesn't mean "no tracking on your end." But it also can't mean "bookmark this page and hope" — no one bookmarks a page they've just paid real money into with any confidence, and relying on that erodes trust exactly when it matters most.

**This needs to be a hardened passwordless system, not a simple static link.** A plain, non-expiring, reusable magic link is a real weak point — anyone who ever sees that email (a shared computer, synced work email, a forwarded message, an unlocked phone) gets permanent access, with no second barrier. That's not acceptable for a product holding passport scans and financial documents. Worth naming directly: a password-based system isn't automatically safer either — almost every password system falls back to an emailed reset link the moment someone forgets their password, so the real question is how that link is hardened, not whether a password exists at all.

**How it works — the hardened version:**
1. The moment someone submits the intake questionnaire, you create a user record server-side — keyed by email, storing their answers, case type, and a unique, unguessable access token.
2. The user gets back in via an **"Access your roadmap" page**: they type their email, and a fresh access link is emailed to them. **The link expires quickly (roughly 15–30 minutes) and works once** — after that, a new one has to be requested. This closes the "forwarded email = permanent access" gap.
3. Once used, the link starts a **normal secure session** (the same session mechanism any password-based site uses under the hood) — the link itself isn't a standing key, it's a one-time door.
4. **Step-up verification for sensitive actions specifically**: viewing or downloading an uploaded document (passport scan, financial statement) requires a fresh one-time code (email or SMS) even within an already-active session — an extra check at the exact moment it matters most, not just at login.
5. **After payment specifically**, the receipt/confirmation email includes a fresh access link directly — so there's no gap between "I just paid" and "here's how I actually get back in."
6. **Documents encrypted at rest**, so a database breach doesn't hand over readable files directly, independent of the login mechanism.

This pattern (short-lived single-use login plus step-up checks for sensitive actions) is close to what fintechs and banks increasingly use — not a corner-cutting MVP shortcut, but a legitimate, defensible answer to real document-privacy risk. **This has real GDPR/liability weight, not just UX weight** — worth confirming with Ida whether she handles data-protection compliance specifically or can point to someone who does, since immigration law and data protection law aren't the same specialty.

**The Requirements table — the actual content engine, and the most important piece not yet built.** Everything below is *per-user tracking*: whether a document is uploaded, whether a step is done. None of it defines *what's actually required*. That has to live in its own table, separate from user data entirely:

`nationality × visa-type × student-status → document list`, where each row is one required document with its own fields: `translation_required`, `legalization_chain`, `notarization_required`, `validity_window_days`, `official_source_link`, and `funds_formula` (where relevant, e.g. Nigeria's IPREM-based calculation). The Nigeria source material already gathered is, structurally, the first fully-populated set of rows in this table — not just reference material, but close to the literal schema.

**Confirmed and expanded by a real, detailed first-hand account (Canada → Madrid, Reddit r/GoingToSpain), which validated the overall design and surfaced fields not yet captured:**
- **The legalization chain is two-sided, not one-sided.** The home country's own apostille/authentication authority (e.g. Global Affairs Canada, distinct from Nigeria's Ministry of Foreign Affairs chain) is a separate step with its own processing time and its own expedite option — needs its own field (`home_country_apostille_authority`, `expedite_available`), not folded into the Spain-side `legalization_chain` field.
- **Representative/proxy authorization** — a notarized letter authorizing someone else to attend the appointment on the applicant's behalf, confirmed as a real, usable option at some consulates. Worth its own optional document type in the schema (`representative_authorization_available`, with the specific notarization requirements per consulate).
- **Conditional requirements, not just static per-consulate lists** — e.g., a criminal record check may not be required for stays under 6 months at some consulates. The schema needs to support conditions (duration-dependent, program-type-dependent), not just a flat per-nationality document list.
- **Appointment grace period and status-tracking mechanics** — some consulates allow a window (e.g. two weeks) to submit outstanding documents after the appointment, and status tracking requires a receipt/reference number issued at the appointment that's easy to lose and easy to overlook. Worth fields for `post_appointment_grace_period_days` and an explicit roadmap callout to save the receipt number.
- **Appointment dates are consulate-assigned, often with short notice — not user-chosen.** One real case showed under a month's notice between assignment and appointment date, tied to program start date rather than applicant preference. This affects the product's messaging, not just the data model — see the updated known-gaps note below.
- **A ready-to-use medical certificate template** (the specific required wording a doctor needs to type up and sign) is a small, concrete value-add worth providing per consulate, confirmed as something applicants currently have to piece together themselves from a consulate website.

This matters for how the product scales: **adding a new nationality becomes authoring new rows in this table (with Ida's sign-off), not writing new app logic.** A user's roadmap is generated by querying this table against their intake answers, not by hardcoded per-nationality logic in the app itself. Getting this structural separation right now avoids real rework later — retrofitting it after Nigeria's content gets built directly into app code would be a genuine redo, not a refactor.

**What you're actually storing (this is your real database):**
- **Requirements table:** the content engine described above — nationality/visa-type/status combinations mapped to document lists and their rules. Authored and maintained by you + Ida, not user-generated.
- **Users table:** email, name, nationality, EU/non-EU status, new-vs-returning status, case type, arrival/expiry dates, access token (short-lived, single-use), created date, payment status
- **Documents table:** linked to user ID — document name, status (needed/uploaded/verified), file reference (encrypted at rest), uploaded date, **validity expiry date** (for documents with a shelf life, e.g. police certificate, medical certificate), legalization/notarization/translation requirements per document (pulled from the Requirements table at roadmap-generation time)
- **Roadmap progress table:** which steps are done/in-progress/not-started, tied to user ID
- **Support escalation log:** flags when a live-support conversation should route to Ida rather than being handled directly — keeps the boundary auditable, not just a matter of agent judgment in the moment

## 8. Reminders & notifications — the mechanism that makes the roadmap stay useful

A roadmap is only "mapped" if it keeps talking to the user after the first visit. This runs entirely on data already in the Users/Documents/Progress tables — no new data model needed, just triggers on top of what's already tracked.

**Reminder types, in rough priority order for v1:**

| Trigger | Example message | Why it matters |
|---|---|---|
| Upcoming roadmap deadline | "Your NIE appointment window opens in 5 days" | The core promise — deadlines are useless if the user has to remember to check |
| Missing document, deadline approaching | "You haven't uploaded your proof of enrollment yet — due in 10 days" | Prevents the most common real failure mode: forgetting a step until it's urgent |
| Document expiring before use | "Your police certificate was issued 85 days ago — it may no longer be valid for submission" | Directly uses the validity-window tracking already in the data model; this is a failure mode students wouldn't catch themselves |
| Stalled progress (soft nudge) | "You started your roadmap 2 weeks ago — pick up where you left off" | Re-engagement without being pushy — one nudge, not a drip campaign |
| Payment/unlock reminder | "Your personalized roadmap is ready to unlock" | **Handle carefully** — this is the one reminder type that risks feeling like a sales push rather than help. One follow-up, gentle tone, no urgency tactics or countdown timers — consistent with the "no dark patterns" principle already set for the lawyer-referral screen |
| Consult booking reminder | "Your consult with Ida is tomorrow at 3pm" | Standard, expected, low-risk |
| Post-arrival check-in (new) | "You've been in Barcelona 2 months — here's some help settling in further" (links to EOI/intercambio content in Bienvenido) | Extends engagement past the paid unlock's active window using infrastructure that already exists — no new system needed, just a new trigger. Responds to real, validated pain around long-term adjustment, without turning Rutabien into a language-learning or social product itself — points to existing resources rather than building new ones |

**Delivery:** email only for v1 (matches the no-password architecture — every reminder email includes the direct access link, reinforcing "always one click away"). WhatsApp is confirmed for v2 — see section 3 for the full scope and why it's gated on volume rather than built alongside v1.

**Cadence discipline:** reminders should be tied to actual deadlines and real data changes (a document that just became stale, a window that just opened) — not an arbitrary drip schedule. Over-emailing a stressed user erodes trust fast, and undercuts the "calm, organized" brand tone the design brief already commits to.

## 9. Admin dashboard (for you, and eventually Ida) — in scope from day one

This is separate from the "no accounts for users" decision above — you and Ida need a properly authenticated system (real login, real password) since it exposes every user's personal documents and case data in one place.

**What it needs to show:**
- All users/leads, with case type and current roadmap progress %
- Payment status (unlocked / not yet unlocked)
- Documents uploaded vs. still outstanding, per user
- Flags for "this case needs legal escalation" — the cases that should route to Ida
- Basic filtering/search (by case type, by status, by date)

**Build note:** this doesn't need custom engineering from scratch — a no-code/low-code backend (Airtable, Supabase, Retool) can get a working version of this running fast, backed by the same Users/Documents/Progress tables described above. Reminder history (what's been sent, what's overdue) is worth surfacing here too — useful for spotting users who are stalled or unresponsive to nudges.

## 10. Build scope (rough)

- Static or lightly dynamic web app: questionnaire → logic branching → generated roadmap
- No user accounts (password-based) needed for v1 — passwordless email re-entry is enough, reduces build time significantly while still feeling trustworthy for a paid product
- Roadmap content is essentially structured content you and Ida co-author, rendered dynamically based on questionnaire answers — not a complex rules engine
- Admin dashboard is a separate, properly authenticated system layered on top of the same underlying data

## 11. What "done" looks like for MVP

You can point at it and say: *a real user can answer questions, get an accurate roadmap for their specific situation, and book a paid consult with our lawyer — end to end, no manual work from us in between (except the actual legal consult itself).*

---

**Where I'm most likely to have gotten it wrong:** the case-type scope (which 2–3 to prioritize), whether housing is truly a later phase, and whether the "talk to a lawyer" step is meant to be the main revenue driver from day one or a bonus path while the platform itself charges a fee. Let me know and I'll revise.
