import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

interface BehaviorBucket {
  behavior_tier: string;
  count: number;
  avg_behavior_score: number;
}

interface BehaviorDashboardSummary {
  total_loans: number;
  buckets: BehaviorBucket[];
}

@Injectable()
export class BehaviorDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<BehaviorDashboardSummary> {
    const rows = await this.prisma.loanBehaviorSnapshot.findMany({
      select: {
        behavior_tier: true,
        behavior_score: true,
      },
    });

    const buckets = new Map<string, BehaviorBucket>();
    let totalLoans = 0;

    for (const row of rows) {
      totalLoans += 1;
      const key = row.behavior_tier || "UNKNOWN";
      const existing =
        buckets.get(key) || { behavior_tier: key, count: 0, avg_behavior_score: 0 };

      existing.count += 1;
      existing.avg_behavior_score += row.behavior_score;

      buckets.set(key, existing);
    }

    const resultBuckets = Array.from(buckets.values()).map(b => ({
      ...b,
      avg_behavior_score: b.count ? Math.round(b.avg_behavior_score / b.count) : 0,
    }));

    return {
      total_loans: totalLoans,
      buckets: resultBuckets,
    };
  }
}
