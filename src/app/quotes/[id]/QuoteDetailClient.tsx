"use client";

import QuoteResult from "@/components/QuoteResult";
import type { SavedQuote } from "@/lib/db";
import { useRouter } from "next/navigation";

interface Props {
  saved: SavedQuote;
}

export default function QuoteDetailClient({ saved }: Props) {
  const router = useRouter();

  return (
    <QuoteResult
      quote={saved.ai_response}
      quoteNumber={saved.quote_number}
      quoteId={saved.id}
      onReset={() => router.push("/")}
    />
  );
}
