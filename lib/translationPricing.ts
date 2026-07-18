// Tiered pricing confirmed against real market rates in MVP_Draft.md
// section 6: "Rutabien's existing tiers... land squarely in this range."
export const POSTAL_DELIVERY_SURCHARGE_EUR = 12;

export function tierPriceFor(documentCount: number): number {
  if (documentCount <= 0) return 0;
  if (documentCount <= 3) return 35;
  if (documentCount <= 6) return 55;
  return 80;
}

export function computeTranslationTotal(documentCount: number, postalDelivery: boolean): number {
  return tierPriceFor(documentCount) + (postalDelivery ? POSTAL_DELIVERY_SURCHARGE_EUR : 0);
}
