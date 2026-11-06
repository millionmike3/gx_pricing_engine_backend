// backend/pricing/exceptions/exception.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PricingExceptionService {
  async detectExceptions(applicationId: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        underwriting: true,
        PricingResult: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!app || !app.PricingResult.length) {
      return { exceptions: [] };
    }

    const result = app.PricingResult[0];
    const exceptions: string[] = [];

    // Example exception rules
    if ((app.underwriting?.dti ?? 0) > 50) {
      exceptions.push("HIGH_DTI");
    }

    if ((app.underwriting?.ltv ?? 0) > 97) {
      exceptions.push("HIGH_LTV");
    }

    if ((app.underwriting?.fraudScore ?? 0) > 0.7) {
      exceptions.push("FRAUD_RISK");
    }

    if (result.finalRate > 12) {
      exceptions.push("RATE_ABOVE_THRESHOLD");
    }

    // Persist exceptions
    const exceptionRecord = await prisma.pricingException.create({
      data: {
        applicationId,
        exceptions,
        metadata: {
          finalRate: result.finalRate,
          underwriting: app.underwriting,
        },
      },
    });

    return exceptionRecord;
  }
}

export const pricingExceptionService = new PricingExceptionService();
