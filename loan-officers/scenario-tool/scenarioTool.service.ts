import { Injectable } from "@nestjs/common";
import { ScenarioPricingService } from "../../pricing/scenario/scenarioPricing.service";
import { MarketService } from "../../pricing/market.service";

@Injectable()
export class ScenarioToolService {
  constructor(
    private readonly scenarioPricing: ScenarioPricingService,
    private readonly market: MarketService,
  ) {}

  async runScenario(scenario: string) {
    const snapshot = await this.market.getLatest();
    return this.scenarioPricing.compute(snapshot, scenario);
  }
}
