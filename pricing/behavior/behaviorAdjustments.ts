// backend/pricing/behavior/behaviorAdjustments.ts

export interface BehaviorAdjustmentInput {
  clickRate?: number;
  responseDelay?: number;
  lateNightActivity?: boolean;
  scrollDepth?: number;
  sessionDuration?: number;
  riskScore?: number;
}

export interface BehaviorAdjustmentOutput {
  adjustment: number;
  components: {
    clickRateAdj: number;
    responseDelayAdj: number;
    lateNightAdj: number;
    scrollDepthAdj: number;
    sessionDurationAdj: number;
    riskAdj: number;
  };
}

export function computeBehaviorAdjustments(
  input: BehaviorAdjustmentInput
): BehaviorAdjustmentOutput {
  const clickRateAdj = (input.clickRate ?? 0) * 0.01;
  const responseDelayAdj = (input.responseDelay ?? 0) * -0.005;
  const lateNightAdj = input.lateNightActivity ? -0.02 : 0;
  const scrollDepthAdj = (input.scrollDepth ?? 0) * 0.002;
  const sessionDurationAdj = (input.sessionDuration ?? 0) * 0.001;
  const riskAdj = (input.riskScore ?? 0) * 0.01;

  const adjustment =
    clickRateAdj +
    responseDelayAdj +
    lateNightAdj +
    scrollDepthAdj +
    sessionDurationAdj +
    riskAdj;

  return {
    adjustment,
    components: {
      clickRateAdj,
      responseDelayAdj,
      lateNightAdj,
      scrollDepthAdj,
      sessionDurationAdj,
      riskAdj,
    },
  };
}
