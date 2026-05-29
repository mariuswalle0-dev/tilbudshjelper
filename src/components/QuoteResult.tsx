"use client";

import type { AIQuoteResponse } from "@/types/quote";

const fmt = (n: number) =>
  new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);

const confidenceLabel: Record<string, { label: string; color: string }> = {
  high:   { label: "Høy sikkerhet",    color: "bg-green-100 text-green-800" },
  medium: { label: "Middels sikkerhet", color: "bg-yellow-100 text-yellow-800" },
  low:    { label: "Lav sikkerhet",    color: "bg-red-100 text-red-800" },
};

export default function QuoteResult({ quote, onReset }: { quote: AIQuoteResponse; onReset: () => void }) {
  const conf = confidenceLabel[quote.confidence];
  const totalHoursMin = quote.phases.reduce((s, p) => s + p.hours_min, 0);
  const totalHoursMax = quote.phases.reduce((s, p) => s + p.hours_max, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">{quote.project_summary}</h2>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${conf.color}`}>{conf.label}</span>
      </div>

      {/* Pricing */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Eks. mva</p>
          <p className="text-xl font-bold text-blue-900 mt-1">
            {fmt(quote.pricing.total_min_excl_mva)} – {fmt(quote.pricing.total_max_excl_mva)}
          </p>
        </div>
        <div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Inkl. mva</p>
          <p className="text-xl font-bold text-blue-900 mt-1">
            {fmt(quote.pricing.total_min_incl_mva)} – {fmt(quote.pricing.total_max_incl_mva)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Arbeid</p>
          <p className="font-semibold">{fmt(quote.pricing.labor_min_nok)} – {fmt(quote.pricing.labor_max_nok)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Materialer</p>
          <p className="font-semibold">{fmt(quote.pricing.materials_min_nok)} – {fmt(quote.pricing.materials_max_nok)}</p>
        </div>
      </div>

      {/* Phases */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Arbeidsfaser — {totalHoursMin}–{totalHoursMax} timer</h3>
        <div className="space-y-2">
          {quote.phases.map((phase, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between">
                <span className="font-medium">{phase.name}</span>
                <span className="text-sm text-gray-500">{phase.hours_min}–{phase.hours_max} t</span>
              </div>
              <ul className="mt-2 space-y-0.5">
                {phase.tasks.map((t, j) => (
                  <li key={j} className="text-sm text-gray-600">– {t}</li>
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
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <th className="text-left px-4 py-2">Vare</th>
                <th className="text-right px-4 py-2">Ant.</th>
                <th className="text-right px-4 py-2">Enhet</th>
                <th className="text-right px-4 py-2">Pris</th>
                <th className="text-right px-4 py-2">Sum</th>
              </tr>
            </thead>
            <tbody>
              {quote.materials.map((m, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">{m.item}</td>
                  <td className="px-4 py-2 text-right">{m.quantity}</td>
                  <td className="px-4 py-2 text-right text-gray-500">{m.unit}</td>
                  <td className="px-4 py-2 text-right">{fmt(m.unit_price_nok)}</td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(m.quantity * m.unit_price_nok)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assumptions */}
      {quote.assumptions.length > 0 && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Forutsetninger</h4>
          {quote.assumptions.map((a, i) => <p key={i} className="text-sm text-gray-700">• {a}</p>)}
        </div>
      )}

      {quote.missing_info.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
          <h4 className="text-xs font-semibold text-amber-700 uppercase mb-2">Manglende info</h4>
          {quote.missing_info.map((m, i) => <p key={i} className="text-sm text-amber-800">? {m}</p>)}
        </div>
      )}

      <button onClick={onReset} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        Nytt tilbud
      </button>
    </div>
  );
}
