import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BankRateService {
  async getBankRate() {
    const snapshot = await prisma.bankRateSnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return { rate: 0 };
    }

    // Example logic — bank margin + liquidity adjustment
    const base = snapshot.baseRate ?? 0;
    const margin = snapshot.bankMargin ?? 0;
    const liquidityAdj = (snapshot.liquidityScore ?? 0) * 0.002;

    const rate = base + margin + liquidityAdj;

    return { rate };
  }
}

export const bankRateService = new BankRateService();
