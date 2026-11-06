import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RateLockService {
  constructor(private readonly prisma: PrismaService) {}

  async lockRate(loanId: string, finalRate: number) {
    const lock = await this.prisma.rateLock.create({
      data: {
        loan_id: loanId,
        locked_rate: finalRate,
        locked_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return lock;
  }

  async getLock(loanId: string) {
    return this.prisma.rateLock.findFirst({
      where: { loan_id: loanId },
      orderBy: { locked_at: "desc" },
    });
  }
}
