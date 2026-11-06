// backend/pricing/overlays/marketOverlay.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MarketOverlayService {
  async applyMarketOverlay(baseRate: number) {
    const snapshot = await prisma.marketSnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return { rate: baseRate, adjustment: 0 };
    }

    const volAdj = (snapshot.volatilityIndex ?? 0) * 0.01;
    const macroAdj = (snapshot.macroRiskScore ?? 0) * 0.005;

    const adjustment = volAdj + macroAdj;

    return {
      rate: baseRate + adjustment,
      adjustment,
    };
  }
}

export const marketOverlayService = new MarketOverlayService();
