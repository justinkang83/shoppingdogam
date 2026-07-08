"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";

const questions = ["예산은 얼마인가요?", "주요 용도는 무엇인가요?", "선호 브랜드가 있나요?", "꼭 필요한 기능은?", "피하고 싶은 조건은?"];

export function AIShoppingSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState(false);

  const recommendations = useMemo(() => {
    const q = query.toLowerCase();
    const matched = products.filter((product) => `${product.name} ${product.short_review}`.toLowerCase().includes(q));
    return (matched.length ? matched : products).slice(0, 3);
  }, [products, query]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-5 py-4">
        <Bot className="h-5 w-5 text-slate-500" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setAsked(event.target.value.length > 3);
          }}
          placeholder="무엇을 살지 물어보세요"
          className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setAsked(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
          aria-label="검색"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {asked && (
        <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI 추가 질문
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((question) => (
                <button key={question} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  {question}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {recommendations.map((product) => (
              <a
                key={product.id}
                href={product.affiliate_url || `/products/${product.slug}`}
                target={product.affiliate_url ? "_blank" : undefined}
                rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="line-clamp-1 font-bold">{product.name}</span>
                <span className="shrink-0 text-slate-500">{formatPrice(product.price)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
