import { Injectable } from "@nestjs/common";
import { PricingService } from "../../pricing/pricing.service";

export interface BorrowerPricingPreviewRequest {
  amount: number;
  fico: number;
}

export interface BorrowerPricingPreviewRow {
  product_type: string;
  final_rate: number;
  payment: number;
}

@Injectable()
export class PricingPreviewService {
  constructor(private readonly pricingService: PricingService) {}

  async getPreview(
    req: BorrowerPricingPreviewRequest
  ): Promise<BorrowerPricingPreviewRow[]> {
    // For now, assume:
    // - STANDARD margin profile
    // - SFR property
    // - PURCHASE lending type
    // - Use fico to pick a credit tier

    const matrix = await this.pricingService.computeBorrowerMatrix({
      amount: req.amount,
      fico: req.fico,
      property_type: "SFR",
      lending_type: "PURCHASE",
      margin_profile: "STANDARD",
    });

    // matrix should be an array of rows with product_type + final_rate
    return matrix.map(row => ({
      product_type: row.product_type,
      final_rate: row.final_rate,
      payment: this.computePayment(req.amount, row.final_rate, row.product_type),
    }));
  }

  private computePayment(
    amount: number,
    rate: number,
    product_type: string
  ): number {
    // Simple 30Y/15Y assumption based on product_type
    const termYears =
      product_type === "15Y_FIXED" ? 15 : 30;

    const monthlyRate = rate / 100 / 12;
    const n = termYears * 12;

    if (monthlyRate === 0) {
      return Math.round(amount / n);
    }

    const payment =
      (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));

    return Math.round(payment);
  }
}
