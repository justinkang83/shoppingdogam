import Image from "next/image";
import Link from "next/link";
import {
  AirVent,
  ArrowRight,
  Baby,
  BookOpen,
  ChevronRight,
  CirclePlus,
  Fan,
  Monitor,
  Refrigerator,
  Search,
  Smartphone,
  Sparkles,
  Star,
  Tv,
  WandSparkles,
  WashingMachine
} from "lucide-react";
import { MotionDiv, MotionSection } from "@/components/Motion";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPopularGuides } from "@/lib/guides";
import { encyclopediaArticles } from "@/lib/encyclopedia";
import { formatPrice, getCategories, getProducts } from "@/lib/products";

const heroTabs = ["인기", "생활가전", "주방가전", "디지털IT", "계절가전", "생활용품", "육아용품"];

const recommendCategories = [
  { label: "에어컨", icon: AirVent },
  { label: "선풍기", icon: Fan },
  { label: "무선청소기", icon: WandSparkles, hot: true },
  { label: "TV", icon: Tv },
  { label: "모니터", icon: Monitor },
  { label: "냉장고", icon: Refrigerator },
  { label: "세탁기", icon: WashingMachine },
  { label: "스마트폰", icon: Smartphone },
  { label: "육아가전", icon: Baby }
];

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const guides = getPopularGuides();
  const sortedProducts = [...products].sort((a, b) => b.total_score - a.total_score);
  const popularPicks = sortedProducts.slice(0, 5);
  const weeklyProducts = sortedProducts.slice(5, 13);
  const featured = sortedProducts.find((product) => product.is_featured) ?? sortedProducts[0];

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-[1200px] px-5 pb-6 pt-5">
        <MotionDiv className="relative overflow-hidden rounded-sm bg-[linear-gradient(110deg,#8eb1ff_0%,#bba7ff_48%,#eef3ff_100%)]">
          <div className="grid min-h-[250px] items-center gap-8 px-8 py-10 md:grid-cols-[1fr_0.9fr] md:px-20">
            <div className="text-white">
              <p className="text-2xl font-medium md:text-3xl">상반기 인기 가전 특가</p>
              <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                2026 상반기
                <br />
                BEST 결산세일
              </h1>
              <p className="mt-5 max-w-md text-base font-medium text-white/90">
                구매가이드로 기준을 잡고, 추천 상품은 특가 링크로 바로 확인하세요.
              </p>
            </div>
            {featured && (
              <a
                href={featured.affiliate_url || `/products/${featured.slug}`}
                target={featured.affiliate_url ? "_blank" : undefined}
                rel={featured.affiliate_url ? "nofollow sponsored noopener" : undefined}
                className="relative mx-auto block h-56 w-full max-w-sm"
              >
                <Image src={featured.image_url} alt={featured.name} fill unoptimized className="object-contain drop-shadow-2xl" sizes="360px" priority />
              </a>
            )}
          </div>
          <button className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/60 text-white" aria-label="이전 배너">
            ‹
          </button>
          <button className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/60 text-white" aria-label="다음 배너">
            ›
          </button>
          <span className="absolute bottom-3 right-4 rounded-full bg-white/45 px-2 py-0.5 text-xs font-bold text-white">1 / 3</span>
        </MotionDiv>

        <nav className="flex justify-center overflow-x-auto border-b border-slate-200">
          {heroTabs.map((tab, index) => (
            <Link
              key={tab}
              href={index === 0 ? "/" : `/categories/${categories[index - 1]?.slug ?? categories[0]?.slug}`}
              className={`min-w-28 px-6 py-4 text-center text-sm font-semibold ${index === 0 ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-700"}`}
            >
              {tab}
            </Link>
          ))}
        </nav>
      </section>

      <MotionSection className="mx-auto max-w-[1120px] px-5 py-9">
        <h2 className="text-center text-xl font-bold tracking-tight">추천받고 싶은 제품을 선택해 보세요!</h2>
        <p className="mt-2 text-center text-sm font-semibold text-slate-500">쇼핑도감이 구매 기준부터 추천 제품까지 정리해 드려요</p>
        <div className="mt-7 flex gap-6 overflow-x-auto pb-2 scrollbar-thin md:justify-center">
          {recommendCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href="/compare" className="group shrink-0 text-center">
                <div className="relative grid h-20 w-20 place-items-center rounded-3xl border border-slate-200 bg-slate-50 transition group-hover:-translate-y-1 group-hover:border-blue-200 group-hover:bg-blue-50">
                  {item.hot && <span className="absolute -right-1 -top-1 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">N</span>}
                  <Icon className="h-8 w-8 text-slate-700" />
                </div>
                <span className="mt-2 block text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link href="/categories/digital-devices" className="group shrink-0 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-3xl border border-blue-100 bg-blue-50 text-blue-600 transition group-hover:-translate-y-1">
              <CirclePlus className="h-9 w-9" />
            </div>
            <span className="mt-2 block text-sm font-medium">전체보기</span>
          </Link>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-[1120px] px-5 py-8">
        <SectionTitle title="인기 쇼핑도감픽" subtitle="구매 기준이 명확한 추천 제품" href="/compare" />
        <div className="mt-7 grid gap-5 md:grid-cols-5">
          {popularPicks.map((product, index) => (
            <a
              key={product.id}
              href={product.affiliate_url || `/products/${product.slug}`}
              target={product.affiliate_url ? "_blank" : undefined}
              rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
              className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] bg-slate-50">
                <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover transition group-hover:scale-105" sizes="220px" />
                <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">BEST {index + 1}</span>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-blue-600">AI 추천점수 {product.total_score}</p>
                <h3 className="mt-2 line-clamp-2 min-h-11 text-sm font-bold leading-5">{product.name}</h3>
                <p className="mt-3 text-sm font-bold">{formatPrice(product.price)}</p>
              </div>
            </a>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-[1120px] px-5 py-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/compare" className="flex items-center justify-between rounded-2xl bg-blue-50 p-6 transition hover:-translate-y-1">
            <div>
              <Badge className="border-blue-200 bg-white text-blue-600">랭킹 NEW</Badge>
              <h3 className="mt-4 text-2xl font-bold">다양한 기준의 제품 순위</h3>
              <p className="mt-2 text-sm text-slate-600">가성비, 프리미엄, 입문자용, 전문가용까지 비교해 보세요.</p>
            </div>
            <Star className="h-10 w-10 text-blue-500" />
          </Link>
          <Link href="/compare" className="flex items-center justify-between rounded-2xl bg-slate-50 p-6 transition hover:-translate-y-1">
            <div>
              <Badge className="border-slate-200 bg-white text-slate-700">맞춤추천</Badge>
              <h3 className="mt-4 text-2xl font-bold">나에게 딱 맞는 제품 추천</h3>
              <p className="mt-2 text-sm text-slate-600">예산, 용도, 피하고 싶은 조건을 기준으로 후보를 줄입니다.</p>
            </div>
            <Sparkles className="h-10 w-10 text-slate-700" />
          </Link>
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-[1120px] px-5 py-8">
        <SectionTitle title="인기 구매가이드" subtitle="스펙보다 먼저 봐야 할 선택 기준" href="/guides/tv-buying-guide" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="block">
              <Card className="h-full rounded-xl p-5 shadow-sm hover:shadow-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <p className="mt-5 text-xs font-bold text-blue-600">{guide.type}</p>
                <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-bold leading-6">{guide.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{guide.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-[1120px] px-5 py-8">
        <SectionTitle title="인기 가전백과" subtitle="구매 전에 알면 돈 아끼는 핵심 지식" href="/encyclopedia/energy-efficiency-rating" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {encyclopediaArticles.map((article) => (
            <Link key={article.slug} href={`/encyclopedia/${article.slug}`} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{article.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{article.summary}</p>
            </Link>
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-[1120px] px-5 py-8">
        <SectionTitle title="이번주 인기 상품" subtitle="특가 확인 가능한 추천 후보" href="/compare" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {weeklyProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} rank={index + 1} />
          ))}
        </div>
      </MotionSection>

      <MotionSection className="mx-auto max-w-[1120px] px-5 py-8">
        <SectionTitle title="카테고리 바로가기" subtitle="가전·디지털 제품을 기준별로 빠르게 확인하세요" href="/categories/digital-devices" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-5 py-4 font-bold shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:text-blue-600">
              {category.name}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </MotionSection>

      <section className="mx-auto max-w-[1120px] px-5 py-12">
        <div className="rounded-2xl bg-slate-950 p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-300">구매 결정 플랫폼</p>
            <h2 className="mt-3 text-3xl font-bold">가이드는 신뢰를 만들고, 상품은 특가로 연결됩니다.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">모든 추천 상품은 특가 링크로 이동하며, 구매 전 비교와 체크포인트를 먼저 보여줍니다.</p>
          </div>
          <Link href="/compare" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-slate-950 md:mt-0">
            비교하고 구매하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <Link href={href} className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-bold text-slate-700 hover:text-blue-600">
        더보기 <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
