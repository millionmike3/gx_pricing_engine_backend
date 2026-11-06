// backend/pricing/market/marketVolatility.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MarketVolatilityService {
  async getVolatility() {
    const snapshots = await prisma.marketSnapshot.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    if (!snapshots.length) {
      return { volatility: 0 };
    }

    const rates = snapshots.map(s => s.avgRate);
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;

    const variance =
      rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
      rates.length;

    const volatility = Math.sqrt(variance);

    return { volatility };
  }
}

export const marketVolatilityService = new MarketVolatilityService();
