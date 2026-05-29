import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getQuote } from "@/lib/db";
import QuoteDetailClient from "./QuoteDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const saved = await getQuote(id, userId);
  if (!saved) notFound();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/quotes" className="text-sm text-gray-500 hover:text-gray-700">
            ← Historikk
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-mono text-gray-600">{saved.quote_number}</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <QuoteDetailClient saved={saved} />
        </div>
      </div>
    </main>
  );
}
