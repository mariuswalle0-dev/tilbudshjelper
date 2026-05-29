import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listQuotes } from "@/lib/db";
import UserNav from "@/components/UserNav";

const confidenceBadge: Record<string, string> = {
  high:   "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  low:    "bg-red-100 text-red-800",
};

const confidenceLabel: Record<string, string> = {
  high: "Høy", medium: "Middels", low: "Lav",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const quotes = await listQuotes(userId);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tilbudshistorikk</h1>
            <p className="text-sm text-gray-500 mt-1">{quotes.length} tilbud totalt</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + Nytt tilbud
            </Link>
            <UserNav />
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Ingen tilbud ennå</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
              Lag ditt første tilbud
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/quotes/${q.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{q.quote_number}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${confidenceBadge[q.confidence] ?? ""}`}>
                        {confidenceLabel[q.confidence] ?? q.confidence}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {q.ai_response.project_summary}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{q.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {fmt(q.ai_response.pricing.total_min_incl_mva)} –
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {fmt(q.ai_response.pricing.total_max_incl_mva)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(q.created_at).toLocaleDateString("nb-NO")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
