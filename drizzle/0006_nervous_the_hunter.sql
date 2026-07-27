CREATE TABLE "country_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nationality" text NOT NULL,
	"is_hague_apostille_signatory" boolean,
	"official_slf_source_link" text,
	"signed_off" boolean DEFAULT false NOT NULL,
	"signed_off_by" text,
	"signed_off_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "country_profiles_nationality_unique" UNIQUE("nationality")
);
--> statement-breakpoint
ALTER TABLE "requirements" ALTER COLUMN "nationality" DROP NOT NULL;