import { Injectable } from "@nestjs/common";
import { MarketSnapshot } from "../market.service";

export interface ScenarioPricingResult {
  scenario_adj_bps: number;
  scenario: string;
}

@Injectable()
export class ScenarioPricingService {
  compute(snapshot: MarketSnapshot, scenario: string): ScenarioPricingResult {
    let adj = 0;

    switch (scenario) {
      case "RECESSION":
        adj += snapshot.volatility_index * 2;
        adj += snapshot.inflation_yoy * 5;
        adj += (snapshot.treasury_2y - snapshot.treasury_10y) * 10;
        break;

      case "HIGH_INFLATION":
        adj += snapshot.inflation_yoy * 12;
        adj += snapshot.volatility_index * 1.2;
        break;

      case "STRONG_GROWTH":
        adj -= snapshot.gdp_growth * 8;
        adj -= (100 - snapshot.unemployment_rate * 10) * 0.5;
        break;

      default:
        adj = 0;
    }

    return {
      scenario_adj_bps: Math.round(adj),
      scenario,
    };
  }
}
