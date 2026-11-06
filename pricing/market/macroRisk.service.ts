// backend/pricing/market/macroRisk.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MacroRiskService {
  async getMacroRisk() {
    const snapshot = await prisma.marketSnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return { macroRisk: 0 };
    }

    const inflationAdj = (snapshot.inflationIndex ?? 0) * 0.01;
    const employmentAdj = (snapshot.employmentIndex ?? 0) * -0.005;
    const gdpAdj = (snapshot.gdpIndex ?? 0) * 0.002;

    const macroRisk = inflationAdj + employmentAdj + gdpAdj;

    return {
      macroRisk,
      components: { inflationAdj, employmentAdj, gdpAdj },
    };
  }
}

export const macroRiskService = new MacroRiskService();
