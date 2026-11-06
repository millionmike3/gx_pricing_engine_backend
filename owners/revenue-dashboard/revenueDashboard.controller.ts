import { Controller, Get } from "@nestjs/common";
import { RevenueDashboardService } from "./revenueDashboard.service";

@Controller("owners/revenue")
export class RevenueDashboardController {
  constructor(private readonly revenue: RevenueDashboardService) {}

  @Get("summary")
  async getSummary() {
    return this.revenue.getSummary();
  }
}
