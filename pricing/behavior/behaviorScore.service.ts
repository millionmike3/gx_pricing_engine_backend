// backend/pricing/behavior/behaviorScore.service.ts

import { PrismaClient } from "@prisma/client";
import { computeBehaviorAdjustments } from "./behaviorAdjustments";

const prisma = new PrismaClient();

export class BehaviorScoreService {
  async getBehaviorScore(applicationId: string) {
    const snapshot = await prisma.loanBehaviorSnapshot.findFirst({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });

    if (!snapshot) {
      return {
        score: 0,
        adjustment: 0,
        components: {},
      };
    }

    const input = {
      clickRate: snapshot.clickRate,
      responseDelay: snapshot.responseDelay,
      lateNightActivity: snapshot.lateNightActivity,
      scrollDepth: snapshot.scrollDepth,
      sessionDuration: snapshot.sessionDuration,
      riskScore: snapshot.behaviorRiskScore,
    };

    const result = computeBehaviorAdjustments(input);

    const score =
      (snapshot.behaviorRiskScore ?? 0) +
      result.adjustment * 100; // convert adjustment into score impact

    return {
      score,
      adjustment: result.adjustment,
      components: result.components,
    };
  }
}

export const behaviorScoreService = new BehaviorScoreService();
