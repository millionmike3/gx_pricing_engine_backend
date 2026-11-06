// backend/pricing/overlays/riskOverlay.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class RiskOverlayService {
  async applyRiskOverlay(applicationId: string, baseRate: number) {
    const underwriting = await prisma.underwriting.findUnique({
      where: { applicationId },
    });

    if (!underwriting) {
      return { rate: baseRate, adjustment: 0 };
    }

    let adjustment = 0;

    if ((underwriting.dti ?? 0) > 50) adjustment += 0.10;
    if ((underwriting.ltv ?? 0) > 95) adjustment += 0.15;
    if ((underwriting.fraudScore ?? 0) > 0.7) adjustment += 0.25;

    return {
      rate: baseRate + adjustment,
      adjustment,
    };
  }
}

export const riskOverlayService = new RiskOverlayService();
