// backend/pricing/matrix/pricingMatrix.service.ts

import { Injectable } from "@nestjs/common";
import { matrixConfigService } from "./matrixConfig.service";
import {
  computeBaseRate,
  computeMacroAdj,
  computeBankAdj,
  computeMargin,
  bpsToRate,
} from "./matrixAdjustments";

@Injectable()
export class PricingMatrixService {
  async priceBorrower(req: {
    amount: number;
    fico: number;
    property_type: string;
    lending_type: string;
    margin_profile: string;
  }) {
    // 1. Load all matrix configuration
    const market = await matrixConfigService.getMarketSnapshot();
    const bankRates = await matrixConfigService.getBankRates();
    const weights = await matrixConfigService.getWeights();
    const marginProfile = await matrixConfigService.getMarginProfile(
      req.margin_profile
    );

    const propertyAdjs = await matrixConfigService.getPropertyAdjustments();
    const lendingAdjs = await matrixConfigService.getLendingTypeAdjustments();
    const creditTiers = await matrixConfigService.getCreditTiers();

    // 2. Determine credit tier
    const tier = creditTiers.find(
      t => req.fico >= t.credit_min && req.fico <= t.credit_max
    );

    if (!tier) {
      throw new Error(`No credit tier found for FICO ${req.fico}`);
    }

    // 3. Property + lending adjustments
    const propertyAdj = propertyAdjs.find(
      p => p.property_type === req.property_type
    );
    const lendingAdj = lendingAdjs.find(
      l => l.lending_type === req.lending_type
    );

    if (!propertyAdj || !lendingAdj) {
      throw new Error("Invalid property or lending type");
    }

    // 4. Products to price
    const productTypes = ["30Y_FIXED", "15Y_FIXED", "5_1_ARM"];
    const results = [];

    for (const product of productTypes) {
      // 5. Base rate
      const baseRate = computeBaseRate(market, weights);

      // 6. Adjustments
      const macroAdjBps = computeMacroAdj(market, weights);
      const bankAdjBps = computeBankAdj(bankRates, product, baseRate);
      const propertyAdjBps = propertyAdj.adjustment_bps;
      const creditAdjBps = tier.adjustment_bps;
      const lendingAdjBps = lendingAdj.adjustment_bps;

      // 7. Margin
      const marginBps = computeMargin(marginProfile, {
        risk_premium_bps: lendingAdjBps,
        product_type: product,
      });

      // 8. Final rate
      const finalRate =
        baseRate +
        bpsToRate(macroAdjBps) +
        bpsToRate(bankAdjBps) +
        bpsToRate(propertyAdjBps) +
        bpsToRate(creditAdjBps) +
        bpsToRate(lendingAdjBps) +
        bpsToRate(marginBps);

      // 9. Payment
      const payment = this.computePayment(req.amount, finalRate, product);

      // 10. Push result
      results.push({
        product_type: product,
        property_type: req.property_type,
        lending_type: req.lending_type,
        credit_tier: `${tier.credit_min}-${tier.credit_max}`,
        base_rate: baseRate,
        macro_adj_bps: macroAdjBps,
        bank_adj_bps: bankAdjBps,
        property_adj_bps: propertyAdjBps,
        credit_adj_bps: creditAdjBps,
        lending_type_adj_bps: lendingAdjBps,
        margin_bps: marginBps,
        final_rate: finalRate,
        payment,
      });
    }

    return results;
  }

  // ---------------------------------------------------------
  // PRIVATE PAYMENT CALCULATOR (embedded exactly as requested)
  // ---------------------------------------------------------
  private computePayment(amount: number, rate: number, product: string): number {
    const termYears =
      product === "15Y_FIXED" ? 15 :
      product === "5_1_ARM" ? 30 :
      30;

    const monthlyRate = rate / 100 / 12;
    const n = termYears * 12;

    if (monthlyRate === 0) {
      return Math.round(amount / n);
    }

    const payment =
      (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));

    return Math.round(payment);
  }
}

export const pricingMatrixService = new PricingMatrixService();
