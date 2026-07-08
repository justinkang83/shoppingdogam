import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { ExternalLink, FileJson, Link2, ListChecks, Package, Search, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import collections from "@/data/collections.json";
import rankings from "@/data/rankings.json";
import affiliate from "@/data/affiliate-links.json";
import { getCategories, getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "숨겨진 관리자",
  description: "JSON 기반 상품 운영을 위한 숨겨진 관리자 대시보드입니다."
};

const adminModules: Array<[string, string, LucideIcon]> = [
  ["상품 관리", "상품명, 이미지, 가격, AI 판단, 노출 상태를 관리합니다.", Package],
  ["카테고리 관리", "카테고리 설명과 대표 추천 묶음을 수정합니다.", ListChecks],
  ["제휴 링크 관리", "쿠팡 파트너스 URL과 코드 ID를 관리합니다.", Link2],
  ["상품 랭킹 관리", "종합 1위, 예산 추천, AI 추천, 에디터 추천을 관리합니다.", Star],
  ["AI 점수 관리", "성능, 내구성, 편의성, 브랜드, 가성비 점수를 조정합니다.", Sparkles],
  ["리뷰 요약 관리", "긍정/부정 트렌드와 사용자 적합도를 관리합니다.", FileJson],
  ["추천 컬렉션 관리", "상황별 AI 컬렉션을 큐레이션합니다.", ExternalLink],
  ["인기 검색어 관리", "구매 의도가 높은 검색어를 관리합니다.", Search]
];

export default async function AdminPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <main className="premium-container py-12">
      <section className="rounded-[36px] border border-black/5 bg-white/80 p-8 shadow-soft dark:border-white/10 dark:bg-white/[0.06] md:p-12">
        <Badge>숨겨진 관리자</Badge>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] md:text-7xl">AI 추천 운영 센터</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          현재는 JSON 데이터를 기준으로 운영합니다. 나중에 Supabase 테이블로 교체해도 추천 전략은 그대로 유지할 수 있습니다.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="상품 수" value={products.length} />
        <Metric label="카테고리" value={categories.length} />
        <Metric label="컬렉션" value={collections.length} />
        <Metric label="랭킹 기준" value={rankings.length} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminModules.map(([title, copy, Icon]) => (
          <Card key={String(title)} className="p-5">
            <Icon className="mb-8 h-6 w-6 text-slate-500" />
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight">수정 가능한 JSON 데이터</h2>
          <div className="mt-5 space-y-3 text-sm">
            {["data/products.json", "data/categories.json", "data/collections.json", "data/rankings.json", "data/reviews.json", "data/affiliate-links.json", "data/coupang-products.json"].map((path) => (
              <div key={path} className="rounded-2xl bg-slate-50 px-4 py-3 font-mono dark:bg-white/[0.04]">{path}</div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight">제휴 링크 설정</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">제공자</dt>
              <dd className="font-semibold">{affiliate.provider}</dd>
            </div>
            <div>
              <dt className="text-slate-500">추적 코드 ID</dt>
              <dd className="font-semibold">{affiliate.sub_id}</dd>
            </div>
            <div>
              <dt className="text-slate-500">링크 속성 정책</dt>
              <dd className="font-semibold">{affiliate.rel}</dd>
            </div>
          </dl>
        </Card>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-4xl font-semibold tracking-[-0.05em]">{value}</div>
    </Card>
  );
}
