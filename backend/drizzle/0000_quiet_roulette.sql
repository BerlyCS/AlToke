CREATE TYPE "public"."notification_channel" AS ENUM('EMAIL', 'PUSH', 'IN_APP', 'SYSTEM');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"is_secret" boolean DEFAULT false NOT NULL,
	"required_xp" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "achievements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ai_habit_analyses" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"frequent_time_slots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category_affinity" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"item_type" varchar(20) NOT NULL,
	"effect" varchar(255),
	"asset_url" text,
	CONSTRAINT "items_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "level_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" integer NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "level_rewards_level_unique" UNIQUE("level")
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"channel" "notification_channel" DEFAULT 'IN_APP' NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email_enabled" boolean DEFAULT false,
	"push_enabled" boolean DEFAULT false,
	"is_muted" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "privacy_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"show_level" boolean DEFAULT true,
	"show_streak" boolean DEFAULT true,
	"show_achievements" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(20),
	"icon" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "task_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"suggested_title" varchar(100) NOT NULL,
	"suggested_time" timestamp NOT NULL,
	"explanation" text NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_tags" (
	"task_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(20) DEFAULT 'TASK' NOT NULL,
	"priority" varchar(20) DEFAULT 'MEDIUM' NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"estimated_time" integer,
	"start_date" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"recurrence" varchar(20) DEFAULT 'NONE' NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_inventories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"role" varchar(20) DEFAULT 'USER' NOT NULL,
	"nickname" varchar(50),
	"bio" text,
	"avatar_url" text,
	"xp" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"current_streak" integer DEFAULT 0,
	"max_streak" integer DEFAULT 0,
	"streak_frozen_until" timestamp,
	"overdue_high_priority_count" integer DEFAULT 0,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "xp_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"source" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_habit_analyses" ADD CONSTRAINT "ai_habit_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_rewards" ADD CONSTRAINT "level_rewards_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_suggestions" ADD CONSTRAINT "task_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_tags" ADD CONSTRAINT "task_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventories" ADD CONSTRAINT "user_inventories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventories" ADD CONSTRAINT "user_inventories_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_logs_user_id_created_at_idx" ON "notification_logs" USING btree ("user_id","created_at");