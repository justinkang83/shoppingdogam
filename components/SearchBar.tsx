"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";

export function SearchBar({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((product) => `${product.name} ${product.brand} ${product.short_review}`.toLowerCase().includes(q)).slice(0, 6);
  }, [products, query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-soft">
        <Search className="h-5 w-5 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제품명, 브랜드, 용도 검색"
          className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          {results.map((product) => (
            <a
              key={product.id}
              href={product.affiliate_url || `/products/${product.slug}`}
              target={product.affiliate_url ? "_blank" : undefined}
              rel={product.affiliate_url ? "nofollow sponsored noopener" : undefined}
              className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 text-sm last:border-b-0 hover:bg-slate-50"
            >
              <span className="font-semibold">{product.name}</span>
              <span className="shrink-0 text-muted">{formatPrice(product.price)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
