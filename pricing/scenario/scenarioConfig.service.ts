// backend/pricing/scenario/scenarioConfig.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ScenarioConfigService {
  async getScenarioWeights() {
    return prisma.scenarioWeights.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  async getScenarioDefaults() {
    return prisma.scenarioDefaults.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  async getScenarioList() {
    return prisma.pricingScenarioConfig.findMany({
      orderBy: { priority: "asc" },
    });
  }
}

export const scenarioConfigService = new ScenarioConfigService();
