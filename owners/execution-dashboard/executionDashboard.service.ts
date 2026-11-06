import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

interface ExecutionBucket {
  investor: string;
  total_loans: number;
  avg_execution_bps: number;
  total_pnl_dollars: number;
}

interface ExecutionDashboardSummary {
  total_loans: number;
  total_pnl_dollars: number;
  buckets: ExecutionBucket[];
}

@Injectable()
export class ExecutionDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<ExecutionDashboardSummary> {
    const rows = await this.prisma.executionSnapshot.findMany({
      select: {
        investor: true,
        execution_bps: true,
        pnl_dollars: true,
      },
    });

    const buckets = new Map<string, ExecutionBucket>();
    let totalLoans = 0;
    let totalPnl = 0;

    for (const row of rows) {
      totalLoans += 1;
      totalPnl += row.pnl_dollars;

      const key = row.investor || "UNKNOWN";
      const existing =
        buckets.get(key) || {
          investor: key,
          total_loans: 0,
          avg_execution_bps: 0,
          total_pnl_dollars: 0,
        };

      existing.total_loans += 1;
      existing.avg_execution_bps += row.execution_bps;
      existing.total_pnl_dollars += row.pnl_dollars;

      buckets.set(key, existing);
    }

    const resultBuckets = Array.from(buckets.values()).map(b => ({
      ...b,
      avg_execution_bps: b.total_loans
        ? Math.round(b.avg_execution_bps / b.total_loans)
        : 0,
      total_pnl_dollars: Math.round(b.total_pnl_dollars),
    }));

    return {
      total_loans: totalLoans,
      total_pnl_dollars: Math.round(totalPnl),
      buckets: resultBuckets,
    };
  }
}
