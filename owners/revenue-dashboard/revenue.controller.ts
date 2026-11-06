import { Controller, Get } from "@nestjs/common";
import { RevenueService } from "./revenue.service";

@Controller("owners/revenue")
export class RevenueController {
  constructor(private readonly revenue: RevenueService) {}

  @Get("summary")
  async getSummary() {
    return this.revenue.getSummary();
  }
}
