import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { InvestorRateSheetRule, InvestorRateRow } from "./investorRateSheet.types";
import { DeliveryPricingService } from "../delivery/deliveryPricing.service";
import { ScenarioPricingService } from "../scenario/scenarioPricing.service";
import { MarketService } from "../market.service";

@Injectable()
export class InvestorRateSheetService {
  private readonly rules: InvestorRateSheetRule[];

  constructor(
    private readonly delivery: DeliveryPricingService,
    private readonly scenario: ScenarioPricingService,
    private readonly market: MarketService
  ) {
    const rulesPath = path.join(__dirname, "investorRateSheet.rules.json");
    this.rules = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
  }

  async generateRateSheet(): Promise<InvestorRateRow[]> {
    const snapshot = await this.market.getLatest();
    const deliveryPricing = await this.delivery.computeDeliveryPricing();
    const recessionScenario = await this.scenario.compute(snapshot, "RECESSION");

    const productTypes = ["30Y_FIXED", "15Y_FIXED", "5_1_ARM"];
    const rows: InvestorRateRow[] = [];

    for (const rule of this.rules) {
      for (const product of productTypes) {
        const executionAdj = rule.execution_curve_bps[product] || 0;

        const overlayAdj =
          (rule.overlays_bps["HIGH_VOLATILITY"] || 0) +
          (rule.overlays_bps["RECESSION_RISK"] || 0);

        const buyPrice =
          rule.base_margin_bps +
          executionAdj +
          deliveryPricing.total_delivery_bps +
          overlayAdj;

        const sellPrice = buyPrice + 25; // 25 bps spread

        rows.push({
          investor: rule.investor,
          product_type: product,
          buy_price_bps: Math.round(buyPrice),
          sell_price_bps: Math.round(sellPrice),
          execution_adj_bps: executionAdj,
          overlay_adj_bps: overlayAdj,
        });
      }
    }

    return rows;
  }
}
