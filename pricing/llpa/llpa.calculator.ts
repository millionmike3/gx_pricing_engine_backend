import {
  CreditTier,
  PropertyAdjustment,
  LendingAdjustment,
  MarginProfile,
  LLPARequest,
} from "./llpa.types";
import { bpsToRate } from "./llpa.utils";

export class LLPACalculator {
  constructor(
    private creditTiers: CreditTier[],
    private propertyAdjs: PropertyAdjustment[],
    private lendingAdjs: LendingAdjustment[],
    private marginProfiles: Record<string, MarginProfile>,
    private baseRates: Record<string, number>,
    private overlays: any[]
  ) {}

  computeLLPA(req: LLPARequest) {
    const baseRate = this.baseRates[req.product_type];

    const creditTier = this.creditTiers.find(
      t => req.credit_score >= t.credit_min && req.credit_score <= t.credit_max
    );

    const propertyAdj = this.propertyAdjs.find(
      p => p.property_type === req.property_type
    );

    const lendingAdj = this.lendingAdjs.find(
      l => l.lending_type === req.lending_type
    );

    const marginProfile = this.marginProfiles["STANDARD"];

    const marginBps =
      marginProfile.base_margin_bps +
      marginProfile.risk_multiplier * lendingAdj.adjustment_bps;

    const finalRate =
      baseRate +
      bpsToRate(creditTier.adjustment_bps) +
      bpsToRate(propertyAdj.adjustment_bps) +
      bpsToRate(lendingAdj.adjustment_bps) +
      bpsToRate(marginBps);

    return {
      base_rate: baseRate,
      credit_adj_bps: creditTier.adjustment_bps,
      property_adj_bps: propertyAdj.adjustment_bps,
      lending_type_adj_bps: lendingAdj.adjustment_bps,
      margin_bps: marginBps,
      final_rate: finalRate,
    };
  }
}
