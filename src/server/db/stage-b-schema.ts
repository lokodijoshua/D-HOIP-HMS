import { pgSchema, text, uuid } from "drizzle-orm/pg-core";

export type StageBEmployeeStatus = "active" | "inactive" | "revoked";

const dhoip = pgSchema("dhoip");

// Stage B probe-only tables. These are not the production employee or patient schema.
export const stageBEmployeeLink = dhoip.table("stage_b_employee_link", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  employeeRef: text("employee_ref").notNull(),
  status: text("status").$type<StageBEmployeeStatus>().notNull(),
});

export const stageBProbeResource = dhoip.table("stage_b_probe_resource", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull(),
  label: text("label").notNull(),
});
