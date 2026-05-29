"use client";

import { useState } from "react";
import type { AIQuoteResponse } from "@/types/quote";

const fmt = (n: number) =>
  new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);

const confidenceLabel: Record<string, { label: string; color: string }> = {
  high:   { label: "Høy sikkerhet",    color: "bg-green-100 text-green-800" },
  medium: { label: "Middels sikkerhet", color: "bg-yellow-100 text-yellow-800" },
  low:    { label: "Lav sikkerhet",    color: "bg-red-100 text-red-800" },
};

interface Props {
  quote: AIQuoteResponse;
  quoteNumber?: string;
  quoteId?: string;
  onReset: () => void;
}

export default function QuoteResult({ quote, quoteNumber, onReset }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);

  const conf = confidenceLabel[quote.confidence];
  const totalHoursMin = quote.phases.reduce((s, p) => s + p.hours_min, 0);
  const totalHoursMax = quote.phases.reduce((s, p) => s + p.hours_max, 0);

  async function downloadPDF() {
    setDownloading(true);
    setDlError(null);
    try {
      const res = await fetch("/api/quote/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote,
          quoteNumber: quoteNumber ?? "T-UTKAST",
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Ukjent feil" }));
        throw new Error(error);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tilbud-${quoteNumber ?? "utkast"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDlError(err instanceof Error ? err.message : "PDF-nedlasting feilet");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{quote.project_summary}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {quoteNumber && <span className="font-mono mr-2">{quoteNumber}</span>}
            Gyldig i {quote.validity_days} dager
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${conf.color}`}>
          {conf.label}
        </span>
      </div>

      {/* Price summary */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Totalsum eks. mva</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {fmt(quote.pricing.total_min_excl_mva)} – {fmt(quote.pricing.total_max_excl_mva)}
          </p>
        </div>
        <div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Totalsum inkl. mva</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {fmt(quote.pricing.total_min_incl_mva)} – {fmt(quote.pricing.total_max_incl_mva)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Arbeid</p>
          <p className="font-semibold text-gray-800">
            {fmt(quote.pricing.labor_min_nok)} – {fmt(quote.pricing.labor_max_nok)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Materialer</p>
          <p className="font-semibold text-gray-800">
            {fmt(quote.pricing.materials_min_nok)} – {fmt(quote.pricing.materials_max_nok)}
          </p>
        </div>
      </div>

      {/* Phases */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Arbeidsfaser — {totalHoursMin}–{totalHoursMax} timer totalt
        </h3>
        <div className="space-y-3">
          {quote.phases.map((phase, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{phase.name}</span>
                <span className="text-sm text-gray-500">
                  {phase.hours_min}–{phase.hours_max} timer
                </span>
              </div>
              <ul className="mt-2 space-y-0.5">
                {phase.tasks.map((t, j) => (
                  <li key={j} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-gray-400">–</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Materialer</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-medium text-gray-600">Vare</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Ant.</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Enhet</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Enhetspris</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Sum</th>
              </tr>
            </thead>
            <tbody>
              {quote.materials.map((m, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 text-gray-800">
                    {m.item}
                    {m.note && <span className="text-gray-400 text-xs ml-1">({m.note})</span>}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{m.quantity}</td>
                  <td className="px-4 py-2 text-right text-gray-500">{m.unit}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{fmt(m.unit_price_nok)}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-800">
                    {fmt(m.quantity * m.unit_price_nok)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assumptions & missing info */}
      {(quote.assumptions.length > 0 || quote.missing_info.length > 0) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {quote.assumptions.length > 0 && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Forutsetninger
              </h4>
              <ul className="space-y-1">
                {quote.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-gray-400 shrink-0">•</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {quote.missing_info.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
              <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                Manglende info
              </h4>
              <ul className="space-y-1">
                {quote.missing_info.map((m, i) => (
                  <li key={i} className="text-sm text-amber-800 flex gap-2">
                    <span className="shrink-0">?</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {downloading ? "Genererer PDF…" : "Last ned PDF"}
        </button>
        <button
          onClick={onReset}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Nytt tilbud
        </button>
      </div>

      {dlError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{dlError}</p>
      )}
    </div>
  );
}
