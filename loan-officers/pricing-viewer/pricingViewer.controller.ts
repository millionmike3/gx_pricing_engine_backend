import { Controller, Get, Param } from "@nestjs/common";
import { PricingViewerService } from "./pricingViewer.service";

@Controller("loan-officers/pricing-viewer")
export class PricingViewerController {
  constructor(private readonly viewer: PricingViewerService) {}

  @Get(":loanId")
  async getMatrix(@Param("loanId") loanId: string) {
    return this.viewer.getMatrixForLoan(loanId);
  }
}
