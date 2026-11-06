// backend/pricing/overlays/pricingOverlay.service.ts

import { investorOverlayService } from "./investorOverlay.service";
import { riskOverlayService } from "./riskOverlay.service";
import { behaviorOverlayService } from "./behaviorOverlay.service";
import { marketOverlayService } from "./marketOverlay.service";
import { llpaOverlayService } from "./llpaOverlay.service";

export class PricingOverlayService {
  async applyAllOverlays(applicationId: string, baseRate: number) {
    const investor = await investorOverlayService.applyInvestorOverlay(applicationId, baseRate);
    const risk = await riskOverlayService.applyRiskOverlay(applicationId, investor.rate);
    const behavior = await behaviorOverlayService.applyBehaviorOverlay(applicationId, risk.rate);
    const market = await marketOverlayService.applyMarketOverlay(behavior.rate);
    const llpa = await llpaOverlayService.applyLLPAOverlay(applicationId, market.rate);

    return {
      finalRate: llpa.rate,
      adjustments: {
        investor: investor.adjustment,
        risk: risk.adjustment,
        behavior: behavior.adjustment,
        market: market.adjustment,
        llpa: llpa.adjustment,
      },
    };
  }
}

export const pricingOverlayService = new PricingOverlayService();
