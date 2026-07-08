import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronLeft, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { encyclopediaArticles, getEncyclopediaArticle } from "@/lib/encyclopedia";
import { getProducts } from "@/lib/products";

export function generateStaticParams() {
  return encyclopediaArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getEncyclopediaArticle(slug);
  return {
    title: article ? `${article.title} | 쇼핑도감 가전백과` : "가전백과 | 쇼핑도감",
    description: article?.summary ?? "구매 전에 알아두면 좋은 가전·디지털 핵심 지식입니다."
  };
}

export default async function EncyclopediaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getEncyclopediaArticle(slug);
  const products = await getProducts();

  if (!article) {
    return (
      <main className="mx-auto max-w-[960px] px-5 py-20">
        <h1 className="text-3xl font-extrabold">가전백과 글을 찾을 수 없습니다.</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white">
          홈으로 돌아가기 <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  const relatedProducts = products
    .filter((product) => `${product.name} ${product.short_review} ${product.categories?.name ?? ""}`.includes(article.relatedKeyword))
    .slice(0, 4);
  const fallbackProducts = relatedProducts.length ? relatedProducts : products.slice(0, 4);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[980px] px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
          <ChevronLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <div className="mt-8 rounded-3xl bg-blue-50 p-8 md:p-12">
          <Badge className="border-blue-200 bg-white text-blue-600">
            <Search className="mr-1 h-3.5 w-3.5" />
            쇼핑도감 가전백과
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{article.intro}</p>
          <p className="mt-5 text-sm font-bold text-blue-600">업데이트 {article.updatedAt}</p>
        </div>

        <section className="mt-10 space-y-5">
          {article.sections.map((section, index) => (
            <article key={section.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-extrabold text-white">{index + 1}</div>
                <h2 className="text-2xl font-extrabold">{section.title}</h2>
              </div>
              <p className="mt-5 text-base leading-8 text-slate-600">{section.body}</p>
              <ul className="mt-5 grid gap-3 md:grid-cols-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl bg-slate-950 p-6 text-white">
          <div className="flex items-center gap-2 font-extrabold">
            <Sparkles className="h-5 w-5 text-blue-300" />
            빠른 확인 포인트
          </div>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {article.quickChecks.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-slate-200">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-300" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">관련 특가 상품</h2>
            <p className="mt-1 text-sm text-slate-500">핵심 지식을 확인한 뒤 상품을 비교해 보세요.</p>
          </div>
          <Link href="/compare" className="text-sm font-bold text-blue-600">비교 페이지 보기</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fallbackProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} rank={index + 1} />
          ))}
        </div>
      </section>
    </main>
  );
}
