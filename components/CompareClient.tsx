"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

export function CompareClient({ products }: { products: Product[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(products.slice(0, 3).map((product) => product.id));
  const selected = useMemo(() => products.filter((product) => selectedIds.includes(product.id)), [products, selectedIds]);
  const winner = selected.length ? [...selected].sort((a, b) => b.total_score - a.total_score)[0] : null;

  function toggle(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-3 scrollbar-thin">
        {products.slice(0, 24).map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => toggle(product.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${selectedIds.includes(product.id) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"}`}
          >
            {product.name}
          </button>
        ))}
      </div>

      {winner && (
        <Card className="mb-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="mb-3 gap-2 border-blue-200 text-blue-600"><Crown className="h-3.5 w-3.5" /> 비교 승자</Badge>
              <h2 className="text-2xl font-extrabold tracking-tight">{winner.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                선택한 상품 중 AI 점수, 가격, 구매 확신의 균형이 가장 좋은 후보입니다.
              </p>
            </div>
            <a href={winner.affiliate_url || `/products/${winner.slug}`} target={winner.affiliate_url ? "_blank" : undefined} rel={winner.affiliate_url ? "nofollow sponsored noopener" : undefined} className="rounded-md bg-blue-600 px-6 py-3 text-center text-sm font-bold text-white">
              1위 상품 특가보기
            </a>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm scrollbar-thin">
        <table className="min-w-[860px] w-full border-collapse text-sm">
          <tbody className="divide-y divide-slate-100">
            <Row label="상품" values={selected.map((product) => (
              <a key={product.id} href={product.affiliate_url || `/products/${product.slug}`} target={product.affiliate_url ? "_blank" : undefined} rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined} className="font-bold text-slate-950">
                {product.name}
              </a>
            ))} />
            <Row label="가격" values={selected.map((product) => formatPrice(product.price))} />
            <Row label="AI 점수" values={selected.map((product) => <strong key={product.id}>{product.total_score}</strong>)} />
            <Row label="평점" values={selected.map((product) => `${product.rating || "AI"} / 5`)} />
            <Row label="리뷰수" values={selected.map((product) => `${product.review_count.toLocaleString("ko-KR")}`)} />
            <Row label="장점" values={selected.map((product) => product.pros.slice(0, 2).join(", "))} />
            <Row label="단점" values={selected.map((product) => product.cons.slice(0, 2).join(", "))} />
            <Row label="추천 대상" values={selected.map((product) => product.recommended_for[0] ?? "일반 사용자")} />
            <Row label="AI 최종 판단" values={selected.map((product) => product.id === winner?.id ? "승자: 가장 균형 잡힌 선택" : "비교 후보로 적합")} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, values }: { label: string; values: ReactNode[] }) {
  return (
    <tr>
      <th className="w-40 bg-slate-50 px-5 py-5 text-left font-extrabold text-slate-800">{label}</th>
      {values.map((value, index) => (
        <td key={index} className="w-64 px-5 py-5 align-top text-slate-700">{value}</td>
      ))}
      {Array.from({ length: 3 - values.length }).map((_, index) => (
        <td key={`empty-${index}`} className="w-64 px-5 py-5 text-slate-400">상품 선택</td>
      ))}
    </tr>
  );
}
