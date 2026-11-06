// backend/pricing/volatility/volatilityTypes.ts

export interface VolatilitySnapshot {
  timestamp: Date;
  mbs_30yr: number;
  mbs_15yr: number;
  treasury_10y: number;
  treasury_2y: number;
}

export interface VolatilityResult {
  volatility: number;
  movementScore: number;
}
