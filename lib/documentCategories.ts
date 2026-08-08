// Fixed taxonomy for the Documents (Vault) page - always exactly these 4
// categories, always in this order, per the design handoff (2026-08-04).
// Distinct from a roadmap step's `phase` (chronological), see
// db/schema.ts requirements.category comment.
export const DOCUMENT_CATEGORIES = [
  "Identity & Travel",
  "Academic",
  "Financial",
  "Health & Legal",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
