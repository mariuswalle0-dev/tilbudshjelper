"use client";

import { useState } from "react";
import QuoteForm from "@/components/QuoteForm";
import QuoteResult from "@/components/QuoteResult";
import type { AIQuoteResponse, GenerateQuoteRequest } from "@/types/quote";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<AIQuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: GenerateQuoteRequest) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setQuote(json.quote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Tilbudshjelper</h1>
          <p className="mt-2 text-gray-500 text-sm">Beskriv prosjektet – få et ferdig tilbud på sekunder</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {quote ? (
            <QuoteResult quote={quote} onReset={() => setQuote(null)} />
          ) : (
            <>
              <QuoteForm onSubmit={handleSubmit} loading={loading} />
              {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Prisestimatene er veiledende. Juster alltid tall før du sender tilbudet.
        </p>
      </div>
    </main>
  );
}
