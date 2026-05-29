"use client";

import { useState } from "react";
import type { GenerateQuoteRequest, GenerateQuoteResult } from "@/types/quote";

interface Props {
  onResult: (result: GenerateQuoteResult) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function QuoteForm({ onResult, loading, setLoading }: Props) {
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState<GenerateQuoteRequest["region"]>("other");
  const [hourlyRate, setHourlyRate] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const body: GenerateQuoteRequest = {
        description,
        region,
        hourly_rate: hourlyRate ? parseInt(hourlyRate) : undefined,
      };

      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: GenerateQuoteResult = await res.json();
      onResult(data);
    } catch {
      onResult({ ok: false, error: "Nettverksfeil – prøv igjen" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prosjektbeskrivelse
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="F.eks: Bygge ny terrasse på 25 kvm i trykkimpregnert tre, med trapper ned til hagen og rekkverk på tre sider."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            value={region}
            onChange={(e) =>
              setRegion(e.target.value as GenerateQuoteRequest["region"])
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            disabled={loading}
          >
            <option value="other">Resten av Norge</option>
            <option value="oslo">Oslo-området</option>
            <option value="bergen">Bergen-området</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Din timepris (NOK, valgfritt)
          </label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="750"
            min={400}
            max={2000}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Genererer tilbud…" : "Generer tilbud"}
      </button>
    </form>
  );
}
