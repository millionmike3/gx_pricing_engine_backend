// backend/pricing/overlays/behaviorOverlay.service.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BehaviorOverlayService {
  async applyBehaviorOverlay(applicationId: string, baseRate: number) {
    const snapshot = await prisma.loanBehaviorSnapshot.findFirst({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return { rate: baseRate, adjustment: 0 };
    }

    let adjustment = 0;

    if ((snapshot.clickRate ?? 0) > 0.5) adjustment -= 0.02;
    if ((snapshot.responseDelay ?? 0) > 5) adjustment += 0.03;
    if (snapshot.lateNightActivity) adjustment += 0.05;

    return {
      rate: baseRate + adjustment,
      adjustment,
    };
  }
}

export const behaviorOverlayService = new BehaviorOverlayService();
