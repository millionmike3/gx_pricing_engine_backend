import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PricingViewerService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatrixForLoan(loanId: string) {
    return this.prisma.pricingMatrix.findMany({
      where: { loan_id: loanId },
      orderBy: { product_type: "asc" },
    });
  }
}
