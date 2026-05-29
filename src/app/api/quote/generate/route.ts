import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateQuote } from "@/lib/claude";

const RequestSchema = z.object({
  description: z.string().min(5).max(1000),
  region: z.enum(["oslo", "bergen", "other"]).optional(),
  hourly_rate: z.number().int().min(400).max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Ugyldig forespørsel" }, { status: 400 });
  }

  try {
    const quote = await generateQuote(parsed.data);
    return NextResponse.json({ ok: true, quote });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
