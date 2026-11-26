CREATE TYPE "public"."achievement_key" AS ENUM('first-tomato', 'streak-5', 'sessions-10', 'level-5');--> statement-breakpoint
CREATE TABLE "achievement" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "achievement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"key" "achievement_key" NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "achievement_user_key_unique" ON "achievement" USING btree ("user_id","key");--> statement-breakpoint
-- Students who studied before badges existed get the ones they have already earned.
-- The goals match server/services/rules/achievements.ts.
INSERT INTO "achievement" ("user_id", "key")
SELECT "user_id", 'first-tomato'::"achievement_key" FROM "focus_session"
WHERE "mode" = 'focus' AND "status" = 'completed' GROUP BY "user_id" HAVING count(*) >= 1
UNION ALL
SELECT "user_id", 'sessions-10'::"achievement_key" FROM "focus_session"
WHERE "mode" = 'focus' AND "status" = 'completed' GROUP BY "user_id" HAVING count(*) >= 10
UNION ALL
SELECT "user_id", 'streak-5'::"achievement_key" FROM "profile" WHERE "streak_days" >= 5
UNION ALL
SELECT "user_id", 'level-5'::"achievement_key" FROM "profile" WHERE "level" >= 5
ON CONFLICT DO NOTHING;
