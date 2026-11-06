// backend/pricing/market/marketAdjustments.ts

export function computeMacroAdj(snapshot: any, weights: any): number {
  const inflation = (snapshot.inflationIndex ?? 0) * (weights.inflation ?? 0);
  const employment = (snapshot.employmentIndex ?? 0) * (weights.employment ?? 0);
  const gdp = (snapshot.gdpIndex ?? 0) * (weights.gdp ?? 0);

  return inflation + employment + gdp;
}

export function computeVolatilityAdj(volatility: number, weight: number): number {
  return volatility * weight;
}

export function computeMarketStressAdj(snapshot: any): number {
  if ((snapshot.stressIndex ?? 0) > 0.7) return 0.15;
  if ((snapshot.stressIndex ?? 0) > 0.5) return 0.10;
  return 0;
}
