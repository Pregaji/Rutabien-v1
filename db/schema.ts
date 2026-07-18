import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const euStatusEnum = pgEnum("eu_status", ["eu_eea", "non_eu"]);

export const studentStatusEnum = pgEnum("student_status", [
  "new",
  "returning",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "essential",
  "complete",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "needed",
  "uploaded",
  "verified",
]);

export const roadmapStepStatusEnum = pgEnum("roadmap_step_status", [
  "not_started",
  "in_progress",
  "done",
]);

export const escalationReasonEnum = pgEnum("escalation_reason", [
  "document_sufficiency",
  "outcome_prediction",
  "user_requested",
  "other",
]);

export const escalationStatusEnum = pgEnum("escalation_status", [
  "open",
  "in_progress",
  "resolved",
]);

// ---------------------------------------------------------------------------
// Requirements table — the content engine.
// nationality x visa-type x student-status -> document list.
// Authored + legal-reviewed by founder/Ida, not user data.
// Never branch application code on nationality directly — query this table.
// ---------------------------------------------------------------------------

export const requirements = pgTable("requirements", {
  id: uuid("id").defaultRandom().primaryKey(),

  // The query key: nationality x visa-type x student-status.
  nationality: text("nationality").notNull(),
  visaType: text("visa_type").notNull(),
  studentStatus: studentStatusEnum("student_status").notNull(),

  // One row = one required document within that combination.
  documentName: text("document_name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),

  // Roadmap phase grouping (e.g. "Before you fly", "Your first 30 days").
  // Authored content like everything else in this table — a new phase
  // label is a content decision, not a UI one.
  phase: text("phase"),

  // Who this document applies to — the applicant themself (SLU) or an
  // accompanying family member (SLF). Schema support only; no SLF content
  // has been drafted yet pending real source material / Ida's input.
  appliesTo: text("applies_to").notNull().default("self"), // 'self' | 'spouse' | 'child'

  // Spain-side legalization/translation/notarization requirements.
  translationRequired: boolean("translation_required").notNull().default(false),
  legalizationChain: text("legalization_chain"),
  notarizationRequired: boolean("notarization_required").notNull().default(false),

  // Home-country side of the legalization chain — separate authority,
  // separate processing time, distinct from the Spain-side chain above.
  homeCountryApostilleAuthority: text("home_country_apostille_authority"),
  expediteAvailable: boolean("expedite_available").notNull().default(false),

  // Shelf life of the document once issued (e.g. police certificate).
  validityWindowDays: integer("validity_window_days"),

  // Funds threshold calculation, e.g. Nigeria's IPREM-based formula.
  // Stored as a formula/expression string, evaluated at roadmap-generation time.
  fundsFormula: text("funds_formula"),

  officialSourceLink: text("official_source_link"),

  // Representative/proxy authorization option at some consulates.
  representativeAuthorizationAvailable: boolean(
    "representative_authorization_available"
  )
    .notNull()
    .default(false),
  representativeAuthorizationNotes: text("representative_authorization_notes"),

  // Grace period to submit outstanding documents after the appointment.
  postAppointmentGracePeriodDays: integer("post_appointment_grace_period_days"),

  // Conditional rules not captured by flat columns above — e.g.
  // "criminal record check not required for stays under 6 months".
  // Shape: array of { field, operator, value, effect } evaluated against
  // intake answers at roadmap-generation time.
  conditions: jsonb("conditions").$type<
    Array<{
      field: string;
      operator: string;
      value: unknown;
      effect: string;
    }>
  >(),

  // Ready-to-use template text (e.g. medical certificate wording) when applicable.
  documentTemplate: text("document_template"),

  // Content is authored/legal-reviewed content, not AI-generated (see CLAUDE.md).
  // Must not be treated as published/final until this is explicitly set.
  signedOff: boolean("signed_off").notNull().default(false),
  signedOffBy: text("signed_off_by"),
  signedOffAt: timestamp("signed_off_at", { mode: "date" }),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Users — no password. Access is via short-lived single-use magic links
// (see accessTokens below) followed by a normal session (see sessions below).
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),

  // Intake-derived case classification, used to query the requirements table.
  nationality: text("nationality"),
  euStatus: euStatusEnum("eu_status"),
  studentStatus: studentStatusEnum("student_status"),
  caseType: text("case_type"),

  arrivalDate: date("arrival_date", { mode: "date" }),
  visaExpiryDate: date("visa_expiry_date", { mode: "date" }),

  // Full raw intake answers (decision-tree responses), source of truth for
  // whatever the Users columns above don't capture 1:1.
  intakeAnswers: jsonb("intake_answers"),

  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  paidAt: timestamp("paid_at", { mode: "date" }),

  // Dedup tracking for reminder emails (MVP_Draft.md section 8) — keyed by
  // reminder type, e.g. { unlock: "2026-07-18T...", stalled: "2026-08-01T..." }.
  // Avoids re-sending the same nudge every time the check runs.
  remindersSent: jsonb("reminders_sent").$type<Record<string, string>>().default({}),

  // Updated when the user actually comes back (magic-link redemption) —
  // the real "activity" signal for Document Vault retention, not just
  // account creation date.
  lastActiveAt: timestamp("last_active_at", { mode: "date" }).defaultNow().notNull(),
  // Retention warning dedup — set once the "documents will be removed"
  // notice is sent, so it doesn't repeat on every retention check.
  retentionWarnedAt: timestamp("retention_warned_at", { mode: "date" }),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Short-lived (~15-30 min), single-use magic links requested from the
// "Access your roadmap" page. Distinct from `sessions`, which is the normal
// session created once a link is redeemed.
export const accessTokens = pgTable("access_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
  // Where to send the user after redeeming this specific link — e.g. a
  // translation-order customer should land on their order, not /roadmap.
  // Null falls back to the default /roadmap redirect.
  redirectPath: text("redirect_path"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Step-up verification: a fresh one-time code required specifically before
// viewing/downloading an uploaded document, even within an active session.
export const stepUpVerifications = pgTable("step_up_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => sessions.id, {
    onDelete: "cascade",
  }),
  code: text("code").notNull(),
  purpose: text("purpose").notNull().default("document_access"),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Documents — per-user tracking. Requirement fields (translation/legalization/
// notarization) are snapshotted from `requirements` at roadmap-generation
// time, since the source requirement content can change later.
// ---------------------------------------------------------------------------

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  requirementId: uuid("requirement_id").references(() => requirements.id, {
    onDelete: "set null",
  }),

  name: text("name").notNull(),
  status: documentStatusEnum("status").notNull().default("needed"),

  // Reference to encrypted-at-rest file storage (provider not yet chosen).
  fileRef: text("file_ref"),

  uploadedAt: timestamp("uploaded_at", { mode: "date" }),
  validityExpiryDate: date("validity_expiry_date", { mode: "date" }),

  // Snapshot of requirement rules at generation time.
  translationRequired: boolean("translation_required").notNull().default(false),
  legalizationChain: text("legalization_chain"),
  notarizationRequired: boolean("notarization_required").notNull().default(false),

  // Dedup tracking so the "document may no longer be valid" reminder only
  // fires once per expiry, not every time the reminder check runs.
  expiryReminderSentAt: timestamp("expiry_reminder_sent_at", { mode: "date" }),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Roadmap progress — which steps are done/in-progress/not-started, tied to
// a user. Steps are broader than documents (e.g. "book NIE appointment").
// ---------------------------------------------------------------------------

export const roadmapProgress = pgTable("roadmap_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stepKey: text("step_key").notNull(),
  stepLabel: text("step_label").notNull(),
  // Snapshot of requirements.phase at generation time, same pattern as the
  // translation/legalization snapshot on documents.
  phase: text("phase"),
  status: roadmapStepStatusEnum("status").notNull().default("not_started"),
  position: integer("position").notNull().default(0),
  dueDate: date("due_date", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Support escalation log — flags when a live-support conversation must route
// to the legal-partner path rather than being handled by support directly.
// The escalation trigger itself lives in app/config, not agent discretion;
// this table is the audit trail of when it fired.
// ---------------------------------------------------------------------------

export const supportEscalationLog = pgTable("support_escalation_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conversationRef: text("conversation_ref"),
  reason: escalationReasonEnum("reason").notNull(),
  triggerDetail: text("trigger_detail"),
  status: escalationStatusEnum("status").notNull().default("open"),
  escalatedAt: timestamp("escalated_at", { mode: "date" }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
  resolvedBy: text("resolved_by"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Individual messages in a live-support thread. Kept separate from the
// escalation log above — this is the conversation itself; the log is the
// audit trail of when the operational boundary was hit.
export const supportMessages = pgTable("support_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  from: text("from").notNull(), // 'user' | 'team'
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Admin — founder/Ida-facing access. Deliberately a separate, real
// email+password auth system, not the passwordless user flow (see
// MVP_Draft.md section 9: "you and Ida need a properly authenticated
// system... since it exposes every user's personal documents and case data").
// ---------------------------------------------------------------------------

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminUserId: uuid("admin_user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Translation orders — the standalone revenue stream (MVP_Draft.md section
// 3/"Get this translated"). Deliberately independent of the Requirements
// table and roadmap flow: no nationality/visa-type logic, just documents,
// tiered pricing, and a sworn-translator referral. Uses the same
// passwordless email access pattern (via `users`/`accessTokens`/`sessions`)
// for order tracking, but shares no other infrastructure with the roadmap.
// ---------------------------------------------------------------------------

export const translationOrderStatusEnum = pgEnum("translation_order_status", [
  "pending",
  "paid",
  "in_progress",
  "delivered",
]);

export const translationOrders = pgTable("translation_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  files: jsonb("files").$type<Array<{ key: string; name: string }>>().notNull().default([]),
  postalDelivery: boolean("postal_delivery").notNull().default(false),
  totalEur: integer("total_eur").notNull(),
  status: translationOrderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
