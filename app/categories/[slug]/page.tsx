import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCategories, getProductsByCategory } from "@/lib/products";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getProductsByCategory(slug);
  return {
    title: category ? `${category.name} 추천 | 쇼핑도감` : "카테고리 | 쇼핑도감",
    description: category ? `${category.name} 제품을 구매 기준, 장단점, 특가 링크 중심으로 정리했습니다.` : undefined
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { category, products } = await getProductsByCategory(slug);
  if (!category) notFound();

  const sortedProducts = [...products].sort((a, b) => b.total_score - a.total_score);
  const topPicks = sortedProducts.slice(0, 3);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1120px] px-5 py-10">
        <div className="rounded-3xl bg-blue-50 px-7 py-10 md:px-12 md:py-14">
          <Badge className="border-blue-200 text-blue-600">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            쇼핑도감 카테고리
          </Badge>
          <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-slate-950 md:text-6xl">{category.name}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            제품을 무작정 나열하지 않고, AI 점수와 가격, 장단점, 구매 체크포인트를 기준으로 먼저 볼 상품을 정리했습니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#top-products" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white">
              추천 상품 보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/compare" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">
              비교 페이지로 이동 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="top-products" className="mx-auto max-w-[1120px] px-5 py-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-blue-600">추천 상위 상품</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">이 카테고리에서 먼저 볼 상품</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {topPicks.map((product, index) => (
            <Card key={product.id} className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">#{index + 1}</span>
                <span className="text-sm font-bold text-blue-600">AI {product.total_score}</span>
              </div>
              <h3 className="line-clamp-2 text-xl font-extrabold leading-7">{product.name}</h3>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{product.short_review}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {product.pros.slice(0, 2).map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={product.affiliate_url || `/products/${product.slug}`}
                target={product.affiliate_url ? "_blank" : undefined}
                rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-bold text-white"
              >
                특가보기 <ArrowRight className="h-4 w-4" />
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 pb-16 pt-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-blue-600">전체 상품</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">비교하기 쉬운 상품 카드</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sortedProducts.map((product, index) => <ProductCard key={product.id} product={product} rank={index + 1} />)}
        </div>
      </section>
    </main>
  );
}
