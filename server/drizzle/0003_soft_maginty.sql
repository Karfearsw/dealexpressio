ALTER TABLE "deals" ADD COLUMN "contract_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "marketed_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "expiry_date" timestamp;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "contract_file_url" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "property_image_url" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "year_built" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "zip" text;