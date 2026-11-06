import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

interface FraudBucket {
  fraud_risk_tier: string;
  count: number;
  avg_fraud_score: number;
}

interface FraudDashboardSummary {
  total_loans: number;
  buckets: FraudBucket[];
}

@Injectable()
export class FraudDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<FraudDashboardSummary> {
    const rows = await this.prisma.loanRiskSnapshot.findMany({
      select: {
        fraud_risk_tier: true,
        fraud_score: true,
      },
    });

    const buckets = new Map<string, FraudBucket>();
    let totalLoans = 0;

    for (const row of rows) {
      totalLoans += 1;
      const key = row.fraud_risk_tier || "UNKNOWN";
      const existing =
        buckets.get(key) || { fraud_risk_tier: key, count: 0, avg_fraud_score: 0 };

      existing.count += 1;
      existing.avg_fraud_score += row.fraud_score;

      buckets.set(key, existing);
    }

    const resultBuckets = Array.from(buckets.values()).map(b => ({
      ...b,
      avg_fraud_score: b.count ? Math.round(b.avg_fraud_score / b.count) : 0,
    }));

    return {
      total_loans: totalLoans,
      buckets: resultBuckets,
    };
  }
}
