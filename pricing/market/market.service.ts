import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface MarketSnapshot {
  timestamp: Date;
  treasury_10y: number;
  treasury_2y: number;
  mbs_current_coupon: number;
  mbs_30yr: number;
  mbs_15yr: number;
  inflation_yoy: number;
  unemployment_rate: number;
  gdp_growth: number;
  volatility_index: number;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch the latest market snapshot from the database.
   */
  async getLatest(): Promise<MarketSnapshot> {
    const snapshot = await this.prisma.marketSnapshot.findFirst({
      orderBy: { timestamp: "desc" },
    });

    if (!snapshot) {
      this.logger.warn("No market snapshot found, using defaults");
      return this.getDefaultSnapshot();
    }

    return this.normalizeSnapshot(snapshot);
  }

  /**
   * Normalize DB record into MarketSnapshot interface.
   */
  private normalizeSnapshot(record: any): MarketSnapshot {
    return {
      timestamp: record.timestamp,
      treasury_10y: record.treasury_10y,
      treasury_2y: record.treasury_2y,
      mbs_current_coupon: record.mbs_current_coupon,
      mbs_30yr: record.mbs_30yr,
      mbs_15yr: record.mbs_15yr,
      inflation_yoy: record.inflation_yoy,
      unemployment_rate: record.unemployment_rate,
      gdp_growth: record.gdp_growth,
      volatility_index: record.volatility_index,
    };
  }

  /**
   * Default snapshot used when no market data exists.
   */
  private getDefaultSnapshot(): MarketSnapshot {
    return {
      timestamp: new Date(),
      treasury_10y: 4.50,
      treasury_2y: 4.70,
      mbs_current_coupon: 5.75,
      mbs_30yr: 5.90,
      mbs_15yr: 5.40,
      inflation_yoy: 3.2,
      unemployment_rate: 4.0,
      gdp_growth: 1.8,
      volatility_index: 19.5,
    };
  }

  /**
   * Compute macro factor weights used by LLPA and pricing engine.
   */
  computeMacroFactors(snapshot: MarketSnapshot) {
    const spread_2s10s = snapshot.treasury_2y - snapshot.treasury_10y;
    const mbs_spread = snapshot.mbs_current_coupon - snapshot.treasury_10y;

    return {
      yield_curve_inversion: spread_2s10s,
      mbs_spread,
      inflation_pressure: snapshot.inflation_yoy,
      labor_market_strength: 100 - snapshot.unemployment_rate * 10,
      economic_growth: snapshot.gdp_growth,
      volatility: snapshot.volatility_index,
    };
  }

  /**
   * Compute market-driven risk premium (bps).
   */
  computeMarketRiskPremium(snapshot: MarketSnapshot): number {
    const macro = this.computeMacroFactors(snapshot);

    let premium = 0;

    // Yield curve inversion increases risk premium
    if (macro.yield_curve_inversion > 0) {
      premium += macro.yield_curve_inversion * 8;
    }

    // High volatility increases premium
    premium += macro.volatility * 1.5;

    // Inflation pressure increases premium
    premium += macro.inflation_pressure * 4;

    // Strong labor market reduces premium
    premium -= macro.labor_market_strength * 0.1;

    // Economic growth reduces premium
    premium -= macro.economic_growth * 2;

    return Math.max(0, Math.round(premium));
  }

  /**
   * Compute delivery pricing adjustments (bps).
   */
  computeDeliveryAdjustment(snapshot: MarketSnapshot): number {
    const macro = this.computeMacroFactors(snapshot);

    let adj = 0;

    // MBS spread drives delivery pricing
    adj += macro.mbs_spread * 12;

    // Volatility adds delivery cost
    adj += macro.volatility * 0.8;

    return Math.round(adj);
  }

  /**
   * Compute scenario pricing adjustments (bps).
   */
  computeScenarioAdjustment(snapshot: MarketSnapshot, scenario: string): number {
    const macro = this.computeMacroFactors(snapshot);

    switch (scenario) {
      case "RECESSION":
        return Math.round(
          macro.volatility * 2 +
            macro.inflation_pressure * 5 +
            macro.yield_curve_inversion * 10
        );

      case "HIGH_INFLATION":
        return Math.round(
          macro.inflation_pressure * 12 + macro.volatility * 1.2
        );

      case "STRONG_GROWTH":
        return Math.round(
          -macro.economic_growth * 8 - macro.labor_market_strength * 0.5
        );

      default:
        return 0;
    }
  }
}
