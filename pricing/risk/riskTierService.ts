import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import {
  RiskTierRule,
  RiskTierRequest,
  RiskTierResult,
} from "./riskTier.types";

@Injectable()
export class RiskTierService {
  private readonly rules: RiskTierRule[];

  constructor() {
    const rulesPath = path.join(__dirname, "riskTier.rules.json");
    this.rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  }

  /**
   * Compute risk tier based on credit score + other risk factors.
   */
  computeRiskTier(req: RiskTierRequest): RiskTierResult {
    const creditTier = this.rules.find(
      r => req.credit_score >= r.min_score && req.credit_score <= r.max_score
    );

    if (!creditTier) {
      return {
        tier: "UNDEFINED",
        risk_score: 999,
        risk_premium_bps: 150,
      };
    }

    // Additional risk factors beyond credit score
    const dtiPenalty = this.computeDtiPenalty(req.dti);
    const ltvPenalty = this.computeLtvPenalty(req.ltv);
    const propertyPenalty = this.computePropertyPenalty(req.property_type);
    const lendingPenalty = this.computeLendingPenalty(req.lending_type);
    const volatilityPenalty = this.computeVolatilityPenalty(req.volatility_index);

    const riskScore =
      creditTier.min_score -
      dtiPenalty -
      ltvPenalty -
      propertyPenalty -
      lendingPenalty -
      volatilityPenalty;

    const riskPremium =
      creditTier.risk_premium_bps +
      dtiPenalty +
      ltvPenalty +
      propertyPenalty +
      lendingPenalty +
      volatilityPenalty;

    return {
      tier: creditTier.tier,
      risk_score: Math.max(0, Math.round(riskScore)),
      risk_premium_bps: Math.max(0, Math.round(riskPremium)),
    };
  }

  private computeDtiPenalty(dti: number): number {
    if (dti < 36) return 0;
    if (dti < 43) return 8;
    if (dti < 50) return 18;
    return 35;
  }

  private computeLtvPenalty(ltv: number): number {
    if (ltv < 70) return 0;
    if (ltv < 80) return 10;
    if (ltv < 90) return 25;
    return 45;
  }

  private computePropertyPenalty(propertyType: string): number {
    switch (propertyType) {
      case "SFR":
        return 0;
      case "CONDO":
        return 12;
      case "MULTI":
        return 25;
      case "2_4_UNIT":
        return 40;
      default:
        return 15;
    }
  }

  private computeLendingPenalty(lendingType: string): number {
    switch (lendingType) {
      case "PURCHASE":
        return 0;
      case "REFI_RATE_TERM":
        return 10;
      case "REFI_CASH_OUT":
        return 35;
      case "HELOC":
        return 55;
      default:
        return 20;
    }
  }

  private computeVolatilityPenalty(volatility: number): number {
    if (volatility < 15) return 0;
    if (volatility < 25) return 10;
    if (volatility < 35) return 22;
    return 40;
  }
}
