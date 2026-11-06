import { Injectable } from "@nestjs/common";

export interface FraudScoreRequest {
  credit_score: number;
  dti: number;
  ltv: number;
  recent_inquiries: number;
  occupancy: string;
  income_stability_index: number;
  behavior_score: number;
}

export interface FraudScoreResult {
  fraud_score: number;
  fraud_risk_tier: string;
  fraud_risk_bps: number;
}

@Injectable()
export class FraudScoreService {
  compute(req: FraudScoreRequest): FraudScoreResult {
    let score = 0;

    // High LTV increases fraud risk
    if (req.ltv > 90) score += 25;
    else if (req.ltv > 80) score += 10;

    // High DTI increases fraud risk
    if (req.dti > 50) score += 20;
    else if (req.dti > 43) score += 10;

    // Recent credit inquiries
    score += req.recent_inquiries * 5;

    // Occupancy fraud risk
    if (req.occupancy === "INVESTMENT") score += 15;
    if (req.occupancy === "SECOND_HOME") score += 8;

    // Income stability
    score += (100 - req.income_stability_index) * 0.2;

    // Behavioral risk
    score += req.behavior_score * 0.5;

    const fraud_risk_bps = Math.min(120, Math.round(score));
    const fraud_risk_tier =
      fraud_risk_bps < 20
        ? "LOW"
        : fraud_risk_bps < 50
        ? "MEDIUM"
        : "HIGH";

    return {
      fraud_score: fraud_risk_bps,
      fraud_risk_tier,
      fraud_risk_bps,
    };
  }
}
