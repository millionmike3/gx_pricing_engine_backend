import { Controller, Get } from "@nestjs/common";
import { InvestorRateSheetService } from "./investorRateSheet.service";

@Controller("pricing/investor-rate-sheets")
export class InvestorRateSheetController {
  constructor(private readonly sheets: InvestorRateSheetService) {}

  @Get()
  async getSheets() {
    return this.sheets.generateRateSheet();
  }
}
