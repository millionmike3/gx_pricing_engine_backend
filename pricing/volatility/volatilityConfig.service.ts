// backend/pricing/volatility/volatilityConfig.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class VolatilityConfigService {
  async getVolatilityWeights() {
    return prisma.volatilityWeights.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  async getVolatilitySettings() {
    return prisma.volatilitySettings.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }
}

export const volatilityConfigService = new VolatilityConfigService();
