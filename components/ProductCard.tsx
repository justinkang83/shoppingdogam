import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { formatPrice, getCategoryName } from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductCard({ product, rank }: { product: Product; rank?: number }) {
  const affiliateHref = product.affiliate_url || `/products/${product.slug}`;

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <a
        href={affiliateHref}
        target={product.affiliate_url ? "_blank" : undefined}
        rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
        className="block"
      >
        <div className="relative aspect-square bg-slate-50">
          <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
          {rank && <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">{rank}</span>}
          {product.is_rocket && <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">로켓</span>}
        </div>
      </a>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
          <span>{getCategoryName(product)}</span>
          <span className="text-blue-600">AI {product.total_score}</span>
        </div>
        <p className="mt-3 text-xs text-slate-500">{product.brand}</p>
        <a
          href={affiliateHref}
          target={product.affiliate_url ? "_blank" : undefined}
          rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
          className="block"
        >
          <h3 className="mt-1 line-clamp-2 min-h-11 text-sm font-bold leading-5">{product.name}</h3>
        </a>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{product.short_review}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <strong className="text-base tracking-tight">{formatPrice(product.price)}</strong>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400" /> {product.rating || "AI"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/products/${product.slug}`} className="rounded-md border border-slate-200 px-3 py-2.5 text-center text-xs font-bold transition hover:bg-slate-50">
            상세보기
          </Link>
          <a
            href={affiliateHref}
            target={product.affiliate_url ? "_blank" : undefined}
            rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            특가보기 <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
