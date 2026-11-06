import { Module } from "@nestjs/common";
import { PricingPreviewService } from "./pricing-preview/pricingPreview.service";
import { PricingPreviewController } from "./pricing-preview/pricingPreview.controller";
import { PricingService } from "../pricing/pricing.service";

@Module({
  providers: [PricingPreviewService, PricingService],
  controllers: [PricingPreviewController],
})
export class BorrowersModule {}
