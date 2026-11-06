// backend/pricing/margins/marginCalculator.ts

import { computeRiskPremium, computeProductPremium, computeInvestorPremium } from "./marginAdjustments";
import { marginRulesService } from "./marginRules.service";

export function computeMargin(profile: any, context: any): number {
  let margin = profile.base_margin_bps ?? 0;

  margin += computeRiskPremium(context.risk_score ?? 0);
  margin += computeProductPremium(context.product_type ?? "");
  margin += computeInvestorPremium(context.investor_risk_band ?? 0);

  margin = marginRulesService.applyRules(margin, context);

  return margin;
}
