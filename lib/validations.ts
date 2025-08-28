// import { z } from "zod"

// export const createRiskSchema = z.object({
//   title: z.string().min(1, "El título es requerido").max(100, "El título debe tener máximo 100 caracteres"),
//   description: z.string().optional(),
//   likelihood: z
//     .number()
//     .int()
//     .min(1, "La probabilidad debe ser entre 1 y 5")
//     .max(5, "La probabilidad debe ser entre 1 y 5"),
//   impact: z.number().int().min(1, "El impacto debe ser entre 1 y 5").max(5, "El impacto debe ser entre 1 y 5"),
// })

// export const updateRiskSchema = createRiskSchema.partial()

// export const riskQuerySchema = z.object({
//   band: z.enum(["Low", "Moderate", "High", "Critical"]).optional(),
//   search: z.string().optional(),
//   sortBy: z.enum(["severity", "updatedAt"]).default("severity"),
//   order: z.enum(["asc", "desc"]).default("desc"),
//   page: z.coerce.number().int().min(1).default(1),
//   pageSize: z.coerce.number().int().min(1).max(100).default(20),
// })

// export type CreateRiskInput = z.infer<typeof createRiskSchema>
// export type UpdateRiskInput = z.infer<typeof updateRiskSchema>
// export type RiskQueryInput = z.infer<typeof riskQuerySchema>

import { z } from "zod";

/* ---------- Helpers ---------- */
const clampPageSize = (v: unknown) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 20;
  return Math.min(Math.max(Math.trunc(n), 1), 100); // 1..100
};

// Accepts "all" and converts to undefined (no filter)
const bandSchema = z
  .union([z.enum(["Low", "Moderate", "High", "Critical"]), z.literal("all")])
  .optional()
  .transform((v) => (v === "all" ? undefined : v));

/* ---------- Create / Update ---------- */
export const createRiskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "El título debe tener máximo 100 caracteres"),
  description: z.string().optional(),
  likelihood: z.coerce.number().int().min(1, "La probabilidad debe ser entre 1 y 5").max(5, "La probabilidad debe ser entre 1 y 5"),
  impact: z.coerce.number().int().min(1, "El impacto debe ser entre 1 y 5").max(5, "El impacto debe ser entre 1 y 5"),
  status: z.enum(["Open", "Monitoring", "Closed"]).optional().default("Open"),
});

export const updateRiskSchema = createRiskSchema.partial();

/* ---------- Query ---------- */
export const riskQuerySchema = z.object({
  band: bandSchema, // ← allows "all"
  search: z.string().optional(),
  sortBy: z.enum(["severity", "updatedAt"]).default("severity"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  // clamp pageSize before validating to avoid 400s
  pageSize: z.preprocess(clampPageSize, z.number().int().min(1).max(100)).default(20),
});

/* ---------- Types ---------- */
export type CreateRiskInput = z.infer<typeof createRiskSchema>;
export type UpdateRiskInput = z.infer<typeof updateRiskSchema>;
export type RiskQueryInput = z.infer<typeof riskQuerySchema>;
