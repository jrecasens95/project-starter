import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const healthchecks = pgTable("healthchecks", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
