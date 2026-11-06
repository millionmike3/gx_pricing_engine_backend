// backend/pricing/matrix/matrixAdjustments.ts

export function computeBaseRate(market: any, weights: any): number {
  return (
    market.treasury_10y * weights.treasury_10y +
    market.mbs_current_coupon * weights.mbs_current_coupon +
    market.inflation_yoy * weights.inflation
  );
}

export function computeMacroAdj(market: any, weights: any): number {
  return (
    market.inflation_yoy * weights.inflation_adj +
    market.unemployment_rate * weights.unemployment_adj +
    market.gdp_growth * weights.gdp_adj
  );
}

export function computeBankAdj(bankRates: any, product: string, baseRate: number): number {
  const rate = bankRates[product] ?? 0;
  return Math.round((rate - baseRate) * 100);
}

export function computeMargin(profile: any, context: any): number {
  let margin = profile.target_profit_bps ?? 0;

  margin += context.risk_premium_bps ?? 0;

  if (context.product_type === "5_1_ARM") {
    margin += 15;
  }

  return Math.max(
    profile.min_margin_bps,
    Math.min(profile.max_margin_bps, margin)
  );
}

export function bpsToRate(bps: number): number {
  return bps / 100;
}
