CREATE TYPE "public"."notification_channel" AS ENUM('EMAIL', 'PUSH', 'IN_APP', 'SYSTEM');--> statement-breakpoint
ALTER TABLE "notification_logs" ALTER COLUMN "channel" SET DEFAULT 'IN_APP'::"public"."notification_channel";--> statement-breakpoint
ALTER TABLE "notification_logs" ALTER COLUMN "channel" SET DATA TYPE "public"."notification_channel" USING "channel"::"public"."notification_channel";