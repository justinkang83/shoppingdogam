import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { buyingGuides, getBuyingGuide } from "@/lib/guides";
import { getProducts } from "@/lib/products";

export function generateStaticParams() {
  return buyingGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getBuyingGuide(slug);
  return {
    title: guide ? `${guide.type} | 쇼핑도감` : "구매가이드 | 쇼핑도감",
    description: guide?.summary ?? "가전·디지털 제품 구매 전 확인해야 할 기준을 정리했습니다."
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getBuyingGuide(slug);
  const products = await getProducts();

  if (!guide) {
    return (
      <main className="mx-auto max-w-[960px] px-5 py-20">
        <h1 className="text-3xl font-extrabold">구매가이드를 찾을 수 없습니다.</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white">
          홈으로 돌아가기 <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  const relatedProducts = products
    .filter((product) => `${product.name} ${product.short_review} ${product.categories?.name ?? ""}`.includes(guide.categoryKeyword))
    .slice(0, 4);
  const fallbackProducts = relatedProducts.length ? relatedProducts : products.slice(0, 4);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[980px] px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
          <ChevronLeft className="h-4 w-4" />
          홈으로 돌아가기
        </Link>

        <div className="mt-8 rounded-3xl bg-slate-950 p-8 text-white md:p-12">
          <Badge className="border-blue-300/30 bg-blue-400/10 text-blue-100">
            <BookOpen className="mr-1 h-3.5 w-3.5" />
            {guide.type}
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{guide.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{guide.summary}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {guide.heroPoints.map((point) => (
              <span key={point} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
                {point}
              </span>
            ))}
          </div>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {guide.sections.map((section, index) => (
            <article key={section.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-sm font-extrabold text-blue-600">{index + 1}</div>
              <h2 className="mt-5 text-xl font-extrabold leading-7">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{section.body}</p>
              <ul className="mt-5 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-blue-50 p-6">
            <div className="flex items-center gap-2 font-extrabold text-blue-700">
              <ShieldCheck className="h-5 w-5" />
              구매 전 체크리스트
            </div>
            <ul className="mt-5 space-y-3">
              {guide.checklist.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-rose-50 p-6">
            <div className="flex items-center gap-2 font-extrabold text-rose-700">
              <XCircle className="h-5 w-5" />
              이런 선택은 피하세요
            </div>
            <ul className="mt-5 space-y-3">
              {guide.avoid.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                  <XCircle className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">관련 특가 상품</h2>
            <p className="mt-1 text-sm text-slate-500">가이드 기준을 참고해 상품을 비교해 보세요.</p>
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
