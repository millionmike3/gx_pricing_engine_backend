// backend/pricing/overlays/llpaOverlay.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LLPAOverlayService {
  async applyLLPAOverlay(applicationId: string, baseRate: number) {
    const matrix = await prisma.pricingMatrix.findFirst({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });

    if (!matrix) {
      return { rate: baseRate, adjustment: 0 };
    }

    const llpa = matrix.totalLLPA ?? 0;
    const adjustment = llpa * 0.01;

    return {
      rate: baseRate + adjustment,
      adjustment,
    };
  }
}

export const llpaOverlayService = new LLPAOverlayService();
