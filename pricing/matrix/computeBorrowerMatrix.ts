// backend/pricing/matrix/computeBorrowerMatrix.ts

import {
  computeBaseRate,
  computeMacroAdj,
  computeBankAdj,
  computeMargin,
  bpsToRate,
} from "./matrixAdjustments";

export async function computeBorrowerMatrix(
  req: any,
  config: any
) {
  const {
    market,
    bankRates,
    weights,
    marginProfile,
    propertyAdjs,
    lendingAdjs,
    creditTiers,
  } = config;

  const tier = creditTiers.find(
    t => req.fico >= t.credit_min && req.fico <= t.credit_max
  );

  if (!tier) {
    throw new Error(`No credit tier found for FICO ${req.fico}`);
  }

  const propertyAdj = propertyAdjs.find(p => p.property_type === req.property_type);
  const lendingAdj = lendingAdjs.find(l => l.lending_type === req.lending_type);

  if (!propertyAdj || !lendingAdj) {
    throw new Error("Invalid property or lending type");
  }

  const productTypes = ["30Y_FIXED", "15Y_FIXED", "5_1_ARM"];
  const results = [];

  for (const product of productTypes) {
    const baseRate = computeBaseRate(market, weights);

    const macroAdjBps = computeMacroAdj(market, weights);
    const bankAdjBps = computeBankAdj(bankRates, product, baseRate);
    const propertyAdjBps = propertyAdj.adjustment_bps;
    const creditAdjBps = tier.adjustment_bps;
    const lendingAdjBps = lendingAdj.adjustment_bps;

    const marginBps = computeMargin(marginProfile, {
      risk_premium_bps: lendingAdjBps,
      product_type: product,
    });

    const finalRate =
      baseRate +
      bpsToRate(macroAdjBps) +
      bpsToRate(bankAdjBps) +
      bpsToRate(propertyAdjBps) +
      bpsToRate(creditAdjBps) +
      bpsToRate(lendingAdjBps) +
      bpsToRate(marginBps);

    const payment = computePayment(req.amount, finalRate, product);

    results.push({
      product_type: product,
      property_type: req.property_type,
      lending_type: req.lending_type,
      credit_tier: `${tier.credit_min}-${tier.credit_max}`,
      base_rate: baseRate,
      macro_adj_bps: macroAdjBps,
      bank_adj_bps: bankAdjBps,
      property_adj_bps: propertyAdjBps,
      credit_adj_bps: creditAdjBps,
      lending_type_adj_bps: lendingAdjBps,
      margin_bps: marginBps,
      final_rate: finalRate,
      payment,
    });
  }

  return results;
}

function computePayment(amount: number, rate: number, product: string): number {
  const termYears =
    product === "15Y_FIXED" ? 15 :
    product === "5_1_ARM" ? 30 :
    30;

  const monthlyRate = rate / 100 / 12;
  const n = termYears * 12;

  if (monthlyRate === 0) {
    return Math.round(amount / n);
  }

  const payment =
    (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));

  return Math.round(payment);
}
