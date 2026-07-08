import type { Metadata } from "next";
import { CompareClient } from "@/components/CompareClient";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "상품 비교 | 쇼핑도감",
  description: "최대 3개 상품을 가격, AI 점수, 장단점, 추천 기준으로 비교합니다."
};

export default async function ComparePage() {
  const products = await getProducts();
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1120px] px-5 py-10">
        <div className="rounded-3xl bg-blue-50 px-7 py-10 md:px-12">
          <p className="text-sm font-bold text-blue-600">상품 비교</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">헷갈리는 제품을 한눈에 비교하세요.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
            최대 3개 상품을 선택하면 가격, AI 점수, 장단점, 추천 대상을 표로 정리해 드립니다.
          </p>
        </div>
        <CompareClient products={products} />
      </section>
    </main>
  );
}
