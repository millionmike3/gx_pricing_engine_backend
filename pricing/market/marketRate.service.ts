// backend/pricing/market/marketRate.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MarketRateService {
  async getMarketRate() {
    const snapshot = await prisma.marketSnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return { rate: 0 };
    }

    const base = snapshot.avgRate ?? 0;
    const volAdj = (snapshot.volatilityIndex ?? 0) * 0.01;
    const macroAdj = (snapshot.macroRiskScore ?? 0) * 0.005;

    const rate = base + volAdj + macroAdj;

    return { rate, components: { base, volAdj, macroAdj } };
  }
}

export const marketRateService = new MarketRateService();
