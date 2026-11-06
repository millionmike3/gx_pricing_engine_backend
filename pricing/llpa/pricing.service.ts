import { Injectable } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { MarketService } from "./market.service";
import { BankService } from "./bank.service";
import { MatrixRepository } from "./repositories/matrix.repository";

import {
  computeBaseRate,
  computeMacroAdj,
  computeBankAdj,
  computeMargin,
  getPropertyAdj,
  getLendingAdj,
  bpsToRate,
} from "./llpaEngine"; // adjust import path as needed

@Injectable()
export class PricingService {
  constructor(
    private readonly config: ConfigService,
    private readonly market: MarketService,
    private readonly bank: BankService,
    private readonly matrixRepo: MatrixRepository,
  ) {}

  async computeDailyMatrix(date: string | Date): Promise<void> {
    const market = await this.market.getLatest();
    const bankRates = await this.bank.getLatest();
    const weights = await this.config.getCurrentWeights();
    const marginProfile = await this.config.getMarginProfile("STANDARD");
    const propertyAdjs = await this.config.getPropertyAdjustments();
    const creditTiers = await this.config.getCreditTiers();
    const lendingAdjs = await this.config.getLendingTypeAdjustments();

    const productTypes = ["30Y_FIXED", "15Y_FIXED", "5_1_ARM"];
    const propertyTypes = propertyAdjs.map(p => p.property_type);
    const lendingTypes = lendingAdjs.map(l => l.lending_type);

    for (const product of productTypes) {
      for (const prop of propertyTypes) {
        for (const lending of lendingTypes) {
          for (const tier of creditTiers) {
            const rateRow = this.computeRateRow({
              date,
              product,
              prop,
              lending,
              tier,
              market,
              bankRates,
              weights,
              marginProfile,
              propertyAdjs,
              lendingAdjs,
            });

            await this.matrixRepo.save(rateRow);
          }
        }
      }
    }
  }

  private computeRateRow(params: {
    date: string | Date;
    product: string;
    prop: string;
    lending: string;
    tier: any;
    market: any;
    bankRates: any;
    weights: any;
    marginProfile: any;
    propertyAdjs: any[];
    lendingAdjs: any[];
  }) {
    const {
      date,
      product,
      prop,
      lending,
      tier,
      market,
      bankRates,
      weights,
      marginProfile,
      propertyAdjs,
      lendingAdjs,
    } = params;

    const baseRate = computeBaseRate(market, weights);
    const macroAdjBps = computeMacroAdj(market, weights);
    const bankAdjBps = computeBankAdj(bankRates, product, baseRate);
    const propertyAdjBps = getPropertyAdj(prop, propertyAdjs);
    const creditAdjBps = tier.adjustment_bps;
    const lendingTypeAdjBps = getLendingAdj(lending, lendingAdjs);

    const marginBps = computeMargin(marginProfile, {
      risk_premium_bps: lendingTypeAdjBps,
    });

    const finalRate =
      baseRate +
      bpsToRate(macroAdjBps) +
      bpsToRate(bankAdjBps) +
      bpsToRate(propertyAdjBps) +
      bpsToRate(creditAdjBps) +
      bpsToRate(marginBps);

    return {
      date,
      product_type: product,
      property_type: prop,
      lending_type: lending,
      credit_tier: `${tier.credit_min}-${tier.credit_max}`,
      base_rate: baseRate,
      macro_adj_bps: macroAdjBps,
      bank_adj_bps: bankAdjBps,
      margin_bps: marginBps,
      property_adj_bps: propertyAdjBps,
      credit_adj_bps: creditAdjBps,
      lending_type_adj_bps: lendingTypeAdjBps,
      final_rate: finalRate,
    };
  }
}
