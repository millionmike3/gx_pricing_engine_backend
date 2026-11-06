import { PrismaClient } from "@prisma/client";
import { marketRateService } from "../base-rates/marketRate.service";
import { bankRateService } from "../base-rates/bankRate.service";
import { investorRateService } from "../base-rates/investorRate.service";

const prisma = new PrismaClient();

export class BaseRateService {
  async getBaseRate(applicationId: string) {
    const market = await marketRateService.getMarketRate();
    const bank = await bankRateService.getBankRate();
    const investor = await investorRateService.getInvestorRate(applicationId);

    // Weighted blend — you can tune these weights
    const baseRate =
      market.rate * 0.50 +
      bank.rate * 0.30 +
      investor.rate * 0.20;

    return {
      baseRate,
      components: {
        market: market.rate,
        bank: bank.rate,
        investor: investor.rate,
      },
    };
  }
}

export const baseRateService = new BaseRateService();
