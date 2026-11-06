import { Controller, Get } from "@nestjs/common";
import { BehaviorDashboardService } from "./behaviorDashboard.service";

@Controller("owners/behavior")
export class BehaviorDashboardController {
  constructor(private readonly behavior: BehaviorDashboardService) {}

  @Get("summary")
  async getSummary() {
    return this.behavior.getSummary();
  }
}
