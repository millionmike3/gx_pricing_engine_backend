// backend/pricing/volatility/volatilityCalculator.ts

import { VolatilitySnapshot } from "./volatilityTypes";

export function computeVolatility(snapshots: VolatilitySnapshot[]): number {
  if (!snapshots.length) return 0;

  const rates = snapshots.map(s => s.mbs_30yr);
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;

  const variance =
    rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
    rates.length;

  return Math.sqrt(variance);
}

export function computeMovementScore(snapshot: VolatilitySnapshot): number {
  const mbsMove = snapshot.mbs_30yr - snapshot.mbs_15yr;
  const treasuryMove = snapshot.treasury_2y - snapshot.treasury_10y;

  return mbsMove * 5 + treasuryMove * 3;
}
