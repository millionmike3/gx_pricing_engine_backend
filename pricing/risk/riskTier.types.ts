export interface RiskTierRule {
  tier: string;
  min_score: number;
  max_score: number;
  risk_premium_bps: number;
}

export interface RiskTierRequest {
  credit_score: number;
  dti: number;
  ltv: number;
  property_type: string;
  lending_type: string;
  volatility_index: number;
}

export interface RiskTierResult {
  tier: string;
  risk_score: number;
  risk_premium_bps: number;
}
