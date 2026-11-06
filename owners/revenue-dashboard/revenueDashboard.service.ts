import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface RevenueByProduct {
  product_type: string;
  total_loans: number;
  total_revenue_bps: number;
  total_revenue_dollars: number;
}

export interface RevenueSummary {
  total_loans: number;
  total_revenue_dollars: number;
  avg_margin_bps: number;
  by_product: RevenueByProduct[];
}

@Injectable()
export class RevenueDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<RevenueSummary> {
    const rows = await this.prisma.pricingMatrix.findMany({
      select: {
        product_type: true,
        margin_bps: true,
        final_rate: true,
        loan_amount: true,
      },
    });

    const byProductMap = new Map<string, RevenueByProduct>();

    let totalLoans = 0;
    let totalRevenueDollars = 0;
    let totalMarginBps = 0;

    for (const row of rows) {
      const revenueBps = row.margin_bps;
      const revenueDollars = (row.loan_amount * revenueBps) / 10000;

      totalLoans += 1;
      totalRevenueDollars += revenueDollars;
      totalMarginBps += revenueBps;

      const existing = byProductMap.get(row.product_type) || {
        product_type: row.product_type,
        total_loans: 0,
        total_revenue_bps: 0,
        total_revenue_dollars: 0,
      };

      existing.total_loans += 1;
      existing.total_revenue_bps += revenueBps;
      existing.total_revenue_dollars += revenueDollars;

      byProductMap.set(row.product_type, existing);
    }

    const by_product = Array.from(byProductMap.values()).map(p => ({
      ...p,
      total_revenue_bps: Math.round(p.total_revenue_bps),
      total_revenue_dollars: Math.round(p.total_revenue_dollars),
    }));

    return {
      total_loans: totalLoans,
      total_revenue_dollars: Math.round(totalRevenueDollars),
      avg_margin_bps: totalLoans ? Math.round(totalMarginBps / totalLoans) : 0,
      by_product,
    };
  }
}
