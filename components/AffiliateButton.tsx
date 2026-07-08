"use client";

import { ExternalLink } from "lucide-react";
import type { Product } from "@/lib/types";

export function AffiliateButton({ product, label = "쿠팡에서 구매하기" }: { product: Product; label?: string }) {
  const disabled = !product.affiliate_url;

  function handleClick() {
    if (disabled) return;
    fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ product_id: product.id })
    }).catch(() => null);
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-200 px-6 py-4 text-sm font-bold text-slate-500"
      >
        {label}
        <ExternalLink className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  return (
    <a
      href={product.affiliate_url!}
      target="_blank"
      rel="nofollow sponsored noopener"
      onClick={handleClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
    >
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden />
    </a>
  );
}
