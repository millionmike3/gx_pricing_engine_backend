// backend/pricing/scenario/pricingScenario.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { scenarioConfigService } from "./scenarioConfig.service";
import { computeScenarioAdjustment } from "./scenarioAdjustments";
import { PricingScenarioType } from "./scenarioTypes";

const prisma = new PrismaClient();

@Injectable()
export class PricingScenarioService {
  async generateScenarios(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { underwriting: true },
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const market = await prisma.marketSnapshot.findFirst({
      orderBy: { timestamp: "desc" },
    });

    if (!market) {
      throw new Error("No market snapshot available");
    }

    const scenarioList = await scenarioConfigService.getScenarioList();
    const results = [];

    for (const scenario of scenarioList) {
      const type = scenario.type as PricingScenarioType;

      const adjustmentBps = computeScenarioAdjustment(market, type);
      const adjustmentRate = adjustmentBps / 100;

      const scenarioRecord = await prisma.pricingScenario.create({
        data: {
          applicationId,
          scenarioType: type,
          adjustmentBps,
          adjustmentRate,
          metadata: {
            market,
            underwriting: application.underwriting,
          },
        },
      });

      results.push(scenarioRecord);
    }

    return results;
  }
}

export const pricingScenarioService = new PricingScenarioService();
