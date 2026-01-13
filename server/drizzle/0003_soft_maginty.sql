ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "contract_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "marketed_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "contract_file_url" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "property_image_url" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "year_built" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "city" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "state" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "zip" text;