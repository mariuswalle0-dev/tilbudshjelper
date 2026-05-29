export type Confidence = "low" | "medium" | "high";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type LineItemType = "labor" | "material";

export interface QuotePhase {
  name: string;
  hours_min: number;
  hours_max: number;
  tasks: string[];
}

export interface QuoteMaterial {
  item: string;
  unit: string;
  quantity: number;
  unit_price_nok: number;
  note?: string;
}

export interface QuotePricing {
  labor_min_nok: number;
  labor_max_nok: number;
  materials_min_nok: number;
  materials_max_nok: number;
  total_min_excl_mva: number;
  total_max_excl_mva: number;
  total_min_incl_mva: number;
  total_max_incl_mva: number;
}

export interface AIQuoteResponse {
  project_summary: string;
  confidence: Confidence;
  phases: QuotePhase[];
  materials: QuoteMaterial[];
  pricing: QuotePricing;
  assumptions: string[];
  missing_info: string[];
  validity_days: number;
}

export interface GenerateQuoteRequest {
  description: string;
  region?: "oslo" | "bergen" | "other";
  hourly_rate?: number;
}

export interface GenerateQuoteResult {
  ok: boolean;
  quote?: AIQuoteResponse;
  quoteId?: string;
  quoteNumber?: string;
  error?: string;
}
