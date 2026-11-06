import { Controller, Get } from "@nestjs/common";
import { FraudDashboardService } from "./fraudDashboard.service";

@Controller("owners/fraud")
export class FraudDashboardController {
  constructor(private readonly fraud: FraudDashboardService) {}

  @Get("summary")
  async getSummary() {
    return this.fraud.getSummary();
  }
}
