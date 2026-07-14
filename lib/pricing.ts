// Two one-time tiers, not subscriptions — MVP_Draft.md section 5a.
// Every checkout surface must show this full total before commit, never a
// price that grows after the click (see CLAUDE.md "Critical product principles").
export const PRICING_TIERS = {
  essential: {
    id: "essential",
    name: "Essential",
    priceEur: 39,
    includes: ["Full roadmap", "Document tracking", "Reminders"],
  },
  complete: {
    id: "complete",
    name: "Complete",
    priceEur: 89,
    validForMonths: 12,
    includes: [
      "Everything in Essential",
      "Document Vault",
      "Bienvenido arrival guide",
      "Extended live support",
      "Priority translation referral",
    ],
  },
} as const;

export type PlanType = keyof typeof PRICING_TIERS;

export function isPlanType(value: string): value is PlanType {
  return value in PRICING_TIERS;
}
