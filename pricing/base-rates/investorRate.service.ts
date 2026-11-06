import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class InvestorRateService {
  async getInvestorRate(applicationId: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        pipelineDeals: {
          include: {
            investor: {
              include: {
                pricingSheet: true,
              },
            },
          },
        },
      },
    });

    if (!app || !app.pipelineDeals.length) {
      return { rate: 0 };
    }

    const investor = app.pipelineDeals[0].investor;
    const sheet = investor?.pricingSheet;

    if (!sheet) {
      return { rate: 0 };
    }

    // Example logic — investor base + LLPA + risk band
    const base = sheet.baseRate ?? 0;
    const llpa = sheet.llpa ?? 0;
    const riskAdj = (sheet.riskBandScore ?? 0) * 0.01;

    const rate = base + llpa + riskAdj;

    return { rate };
  }
}

export const investorRateService = new InvestorRateService();
