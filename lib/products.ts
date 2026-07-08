import { categories as sampleCategories, products as sampleProducts } from "@/lib/sample-data";
import { supabase } from "@/lib/supabase";
import type { Category, Product } from "@/lib/types";
import coupangProducts from "@/data/coupang-products.json";
import seedProducts from "@/data/products.json";
import seedCategories from "@/data/categories.json";

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return localCategories();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  return error || !data?.length ? localCategories() : data;
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return hydrate(localProducts());
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("total_score", { ascending: false });
  return error || !data?.length ? hydrate(localProducts()) : normalizeProducts(data as Product[]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase) return hydrate(localProducts()).find((product) => product.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .single();
  return error || !data ? hydrate(localProducts()).find((product) => product.slug === slug) ?? null : normalizeProduct(data as Product);
}

export async function getProductsByCategory(slug: string): Promise<{ category: Category | null; products: Product[] }> {
  const allCategories = await getCategories();
  const category = allCategories.find((item) => item.slug === slug) ?? null;
  if (!category) return { category: null, products: [] };

  const products = (await getProducts()).filter((product) => product.category_id === category.id || product.categories?.slug === slug);
  return { category, products };
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function getCategoryName(product: Product) {
  return product.categories?.name ?? localCategories().find((category) => category.id === product.category_id)?.name ?? "기타";
}

function hydrate(products: Product[]) {
  const categories = localCategories();
  return products.map((product) => ({
    ...product,
    categories: categories.find((category) => category.id === product.category_id)
  }));
}

function localProducts(): Product[] {
  const explicitSeed = normalizeProducts(seedProducts as Product[]);
  if (explicitSeed.length) return explicitSeed;
  const imported = normalizeProducts(coupangProducts as Product[]);
  return imported.length ? imported : sampleProducts;
}

function localCategories(): Category[] {
  const seeded = seedCategories as Category[];
  return seeded.length ? seeded : sampleCategories;
}

function normalizeProducts(products: Product[]) {
  return products.map(normalizeProduct);
}

function normalizeProduct(product: Product) {
  return {
    ...product,
    pros: asArray(product.pros),
    cons: asArray(product.cons),
    recommended_for: asArray(product.recommended_for),
    not_recommended_for: asArray(product.not_recommended_for),
    check_points: asArray(product.check_points)
  };
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return value.split("\n").map((item) => item.trim()).filter(Boolean);
  return [];
}
