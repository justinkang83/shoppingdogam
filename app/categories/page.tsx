import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories } from "@/lib/products";

export const metadata: Metadata = {
  title: "카테고리 | 쇼핑도감",
  description: "생활가전, 주방가전, 디지털IT, 계절가전 등 쇼핑도감의 전체 카테고리를 선택할 수 있습니다."
};

const categoryTabs = ["인기", "생활가전", "주방가전", "디지털IT", "계절가전", "생활용품", "육아용품"];

const categoryItems = [
  { name: "에어컨", slug: "seasonal-appliances", hot: true },
  { name: "선풍기", slug: "seasonal-appliances", hot: true },
  { name: "무선청소기", slug: "home-appliances" },
  { name: "스팀다리미", slug: "home-appliances" },
  { name: "수건", slug: "home-appliances" },
  { name: "제습기", slug: "seasonal-appliances" },
  { name: "헤어드라이어", slug: "home-appliances" },
  { name: "식기세척기", slug: "kitchen-appliances" },
  { name: "냉장고", slug: "kitchen-appliances" },
  { name: "스마트휴지통", slug: "smart-home" },
  { name: "비데", slug: "home-appliances" },
  { name: "휴대용선풍기", slug: "seasonal-appliances" },
  { name: "음식물처리기", slug: "kitchen-appliances" },
  { name: "서큘레이터", slug: "seasonal-appliances" },
  { name: "로봇청소기", slug: "home-appliances" },
  { name: "에어프라이어", slug: "kitchen-appliances" },
  { name: "물걸레청소기", slug: "home-appliances" },
  { name: "구강세정기", slug: "home-appliances" },
  { name: "가습기", slug: "seasonal-appliances" },
  { name: "이동식에어컨", slug: "seasonal-appliances" },
  { name: "정수기", slug: "kitchen-appliances" },
  { name: "창문형에어컨", slug: "seasonal-appliances" },
  { name: "TV", slug: "digital-devices" },
  { name: "세탁기", slug: "home-appliances" }
];

export default async function CategoriesIndexPage() {
  const categories = await getCategories();

  return (
    <main className="bg-white">
      <section className="border-b border-slate-100">
        <div className="mx-auto max-w-[980px] px-5 py-10">
          <div className="flex justify-center gap-10 overflow-x-auto whitespace-nowrap pb-1 text-lg font-extrabold scrollbar-thin">
            {categoryTabs.map((tab, index) => (
              <Link
                key={tab}
                href={index === 0 ? "/categories" : `/categories/${tabToSlug(tab)}`}
                className={`pb-4 ${index === 0 ? "border-b-4 border-blue-600 text-blue-600" : "text-slate-950 hover:text-blue-600"}`}
              >
                {tab}
              </Link>
            ))}
          </div>

          <div className="mx-auto mt-10 grid max-w-[760px] grid-cols-2 gap-x-16 gap-y-8 text-center sm:grid-cols-3 md:grid-cols-4">
            {categoryItems.map((item) => (
              <Link key={item.name} href={`/categories/${item.slug}`} className="group text-base font-medium text-slate-950 hover:text-blue-600">
                {item.name}
                {item.hot && <span className="ml-1 align-middle text-rose-500">•</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="mb-6">
          <p className="text-sm font-bold text-blue-600">전체 카테고리</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">원하는 제품군을 선택하세요</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 font-extrabold shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <span>
                <span className="block text-lg">{category.name}</span>
                <span className="mt-1 block text-sm font-medium text-slate-500">{category.description ?? "추천 상품과 구매 기준 보기"}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function tabToSlug(tab: string) {
  const map: Record<string, string> = {
    생활가전: "home-appliances",
    주방가전: "kitchen-appliances",
    디지털IT: "digital-devices",
    계절가전: "seasonal-appliances",
    생활용품: "home-appliances",
    육아용품: "home-appliances"
  };
  return map[tab] ?? "digital-devices";
}
