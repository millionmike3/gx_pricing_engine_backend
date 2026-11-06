// backend/pricing/overlays/investorOverlay.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class InvestorOverlayService {
  async applyInvestorOverlay(applicationId: string, baseRate: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        pipelineDeals: {
          include: {
            investor: {
              include: {
                overlays: true,
              },
            },
          },
        },
      },
    });

    if (!app || !app.pipelineDeals.length) {
      return { rate: baseRate, adjustment: 0 };
    }

    const investor = app.pipelineDeals[0].investor;
    const overlays = investor?.overlays ?? [];

    let adjustment = 0;

    for (const overlay of overlays) {
      if (overlay.type === "RISK") {
        adjustment += overlay.value;
      }
      if (overlay.type === "BEHAVIOR") {
        adjustment += overlay.value;
      }
      if (overlay.type === "MARKET") {
        adjustment += overlay.value;
      }
    }

    return {
      rate: baseRate + adjustment,
      adjustment,
    };
  }
}

export const investorOverlayService = new InvestorOverlayService();
