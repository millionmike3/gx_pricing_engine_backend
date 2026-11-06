export const bpsToRate = (bps: number) => bps / 10000;
export const rateToBps = (rate: number) => Math.round(rate * 10000);
