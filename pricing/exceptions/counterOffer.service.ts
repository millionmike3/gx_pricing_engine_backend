// backend/pricing/exceptions/counterOffer.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CounterOfferService {
  async generateCounterOffer(applicationId: string, requestedRate: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        PricingResult: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!app || !app.PricingResult.length) {
      throw new Error("Cannot generate counter-offer: no pricing result found.");
    }

    const lastResult = app.PricingResult[0];
    const finalRate = lastResult.finalRate;

    // Counter-offer logic
    const difference = requestedRate - finalRate;

    let counterRate = finalRate;

    if (difference < -0.25) {
      counterRate = finalRate - 0.10; // borrower wants much lower → small concession
    } else if (difference < -0.10) {
      counterRate = finalRate - 0.05;
    } else if (difference < 0) {
      counterRate = finalRate - 0.025;
    } else {
      counterRate = finalRate; // borrower wants higher → no concession needed
    }

    const counterOffer = await prisma.pricingOverride.create({
      data: {
        applicationId,
        originalRate: finalRate,
        requestedRate,
        counterRate,
        reason: "COUNTER_OFFER",
        metadata: {
          difference,
        },
      },
    });

    return counterOffer;
  }
}

export const counterOfferService = new CounterOfferService();
