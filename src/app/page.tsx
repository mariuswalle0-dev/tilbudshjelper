"use client";

import { useState } from "react";
import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import QuoteResult from "@/components/QuoteResult";
import UserNav from "@/components/UserNav";
import type { GenerateQuoteResult } from "@/types/quote";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateQuoteResult | null>(null);

  return (
    <main className="min-h-screen flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tilbudshjelper</h1>
            <p className="mt-1 text-gray-500 text-sm">Beskriv prosjektet – få et ferdig tilbud på sekunder</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/quotes" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Historikk →
            </Link>
            <UserNav />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {result?.ok && result.quote ? (
            <QuoteResult
              quote={result.quote}
              quoteNumber={result.quoteNumber}
              quoteId={result.quoteId}
              onReset={() => setResult(null)}
            />
          ) : (
            <>
              <QuoteForm
                onResult={setResult}
                loading={loading}
                setLoading={setLoading}
              />
              {result && !result.ok && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
                  {result.error}
                </p>
              )}
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
