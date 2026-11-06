export interface CreditTier {
  credit_min: number;
  credit_max: number;
  adjustment_bps: number;
}

export interface PropertyAdjustment {
  property_type: string;
  adjustment_bps: number;
}

export interface LendingAdjustment {
  lending_type: string;
  adjustment_bps: number;
}

export interface MarginProfile {
  base_margin_bps: number;
  risk_multiplier: number;
}

export interface LLPARequest {
  product_type: string;
  property_type: string;
  lending_type: string;
  credit_score: number;
}
