// backend/pricing/engine/pricingEngine.service.ts

import { PrismaClient } from "@prisma/client";
import { baseRateService } from "../base-rates/baseRate.service";
import { behaviorService } from "../behavior/behavior.service";
import { volatilityService } from "../../intelligence/volatility/volatility.service";
import { riskTierService } from "../../intelligence/risktier/riskTier.service";

const prisma = new PrismaClient();

export class PricingEngineService {
  async priceApplication(applicationId: string) {
    // 1. Load core application + underwriting context
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        underwriting: true,
        PricingScenario: true,
        PricingResult: true,
      },
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // 2. Base rate (market + bank + investor)
    const base = await baseRateService.getBaseRate(applicationId);

    // 3. Risk tier (DTI, LTV, CLTV, reserves)
    const riskTier = await riskTierService.getRiskTier(applicationId);

    // 4. Behavior adjustment (borrower behavior snapshot)
    const behaviorAdj = await behaviorService.getBehaviorAdjustments(applicationId);

    // 5. Volatility adjustment (market volatility)
    const vol = await volatilityService.getRateVolatility();

    // 6. Combine components into final rate
    const riskAdj = riskTier.adjustment ?? 0;
    const behaviorAdjustment = behaviorAdj.adjustment ?? 0;
    const volatilityAdjustment = vol.volatility ?? 0;

    const finalRate =
      base.baseRate +
      riskAdj +
      behaviorAdjustment +
      volatilityAdjustment;

    // 7. Persist scenario
    const scenario = await prisma.pricingScenario.create({
      data: {
        applicationId,
        baseRate: base.baseRate,
        marketRate: base.components.market,
        bankRate: base.components.bank,
        investorRate: base.components.investor,
        riskAdjustment: riskAdj,
        behaviorAdjustment,
        volatilityAdjustment,
        finalRate,
        metadata: {
          riskTier,
        },
      },
    });

    // 8. Persist result
    const result = await prisma.pricingResult.create({
      data: {
        applicationId,
        scenarioId: scenario.id,
        finalRate,
        status: "COMPUTED",
        details: {
          baseRate: base.baseRate,
          components: base.components,
          riskAdjustment: riskAdj,
          behaviorAdjustment,
          volatilityAdjustment,
        },
      },
    });

    // 9. Audit log
    await prisma.pricingAuditLog.create({
      data: {
        actorRole: "ENGINE",
        actorId: null,
        action: "PRICE_APPLICATION",
        module: "PRICING_ENGINE",
        details: `Priced application ${applicationId} at rate ${finalRate.toFixed(
          4
        )}`,
        createdAt: new Date(),
      },
    });

    return {
      applicationId,
      finalRate,
      scenario,
      result,
    };
  }
}

export const pricingEngineService = new PricingEngineService();
