// backend/pricing/margins/marginConfig.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MarginConfigService {
  async getCurrentWeights() {
    return prisma.marginWeight.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }

  async getMarginProfile(name: string) {
    return prisma.marginProfile.findUnique({
      where: { name },
    });
  }

  async getGlobalMarginSettings() {
    return prisma.marginSettings.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }
}

export const marginConfigService = new MarginConfigService();
