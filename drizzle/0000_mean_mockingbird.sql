CREATE TYPE "public"."document_status" AS ENUM('needed', 'uploaded', 'verified');--> statement-breakpoint
CREATE TYPE "public"."escalation_reason" AS ENUM('document_sufficiency', 'outcome_prediction', 'user_requested', 'other');--> statement-breakpoint
CREATE TYPE "public"."escalation_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."eu_status" AS ENUM('eu_eea', 'non_eu');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'essential', 'complete');--> statement-breakpoint
CREATE TYPE "public"."roadmap_step_status" AS ENUM('not_started', 'in_progress', 'done');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('new', 'returning');--> statement-breakpoint
CREATE TABLE "access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"requirement_id" uuid,
	"name" text NOT NULL,
	"status" "document_status" DEFAULT 'needed' NOT NULL,
	"file_ref" text,
	"uploaded_at" timestamp,
	"validity_expiry_date" date,
	"translation_required" boolean DEFAULT false NOT NULL,
	"legalization_chain" text,
	"notarization_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nationality" text NOT NULL,
	"visa_type" text NOT NULL,
	"student_status" "student_status" NOT NULL,
	"document_name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"translation_required" boolean DEFAULT false NOT NULL,
	"legalization_chain" text,
	"notarization_required" boolean DEFAULT false NOT NULL,
	"home_country_apostille_authority" text,
	"expedite_available" boolean DEFAULT false NOT NULL,
	"validity_window_days" integer,
	"funds_formula" text,
	"official_source_link" text,
	"representative_authorization_available" boolean DEFAULT false NOT NULL,
	"representative_authorization_notes" text,
	"post_appointment_grace_period_days" integer,
	"conditions" jsonb,
	"document_template" text,
	"signed_off" boolean DEFAULT false NOT NULL,
	"signed_off_by" text,
	"signed_off_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"step_key" text NOT NULL,
	"step_label" text NOT NULL,
	"status" "roadmap_step_status" DEFAULT 'not_started' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"due_date" date,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "step_up_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"code" text NOT NULL,
	"purpose" text DEFAULT 'document_access' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_escalation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"conversation_ref" text,
	"reason" "escalation_reason" NOT NULL,
	"trigger_detail" text,
	"status" "escalation_status" DEFAULT 'open' NOT NULL,
	"escalated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"nationality" text,
	"eu_status" "eu_status",
	"student_status" "student_status",
	"case_type" text,
	"arrival_date" date,
	"visa_expiry_date" date,
	"intake_answers" jsonb,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "access_tokens" ADD CONSTRAINT "access_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_requirement_id_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."requirements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_progress" ADD CONSTRAINT "roadmap_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_up_verifications" ADD CONSTRAINT "step_up_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_up_verifications" ADD CONSTRAINT "step_up_verifications_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_escalation_log" ADD CONSTRAINT "support_escalation_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;