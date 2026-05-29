import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { QuotePDF } from "@/lib/pdf";
import type { AIQuoteResponse } from "@/types/quote";

const RequestSchema = z.object({
  quote: z.object({}).passthrough(),
  quoteNumber: z.string(),
  companyName: z.string().optional(),
  companyEmail: z.string().optional(),
  companyPhone: z.string().optional(),
  customerName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
  }

  const { quote, quoteNumber, companyName, companyEmail, companyPhone, customerName } = parsed.data;

  try {
    const buffer = await renderToBuffer(
      QuotePDF({
        quote: quote as AIQuoteResponse,
        quoteNumber,
        companyName,
        companyEmail,
        companyPhone,
        customerName,
      })
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tilbud-${quoteNumber}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF-generering feilet";
    console.error("[quote/pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
