// backend/pricing/volatility/volatility.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { computeVolatility, computeMovementScore } from "./volatilityCalculator";
import { VolatilityResult } from "./volatilityTypes";

const prisma = new PrismaClient();

@Injectable()
export class VolatilityService {
  async getRateVolatility(): Promise<VolatilityResult> {
    const snapshots = await prisma.marketSnapshot.findMany({
      orderBy: { timestamp: "desc" },
      take: 30,
    });

    if (!snapshots.length) {
      return { volatility: 0, movementScore: 0 };
    }

    const volatility = computeVolatility(snapshots);
    const movementScore = computeMovementScore(snapshots[0]);

    return { volatility, movementScore };
  }
}

export const volatilityService = new VolatilityService();
