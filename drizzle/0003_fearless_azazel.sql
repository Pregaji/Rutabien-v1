CREATE TYPE "public"."translation_order_status" AS ENUM('pending', 'paid', 'in_progress', 'delivered');--> statement-breakpoint
CREATE TABLE "translation_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"postal_delivery" boolean DEFAULT false NOT NULL,
	"total_eur" integer NOT NULL,
	"status" "translation_order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "requirements" ADD COLUMN "applies_to" text DEFAULT 'self' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_active_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "retention_warned_at" timestamp;--> statement-breakpoint
ALTER TABLE "translation_orders" ADD CONSTRAINT "translation_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;