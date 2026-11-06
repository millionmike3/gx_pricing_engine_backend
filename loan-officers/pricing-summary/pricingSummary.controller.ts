import { Controller, Get, Param } from "@nestjs/common";
import { PricingSummaryService } from "./pricingSummary.service";

@Controller("loan-officers/pricing-summary")
export class PricingSummaryController {
  constructor(private readonly summary: PricingSummaryService) {}

  @Get(":loanId")
  async get(@Param("loanId") loanId: string) {
    return this.summary.getSummary(loanId);
  }
}
