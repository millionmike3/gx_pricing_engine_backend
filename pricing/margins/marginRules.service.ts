// backend/pricing/margins/marginRules.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MarginRulesService {
  async getMarginRules() {
    return prisma.marginRule.findMany({
      orderBy: { priority: "asc" },
    });
  }

  applyRules(baseMargin: number, context: any) {
    let margin = baseMargin;

    if (context.risk_premium_bps) {
      margin += context.risk_premium_bps;
    }

    if (context.product_type === "5_1_ARM") {
      margin += 15; // ARM premium
    }

    if (context.investor_overlay_bps) {
      margin += context.investor_overlay_bps;
    }

    return margin;
  }
}

export const marginRulesService = new MarginRulesService();
