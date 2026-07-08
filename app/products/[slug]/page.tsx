import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, HelpCircle, MinusCircle, ShieldCheck, Sparkles, Star } from "lucide-react";
import { AffiliateButton } from "@/components/AffiliateButton";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice, getProductBySlug, getProducts } from "@/lib/products";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} 리뷰 | 쇼핑도감` : "상품 리뷰 | 쇼핑도감",
    description: product?.short_review
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const products = await getProducts();
  const related = products.filter((item) => item.category_id === product.category_id && item.id !== product.id).slice(0, 4);
  const alternatives = products.filter((item) => item.id !== product.id).sort((a, b) => b.total_score - a.total_score).slice(0, 3);

  const scores = [
    ["성능", product.performance_score],
    ["내구성", product.durability_score],
    ["사용 편의성", product.usability_score],
    ["디자인", product.design_score],
    ["브랜드 신뢰도", product.brand_score],
    ["가성비", product.value_score]
  ];

  return (
    <main className="bg-white pb-24 md:pb-0">
      <section className="mx-auto grid max-w-[1120px] gap-8 px-5 py-10 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
            <Image src={product.image_url} alt={product.name} fill unoptimized priority className="object-contain" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="border-blue-200 text-blue-600"><Sparkles className="mr-1 h-3.5 w-3.5" /> AI 점수 {product.total_score}</Badge>
            {product.is_rocket && <Badge className="border-rose-200 text-rose-600">로켓배송</Badge>}
            <Badge>{formatPrice(product.price)}</Badge>
          </div>
          <p className="text-sm font-bold text-slate-500">{product.brand}</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-5xl">{product.name}</h1>
          <p className="mt-5 text-base leading-8 text-slate-700">{product.short_review}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <AffiliateButton product={product} label="특가보기" />
            <Link href="/compare" className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700">
              다른 상품과 비교
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-6">
        <Card className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2 font-extrabold">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            이 상품을 추천하는 이유
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <InfoList title="추천 대상" icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />} items={product.recommended_for} />
            <InfoList title="비추천 대상" icon={<MinusCircle className="h-5 w-5 text-rose-500" />} items={product.not_recommended_for} />
            <InfoList title="구매 전 체크" icon={<HelpCircle className="h-5 w-5 text-slate-500" />} items={product.check_points} />
          </div>
        </Card>
      </section>

      <section className="mx-auto grid max-w-[1120px] gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-extrabold">장점과 단점</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <InfoList title="장점" icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />} items={product.pros} />
              <InfoList title="단점" icon={<MinusCircle className="h-5 w-5 text-rose-500" />} items={product.cons} />
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-extrabold">비교 전 알아둘 점</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              가격과 AI 점수만으로 결정하기보다 실제 사용 목적, 설치 공간, A/S, 리뷰에서 반복되는 불만을 함께 확인하는 것이 좋습니다.
            </p>
            <div className="mt-6 overflow-x-auto scrollbar-thin">
              <table className="min-w-[640px] w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  <CompareRow label="가격" values={[formatPrice(product.price), ...alternatives.slice(0, 2).map((item) => formatPrice(item.price))]} />
                  <CompareRow label="AI 점수" values={[`${product.total_score}`, ...alternatives.slice(0, 2).map((item) => `${item.total_score}`)]} />
                  <CompareRow label="추천 대상" values={[product.recommended_for[0] ?? "일반 사용자", ...alternatives.slice(0, 2).map((item) => item.recommended_for[0] ?? "일반 사용자")]} />
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="h-max rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <div className="text-sm font-bold text-slate-500">종합 추천 점수</div>
          <div className="mt-2 text-6xl font-extrabold tracking-tight text-blue-600">{product.total_score}</div>
          <div className="mt-6 space-y-4">
            {scores.map(([label, score]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{label}</span>
                  <span>{score}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <AffiliateButton product={product} label="특가보기" />
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">함께 비교할 상품</p>
            <h2 className="mt-2 text-3xl font-extrabold">같은 카테고리 추천 후보</h2>
          </div>
          <Link href="/compare" className="text-sm font-bold text-blue-600">비교 페이지 보기</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => <ProductCard key={item.id} product={item} rank={index + 1} />)}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-100 bg-white/95 p-3 backdrop-blur md:hidden">
        <AffiliateButton product={product} label="특가보기" />
      </div>
    </main>
  );
}

function InfoList({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="mb-3 flex items-center gap-2 font-extrabold">{icon}{title}</div>
      <ul className="space-y-2 text-sm leading-6 text-slate-700">
        {items.slice(0, 4).map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </div>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <th className="w-36 bg-slate-50 px-4 py-4 text-left font-extrabold">{label}</th>
      {values.map((value) => <td key={value} className="px-4 py-4 text-slate-700">{value}</td>)}
    </tr>
  );
}
