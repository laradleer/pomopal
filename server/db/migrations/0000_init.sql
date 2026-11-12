CREATE TYPE "public"."item_slot" AS ENUM('head', 'face', 'neck', 'background');--> statement-breakpoint
CREATE TYPE "public"."pet_mood" AS ENUM('happy', 'sleepy', 'sad', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."pet_species" AS ENUM('cat', 'dog');--> statement-breakpoint
CREATE TYPE "public"."session_mode" AS ENUM('focus', 'short', 'long');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('running', 'completed', 'abandoned');--> statement-breakpoint
CREATE TABLE "focus_session" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "focus_session_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"task_id" integer,
	"mode" "session_mode" NOT NULL,
	"planned_min" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"status" "session_status" DEFAULT 'running' NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"coins_earned" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "focus_session_planned_min_positive" CHECK ("focus_session"."planned_min" > 0),
	CONSTRAINT "focus_session_rewards_not_negative" CHECK ("focus_session"."xp_earned" >= 0 and "focus_session"."coins_earned" >= 0),
	CONSTRAINT "focus_session_ends_after_start" CHECK ("focus_session"."ended_at" is null or "focus_session"."ended_at" >= "focus_session"."started_at")
);
--> statement-breakpoint
CREATE TABLE "inventory_item" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"bought_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pet" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pet_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"species" "pet_species" NOT NULL,
	"name" text NOT NULL,
	"mood" "pet_mood" DEFAULT 'neutral' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pet_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "pet_name_length" CHECK (char_length("pet"."name") between 1 and 20)
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_study_date" date,
	"focus_min" integer DEFAULT 25 NOT NULL,
	"short_break_min" integer DEFAULT 5 NOT NULL,
	"long_break_min" integer DEFAULT 15 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_xp_not_negative" CHECK ("profile"."xp" >= 0),
	CONSTRAINT "profile_level_at_least_1" CHECK ("profile"."level" >= 1),
	CONSTRAINT "profile_coins_not_negative" CHECK ("profile"."coins" >= 0),
	CONSTRAINT "profile_streak_not_negative" CHECK ("profile"."streak_days" >= 0),
	CONSTRAINT "profile_focus_min_range" CHECK ("profile"."focus_min" between 15 and 60),
	CONSTRAINT "profile_short_break_min_range" CHECK ("profile"."short_break_min" between 3 and 15),
	CONSTRAINT "profile_long_break_min_range" CHECK ("profile"."long_break_min" between 10 and 30)
);
--> statement-breakpoint
CREATE TABLE "shop_item" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shop_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"asset_key" text NOT NULL,
	"name" text NOT NULL,
	"slot" "item_slot" NOT NULL,
	"price" integer NOT NULL,
	"required_level" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "shop_item_asset_key_unique" UNIQUE("asset_key"),
	CONSTRAINT "shop_item_price_not_negative" CHECK ("shop_item"."price" >= 0),
	CONSTRAINT "shop_item_required_level_at_least_1" CHECK ("shop_item"."required_level" >= 1)
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"sessions_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_title_length" CHECK (char_length("task"."title") between 1 and 120),
	CONSTRAINT "task_sessions_count_not_negative" CHECK ("task"."sessions_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "focus_session" ADD CONSTRAINT "focus_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_session" ADD CONSTRAINT "focus_session_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_item_id_shop_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shop_item"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pet" ADD CONSTRAINT "pet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "focus_session_user_started_idx" ON "focus_session" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "focus_session_one_running_per_user" ON "focus_session" USING btree ("user_id") WHERE status = 'running';--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_item_user_item_unique" ON "inventory_item" USING btree ("user_id","item_id");--> statement-breakpoint
CREATE INDEX "task_user_created_idx" ON "task" USING btree ("user_id","created_at");