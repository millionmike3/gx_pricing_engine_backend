// backend/pricing/scenario/scenarioAdjustments.ts

import { PricingScenarioType } from "./scenarioTypes";

export function computeScenarioAdjustment(snapshot: any, scenario: PricingScenarioType): number {
  const spread_2s10s = snapshot.treasury_2y - snapshot.treasury_10y;
  const inflation = snapshot.inflation_yoy;
  const volatility = snapshot.volatility_index;
  const growth = snapshot.gdp_growth;
  const unemployment = snapshot.unemployment_rate;

  switch (scenario) {
    case "RECESSION":
      return Math.round(
        volatility * 2 +
        inflation * 5 +
        spread_2s10s * 10 +
        unemployment * 3
      );

    case "HIGH_INFLATION":
      return Math.round(
        inflation * 12 +
        volatility * 1.2 +
        spread_2s10s * 4
      );

    case "STRONG_GROWTH":
      return Math.round(
        -growth * 8 -
        (100 - unemployment * 10) * 0.5
      );

    default:
      return 0;
  }
}
