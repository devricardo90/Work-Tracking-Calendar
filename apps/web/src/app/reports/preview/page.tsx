"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import { toMonthParam } from "@/lib/entries";

export default function ReportPreviewPage() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? toMonthParam(new Date());
  const pdfUrl = `${API_BASE_URL}/reports/monthly.pdf?month=${month}`;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f5_0%,#efede8_44%,#e7e2d8_100%)] text-stone-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200/70 bg-white/88 px-4 py-4 backdrop-blur">
        <Link
          href={`/summary?month=${month}`}
          className="flex size-10 items-center justify-center rounded-full transition hover:bg-stone-100"
        >
          <ArrowLeft className="size-5 text-stone-900" />
        </Link>
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
            Report Preview
          </p>
          <h1 className="text-lg font-bold tracking-tight">Monthly PDF</h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 pb-8">
        <div className="flex flex-col gap-3 rounded-[1.6rem] border border-stone-200/80 bg-white/92 p-4 shadow-[0_24px_60px_-36px_rgba(50,35,20,0.32)] sm:flex-row">
          <div className="flex flex-1 items-start gap-3">
            <div className="rounded-2xl bg-stone-900 p-3 text-stone-50">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-950">Monthly Report Preview</p>
              <p className="text-sm text-stone-500">
                Review the PDF for {month} before downloading or sharing.
              </p>
            </div>
          </div>
          <Button asChild className="h-12 rounded-[1.2rem] bg-stone-900 px-5 text-sm font-semibold text-stone-50 hover:bg-stone-800">
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              <Download className="size-4" />
              Download PDF
            </a>
          </Button>
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border border-stone-200/80 bg-white shadow-[0_28px_70px_-40px_rgba(50,35,20,0.35)]">
          <iframe
            src={pdfUrl}
            title={`Monthly report preview for ${month}`}
            className="h-[75vh] w-full bg-white"
          />
        </div>
      </div>
    </main>
  );
}
