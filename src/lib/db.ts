import { supabaseAdmin } from "./supabase";
import type { AIQuoteResponse, GenerateQuoteRequest } from "@/types/quote";

export interface SavedQuote {
  id: string;
  created_at: string;
  description: string;
  region: string | null;
  hourly_rate: number | null;
  ai_response: AIQuoteResponse;
  confidence: string;
  customer_name: string | null;
  customer_email: string | null;
  quote_number: string;
  user_id: string;
}

function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `T-${year}-${rand}`;
}

export async function saveQuote(
  input: GenerateQuoteRequest,
  quote: AIQuoteResponse,
  userId: string
): Promise<SavedQuote | null> {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("quotes")
    .insert({
      description: input.description,
      region: input.region ?? null,
      hourly_rate: input.hourly_rate ?? null,
      ai_response: quote,
      confidence: quote.confidence,
      quote_number: generateQuoteNumber(),
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("[db.saveQuote]", error.message);
    return null;
  }

  return data as SavedQuote;
}

export async function listQuotes(userId: string, limit = 50): Promise<SavedQuote[]> {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("quotes")
    .select("id, created_at, description, confidence, quote_number, customer_name, ai_response, user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[db.listQuotes]", error.message);
    return [];
  }

  return data as SavedQuote[];
}

export async function getQuote(id: string, userId: string): Promise<SavedQuote | null> {
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[db.getQuote]", error.message);
    return null;
  }

  return data as SavedQuote;
}
