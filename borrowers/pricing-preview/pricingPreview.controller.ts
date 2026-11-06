import { Body, Controller, Post } from "@nestjs/common";
import { PricingPreviewService } from "./pricingPreview.service";

@Controller("borrowers/pricing-preview")
export class PricingPreviewController {
  constructor(private readonly preview: PricingPreviewService) {}

  @Post()
  async getPreview(
    @Body("amount") amount: number,
    @Body("fico") fico: number
  ) {
    return this.preview.getPreview({ amount, fico });
  }
}
