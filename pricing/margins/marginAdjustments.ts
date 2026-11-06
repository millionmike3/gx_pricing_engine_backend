// backend/pricing/margins/marginAdjustments.ts

export function computeRiskPremium(riskScore: number): number {
  if (riskScore > 0.8) return 40;
  if (riskScore > 0.6) return 25;
  if (riskScore > 0.4) return 10;
  return 0;
}

export function computeProductPremium(product: string): number {
  if (product === "5_1_ARM") return 15;
  if (product === "15Y_FIXED") return -5;
  return 0;
}

export function computeInvestorPremium(investorRiskBand: number): number {
  return investorRiskBand * 10;
}
