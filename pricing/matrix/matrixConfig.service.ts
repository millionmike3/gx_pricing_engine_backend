// backend/pricing/matrix/matrixConfig.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MatrixConfigService {
  async loadAllConfig() {
    const market = await prisma.marketSnapshot.findFirst({
      orderBy: { timestamp: "desc" },
    });

    const bankRates = await prisma.bankRateSnapshot.findFirst({
      orderBy: { timestamp: "desc" },
    });

    const weights = await prisma.matrixWeights.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const marginProfile = await prisma.marginProfile.findFirst({
      where: { name: "DEFAULT" },
    });

    const propertyAdjs = await prisma.propertyAdjustment.findMany();
    const lendingAdjs = await prisma.lendingTypeAdjustment.findMany();
    const creditTiers = await prisma.creditTier.findMany();

    return {
      market,
      bankRates,
      weights,
      marginProfile,
      propertyAdjs,
      lendingAdjs,
      creditTiers,
    };
  }
}

export const matrixConfigService = new MatrixConfigService();
