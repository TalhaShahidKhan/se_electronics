ALTER TYPE "public"."applicationStatus" ADD VALUE 'expired';--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "vipExpiryDate" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "status" "serviceStatus" DEFAULT 'pending' NOT NULL;