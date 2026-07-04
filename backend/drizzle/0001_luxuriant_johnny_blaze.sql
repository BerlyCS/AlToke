ALTER TABLE "users" ADD COLUMN "streak_frozen_until" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "overdue_high_priority_count" integer DEFAULT 0;
