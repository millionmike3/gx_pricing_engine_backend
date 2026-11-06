import { Injectable } from "@nestjs/common";

export interface FinancialHealthRequest {
  fico: number;
  dti: number;
  ltv: number;
  reserves_months: number;
  employment_stability_index: number;
  income_stability_index: number;
}

export interface FinancialHealthResult {
  health_score: number;
  health_tier: string;
  health_bps: number;
}

@Injectable()
export class FinancialHealthService {
  compute(req: FinancialHealthRequest): FinancialHealthResult {
    let score = req.fico;

    // DTI penalty
    if (req.dti > 50) score -= 40;
    else if (req.dti > 43) score -= 20;

    // LTV penalty
    if (req.ltv > 90) score -= 40;
    else if (req.ltv > 80) score -= 20;

    // Reserves bonus
    score += req.reserves_months * 2;

    // Employment stability
    score += req.employment_stability_index * 0.5;

    // Income stability
    score += req.income_stability_index * 0.5;

    const health_bps = Math.max(0, Math.round((760 - score) * 0.15));

    const health_tier =
      score >= 740
        ? "A"
        : score >= 700
        ? "B"
        : score >= 660
        ? "C"
        : "D";

    return {
      health_score: score,
      health_tier,
      health_bps,
    };
  }
}
