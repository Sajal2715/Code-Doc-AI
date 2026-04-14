import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const codegenHistoryTable = pgTable("codegen_history", {
  id: serial("id").primaryKey(),
  inputCode: text("input_code").notNull(),
  language: text("language").notNull(),
  mode: text("mode").notNull(),
  output: text("output").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCodegenHistorySchema = createInsertSchema(codegenHistoryTable).omit({ id: true, createdAt: true });

export type InsertCodegenHistory = z.infer<typeof insertCodegenHistorySchema>;
export type CodegenHistory = typeof codegenHistoryTable.$inferSelect;
