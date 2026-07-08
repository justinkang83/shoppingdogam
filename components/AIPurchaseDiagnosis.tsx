"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

const steps = [
  { key: "budget", label: "예산", options: ["10만원 이하", "10만-30만원", "30만원 이상", "가성비 우선"] },
  { key: "useCase", label: "주요 사용 목적", options: ["일상용", "업무용", "프리미엄 업그레이드", "선물용", "입문자용"] },
  { key: "brand", label: "선호 기준", options: ["상관없음", "믿을 만한 브랜드", "후기 좋은 제품", "로켓배송"] },
  { key: "features", label: "꼭 필요한 기능", options: ["쉬운 설치", "저소음", "컴팩트함", "고성능", "A/S 안정성"] },
  { key: "avoid", label: "피하고 싶은 조건", options: ["비싼 가격", "어려운 설치", "낯선 판매자", "너무 큰 크기", "후기 부족"] }
];

export function AIPurchaseDiagnosis({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const recommendations = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      let scoreA = a.total_score + a.value_score * 0.2 + (a.is_rocket ? 3 : 0);
      let scoreB = b.total_score + b.value_score * 0.2 + (b.is_rocket ? 3 : 0);
      if (answers.budget?.includes("10만원 이하")) {
        scoreA += a.price < 100000 ? 10 : -5;
        scoreB += b.price < 100000 ? 10 : -5;
      }
      if (answers.budget?.includes("300,000")) {
        scoreA += a.price >= 300000 ? 6 : 0;
        scoreB += b.price >= 300000 ? 6 : 0;
      }
      if (answers.brand?.includes("로켓")) {
        scoreA += a.is_rocket ? 8 : -3;
        scoreB += b.is_rocket ? 8 : -3;
      }
      return scoreB - scoreA;
    });
    return sorted.slice(0, 3);
  }, [answers, products]);

  return (
    <div className="rounded-[34px] border border-black/10 bg-white/90 p-4 shadow-[0_30px_100px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
      <div className="flex items-center gap-3 rounded-[26px] bg-slate-50 p-5 dark:bg-black/30">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white dark:bg-white dark:text-black">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">AI 구매 진단</div>
          <p className="text-sm text-slate-500">다섯 가지 질문에 답하면 구매 후보를 좁혀드립니다.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.key} className="rounded-[24px] border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-black/20">
              <div className="mb-3 text-sm font-semibold">{step.label}</div>
              <div className="flex flex-wrap gap-2">
                {step.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [step.key]: option }))}
                    className={`rounded-full border px-3 py-2 text-sm transition ${answers[step.key] === option ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/10 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] bg-ink p-5 text-white dark:bg-white dark:text-black">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            맞춤 추천 결과
          </div>
          <div className="space-y-3">
            {recommendations.map((product, index) => (
              <a
                key={product.id}
                href={product.affiliate_url || `/products/${product.slug}`}
                target={product.affiliate_url ? "_blank" : undefined}
                rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
                className="block rounded-[22px] bg-white/10 p-4 transition hover:-translate-y-0.5 hover:bg-white/15 dark:bg-black/5 dark:hover:bg-black/10"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black dark:bg-black dark:text-white">#{index + 1}</span>
                  <span className="text-sm opacity-70">{formatPrice(product.price)}</span>
                </div>
                <div className="line-clamp-2 font-semibold">{product.name}</div>
                <div className="mt-2 text-sm opacity-70">AI 점수 {product.total_score} · 가성비 {product.value_score}</div>
              </a>
            ))}
          </div>
          <a href="/compare" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black dark:bg-black dark:text-white">
            구매 전 비교하기 <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
