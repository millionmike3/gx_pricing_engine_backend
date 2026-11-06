import { Injectable } from "@nestjs/common";
import { MarketSnapshot } from "../market.service";

export interface DeliveryPricingResult {
  delivery_adj_bps: number;
  delivery_risk_tier: string;
}

@Injectable()
export class DeliveryPricingService {
  compute(snapshot: MarketSnapshot): DeliveryPricingResult {
    let adj = 0;

    // MBS spread drives delivery cost
    const mbsSpread = snapshot.mbs_current_coupon - snapshot.treasury_10y;
    adj += mbsSpread * 12;

    // Volatility adds delivery cost
    adj += snapshot.volatility_index * 0.8;

    // Inflation adds delivery cost
    adj += snapshot.inflation_yoy * 5;

    const delivery_adj_bps = Math.round(adj);

    const delivery_risk_tier =
      delivery_adj_bps < 40
        ? "LOW"
        : delivery_adj_bps < 80
        ? "MEDIUM"
        : "HIGH";

    return {
      delivery_adj_bps,
      delivery_risk_tier,
    };
  }
}
