import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PricingSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(loanId: string) {
    const matrixRow = await this.prisma.pricingMatrix.findFirst({
      where: { loan_id: loanId },
      orderBy: { final_rate: "asc" },
    });

    const risk = await this.prisma.loanRiskSnapshot.findFirst({
      where: { loan_id: loanId },
    });

    const behavior = await this.prisma.loanBehaviorSnapshot.findFirst({
      where: { loan_id: loanId },
    });

    const lock = await this.prisma.rateLock.findFirst({
      where: { loan_id: loanId },
      orderBy: { locked_at: "desc" },
    });

    return {
      pricing: matrixRow,
      risk,
      behavior,
      lock,
    };
  }
}
