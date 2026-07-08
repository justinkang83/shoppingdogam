import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import { Menu, Search, ShoppingCart, ShieldCheck } from "lucide-react";
import "./globals.css";
import categories from "@/data/categories.json";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"]
});

export const metadata: Metadata = {
  title: {
    default: "쇼핑도감 | 가전·디지털 구매가이드",
    template: "%s | 쇼핑도감"
  },
  description: "가전·디지털 제품의 구매 기준, 추천 랭킹, 비교표를 제공하고 특가 상품 페이지로 연결하는 큐레이션 플랫폼입니다."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.className} min-h-screen bg-white text-slate-950 antialiased`}>
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-[86px] max-w-[1200px] items-center gap-7 px-5">
            <Link href="/" className="shrink-0 whitespace-nowrap text-3xl font-extrabold tracking-tight text-blue-600">
              쇼핑도감
            </Link>
            <nav className="hidden shrink-0 items-center gap-8 whitespace-nowrap text-base font-bold md:flex">
              <Link href="/categories" className="hover:text-blue-600">카테고리</Link>
              <Link href="/guides/tv-buying-guide" className="hover:text-blue-600">구매가이드</Link>
            </nav>
            <form className="ml-auto hidden h-11 w-[420px] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 lg:flex">
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="검색어를 입력하세요" />
              <Search className="h-5 w-5 text-slate-700" />
            </form>
            <Link href="/compare" className="hidden border-l border-slate-200 pl-5 text-slate-700 md:block" aria-label="비교함">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            <button className="ml-auto md:hidden" aria-label="메뉴 열기">
              <Menu className="h-7 w-7" />
            </button>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-[1200px] px-5 py-10 text-sm text-slate-600">
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row">
              <div>
                <div className="mb-3 flex items-center gap-2 font-bold text-slate-950">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  투명한 제휴 추천
                </div>
                <div className="max-w-2xl space-y-2 leading-6">
                  <p>쇼핑도감은 상품을 바로 추천하기보다 구매 기준과 핵심 비교 정보를 먼저 제공하여 더 현명한 선택을 돕는 서비스입니다.</p>
                  <p>실제 사용 경험과 주요 스펙, 장단점을 한눈에 비교할 수 있도록 정리하며, 복잡한 쇼핑 과정을 쉽고 편리하게 만들어 드립니다.</p>
                  <p>앞으로 더 많은 상품과 다양한 비교 정보를 지속적으로 추가하여, 누구나 믿고 참고할 수 있는 쇼핑 가이드로 발전해 나가겠습니다.</p>
                </div>
              </div>
              <div className="h-max rounded-full border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700">
                콘텐츠 관리 전환 준비됨
              </div>
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link key={category.slug} href={`/categories/${category.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {category.name}
                </Link>
              ))}
            </div>
            <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로 일정액의 수수료를 제공받을 수 있습니다.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
