export interface InvestorRateSheetRule {
  investor: string;
  base_margin_bps: number;
  execution_curve_bps: Record<string, number>;
  overlays_bps: Record<string, number>;
}

export interface InvestorRateRow {
  investor: string;
  product_type: string;
  buy_price_bps: number;
  sell_price_bps: number;
  execution_adj_bps: number;
  overlay_adj_bps: number;
}
