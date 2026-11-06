// backend/pricing/exceptions/pricingOverride.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PricingOverrideService {
  async applyOverride(applicationId: string, overrideRate: number, reason: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        PricingResult: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!app || !app.PricingResult.length) {
      throw new Error("Cannot apply override: no pricing result found.");
    }

    const lastResult = app.PricingResult[0];

    const override = await prisma.pricingOverride.create({
      data: {
        applicationId,
        originalRate: lastResult.finalRate,
        counterRate: overrideRate,
        reason,
        metadata: {
          appliedBy: "ADMIN_OR_ENGINE",
        },
      },
    });

    // Persist override result
    await prisma.pricingResult.create({
      data: {
        applicationId,
        scenarioId: lastResult.scenarioId,
        finalRate: overrideRate,
        status: "OVERRIDDEN",
        details: {
          overrideReason: reason,
          originalRate: lastResult.finalRate,
        },
      },
    });

    return override;
  }
}

export const pricingOverrideService = new PricingOverrideService();
