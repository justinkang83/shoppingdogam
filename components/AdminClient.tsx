"use client";

import { useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabase, hasSupabaseEnv } from "@/lib/supabase";
import type { Category, Product } from "@/lib/types";

const emptyProduct = (categoryId: string): Partial<Product> => ({
  category_id: categoryId,
  name: "",
  slug: "",
  brand: "",
  image_url: "",
  price: 0,
  rating: 0,
  review_count: 0,
  is_rocket: false,
  short_review: "",
  pros: [],
  cons: [],
  recommended_for: [],
  not_recommended_for: [],
  check_points: [],
  performance_score: 80,
  durability_score: 80,
  usability_score: 80,
  design_score: 80,
  brand_score: 80,
  value_score: 80,
  total_score: 80,
  affiliate_url: "",
  is_featured: false
});

export function AdminClient({ initialCategories, initialProducts }: { initialCategories: Category[]; initialProducts: Product[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<string>("new");
  const selected = useMemo(() => products.find((product) => product.id === selectedId) ?? emptyProduct(categories[0]?.id ?? ""), [products, selectedId, categories]);
  const [draft, setDraft] = useState<Partial<Product>>(selected);
  const [categoryName, setCategoryName] = useState("");

  function edit(product: Product) {
    setSelectedId(product.id);
    setDraft(product);
  }

  function startNew() {
    setSelectedId("new");
    setDraft(emptyProduct(categories[0]?.id ?? ""));
  }

  async function saveProduct() {
    const payload = {
      category_id: draft.category_id,
      name: draft.name,
      slug: draft.slug,
      brand: draft.brand,
      image_url: draft.image_url,
      price: draft.price,
      rating: draft.rating,
      review_count: draft.review_count,
      is_rocket: draft.is_rocket,
      short_review: draft.short_review,
      pros: list(draft.pros),
      cons: list(draft.cons),
      recommended_for: list(draft.recommended_for),
      not_recommended_for: list(draft.not_recommended_for),
      check_points: list(draft.check_points),
      performance_score: draft.performance_score,
      durability_score: draft.durability_score,
      usability_score: draft.usability_score,
      design_score: draft.design_score,
      brand_score: draft.brand_score,
      value_score: draft.value_score,
      total_score: draft.total_score,
      affiliate_url: draft.affiliate_url,
      is_featured: draft.is_featured
    };

    if (!hasSupabaseEnv || !supabase) {
      alert("Supabase 환경변수를 설정하면 저장할 수 있습니다.");
      return;
    }

    const query = selectedId === "new"
      ? supabase.from("products").insert(payload).select("*, categories(*)").single()
      : supabase.from("products").update(payload).eq("id", selectedId).select("*, categories(*)").single();
    const { data, error } = await query;
    if (error) return alert(error.message);
    setProducts((current) => selectedId === "new" ? [data as Product, ...current] : current.map((item) => item.id === selectedId ? data as Product : item));
    setSelectedId((data as Product).id);
    alert("저장되었습니다.");
  }

  async function deleteProduct(id: string) {
    if (!hasSupabaseEnv || !supabase) return alert("Supabase 환경변수를 설정하면 삭제할 수 있습니다.");
    if (!confirm("상품을 삭제할까요?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return alert(error.message);
    setProducts((current) => current.filter((item) => item.id !== id));
    startNew();
  }

  async function addCategory() {
    const name = categoryName.trim();
    if (!name) return;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    if (!hasSupabaseEnv || !supabase) return alert("Supabase 환경변수를 설정하면 카테고리를 추가할 수 있습니다.");
    const { data, error } = await supabase.from("categories").insert({ name, slug }).select("*").single();
    if (error) return alert(error.message);
    setCategories((current) => [...current, data as Category]);
    setCategoryName("");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-lg border border-line bg-white p-4">
        <button type="button" onClick={startNew} className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-tech px-4 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> 상품 등록
        </button>
        <div className="max-h-[560px] space-y-2 overflow-auto pr-1 scrollbar-thin">
          {products.map((product) => (
            <button key={product.id} type="button" onClick={() => edit(product)} className={`w-full rounded-lg border p-3 text-left text-sm ${selectedId === product.id ? "border-tech bg-blue-50" : "border-line bg-white"}`}>
              <strong className="block">{product.name}</strong>
              <span className="text-muted">{product.brand}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-lg border border-line bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="상품명" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
          <Field label="슬러그" value={draft.slug} onChange={(value) => setDraft({ ...draft, slug: value })} />
          <Field label="브랜드" value={draft.brand} onChange={(value) => setDraft({ ...draft, brand: value })} />
          <Field label="이미지 URL" value={draft.image_url} onChange={(value) => setDraft({ ...draft, image_url: value })} />
          <NumberField label="가격" value={draft.price} onChange={(value) => setDraft({ ...draft, price: value })} />
          <NumberField label="평점" value={draft.rating} onChange={(value) => setDraft({ ...draft, rating: value })} />
          <NumberField label="리뷰수" value={draft.review_count} onChange={(value) => setDraft({ ...draft, review_count: value })} />
          <NumberField label="성능 점수" value={draft.performance_score} onChange={(value) => setDraft({ ...draft, performance_score: value })} />
          <NumberField label="내구성 점수" value={draft.durability_score} onChange={(value) => setDraft({ ...draft, durability_score: value })} />
          <NumberField label="사용 편의성 점수" value={draft.usability_score} onChange={(value) => setDraft({ ...draft, usability_score: value })} />
          <NumberField label="디자인 점수" value={draft.design_score} onChange={(value) => setDraft({ ...draft, design_score: value })} />
          <NumberField label="AS/브랜드 신뢰도 점수" value={draft.brand_score} onChange={(value) => setDraft({ ...draft, brand_score: value })} />
          <NumberField label="가성비 점수" value={draft.value_score} onChange={(value) => setDraft({ ...draft, value_score: value })} />
          <NumberField label="추천 점수" value={draft.total_score} onChange={(value) => setDraft({ ...draft, total_score: value })} />
          <Select label="카테고리" value={draft.category_id} categories={categories} onChange={(value) => setDraft({ ...draft, category_id: value })} />
          <Field label="쿠팡파트너스 affiliate_url" value={draft.affiliate_url ?? ""} onChange={(value) => setDraft({ ...draft, affiliate_url: value })} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={Boolean(draft.is_rocket)} onChange={(event) => setDraft({ ...draft, is_rocket: event.target.checked })} /> 로켓배송
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={Boolean(draft.is_featured)} onChange={(event) => setDraft({ ...draft, is_featured: event.target.checked })} /> 인기 상품 노출
        </label>
        <TextArea label="한줄 추천평" value={draft.short_review} onChange={(value) => setDraft({ ...draft, short_review: value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea label="장점" value={join(draft.pros)} onChange={(value) => setDraft({ ...draft, pros: split(value) })} />
          <TextArea label="단점" value={join(draft.cons)} onChange={(value) => setDraft({ ...draft, cons: split(value) })} />
          <TextArea label="추천 대상" value={join(draft.recommended_for)} onChange={(value) => setDraft({ ...draft, recommended_for: split(value) })} />
          <TextArea label="비추천 대상" value={join(draft.not_recommended_for)} onChange={(value) => setDraft({ ...draft, not_recommended_for: split(value) })} />
          <TextArea label="구매 전 체크포인트" value={join(draft.check_points)} onChange={(value) => setDraft({ ...draft, check_points: split(value) })} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={saveProduct} className="inline-flex items-center gap-2 rounded-lg bg-tech px-4 py-3 text-sm font-bold text-white">
            <Save className="h-4 w-4" /> 저장
          </button>
          {selectedId !== "new" && (
            <button type="button" onClick={() => deleteProduct(selectedId)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-bold text-red-600">
              <Trash2 className="h-4 w-4" /> 삭제
            </button>
          )}
        </div>

        <div className="mt-8 rounded-lg bg-slate-50 p-4">
          <h2 className="font-black">카테고리 관리</h2>
          <div className="mt-3 flex gap-2">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="새 카테고리명" className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none" />
            <button type="button" onClick={addCategory} className="shrink-0 rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white">추가</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => <span key={category.id} className="rounded-full border border-line bg-white px-3 py-1 text-xs">{category.name}</span>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string | null; onChange: (value: string) => void }) {
  return <label className="text-sm font-bold">{label}<input value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none" /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value?: number; onChange: (value: number) => void }) {
  return <label className="text-sm font-bold">{label}<input type="number" value={value ?? 0} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none" /></label>;
}

function Select({ label, value, categories, onChange }: { label: string; value?: string; categories: Category[]; onChange: (value: string) => void }) {
  return <label className="text-sm font-bold">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>;
}

function TextArea({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <label className="mt-4 block text-sm font-bold">{label}<textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-normal outline-none" /></label>;
}

function split(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function join(value: unknown) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function list(value: unknown) {
  return Array.isArray(value) ? value : split(String(value ?? ""));
}
