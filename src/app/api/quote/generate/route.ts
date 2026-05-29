import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { generateQuote } from "@/lib/claude";
import { saveQuote } from "@/lib/db";

const RequestSchema = z.object({
  description: z.string().min(5, "Beskrivelsen er for kort").max(1000),
  region: z.enum(["oslo", "bergen", "other"]).optional(),
  hourly_rate: z.number().int().min(400).max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Ikke innlogget" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ugyldig JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const quote = await generateQuote(parsed.data);
    const saved = await saveQuote(parsed.data, quote, userId);

    return NextResponse.json({
      ok: true,
      quote,
      quoteId: saved?.id ?? null,
      quoteNumber: saved?.quote_number ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil";
    console.error("[quote/generate]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
