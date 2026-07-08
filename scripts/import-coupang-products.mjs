import crypto from "node:crypto";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

loadDotEnv(".env.local");
loadDotEnv(".env");

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  COUPANG_ACCESS_KEY,
  COUPANG_SECRET_KEY,
  COUPANG_SUB_ID
} = process.env;

const API_HOST = "https://api-gateway.coupang.com";
const DEFAULT_LIMIT = Number(process.env.COUPANG_IMPORT_LIMIT ?? 3);

const categories = [
  {
    id: "cat-life",
    name: "생활가전",
    slug: "home-appliances",
    keywords: ["로봇청소기", "무선청소기", "의류관리기"]
  },
  {
    id: "cat-kitchen",
    name: "주방가전",
    slug: "kitchen-appliances",
    keywords: ["에어프라이어", "식기세척기", "블렌더"]
  },
  {
    id: "cat-season",
    name: "계절가전",
    slug: "seasonal-appliances",
    keywords: ["제습기", "공기청정기", "서큘레이터"]
  },
  {
    id: "cat-digital",
    name: "디지털기기",
    slug: "digital-devices",
    keywords: ["태블릿", "전자책 리더기", "액션캠"]
  },
  {
    id: "cat-pc",
    name: "PC·주변기기",
    slug: "pc-accessories",
    keywords: ["모니터", "기계식 키보드", "USB C 허브"]
  },
  {
    id: "cat-audio",
    name: "음향기기",
    slug: "audio-devices",
    keywords: ["노이즈캔슬링 헤드폰", "블루투스 스피커", "무선 이어폰"]
  },
  {
    id: "cat-smart",
    name: "스마트홈",
    slug: "smart-home",
    keywords: ["스마트 도어락", "스마트 플러그", "홈카메라"]
  },
  {
    id: "cat-car",
    name: "자동차 디지털용품",
    slug: "car-digital",
    keywords: ["블랙박스", "차량용 무선충전기", "자동차 공기청정기"]
  }
];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  assertEnv();
  const hasSupabase = Boolean(NEXT_PUBLIC_SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
  const supabase = hasSupabase
    ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
      })
    : null;

  const categoryRows = supabase ? await upsertCategories(supabase) : categories;
  const categoryMap = new Map(categoryRows.map((category) => [category.slug, category]));

  let inserted = 0;
  const localProducts = [];
  for (const category of categories) {
    const categoryRow = categoryMap.get(category.slug);
    if (!categoryRow) continue;

    const seen = new Set();
    const products = [];
    for (const keyword of category.keywords) {
      const results = await searchCoupang(keyword, DEFAULT_LIMIT);
      for (const item of results) {
        if (!item.productId || seen.has(item.productId)) continue;
        seen.add(item.productId);
        products.push(toProductPayload(item, categoryRow.id, category.slug, keyword));
      }
    }

    if (products.length === 0) {
      console.log(`[skip] ${category.name}: no products from Coupang`);
      continue;
    }

    localProducts.push(...products);
    if (supabase) {
      const { error } = await supabase
        .from("products")
        .upsert(products, { onConflict: "slug" });

      if (error) throw new Error(`${category.name} import failed: ${error.message}`);
    }
    inserted += products.length;
    console.log(`[ok] ${category.name}: ${products.length} products`);
  }

  fs.writeFileSync(
    "data/coupang-products.json",
    `${JSON.stringify(localProducts, null, 2)}\n`,
    "utf8"
  );

  console.log(`Saved ${localProducts.length} Coupang products to data/coupang-products.json.`);
  if (supabase) console.log(`Imported or updated ${inserted} Coupang products in Supabase.`);
  else console.log("Supabase env missing. Local JSON mode was used.");
}

function assertEnv() {
  const missing = [];
  if (!COUPANG_ACCESS_KEY) missing.push("COUPANG_ACCESS_KEY");
  if (!COUPANG_SECRET_KEY) missing.push("COUPANG_SECRET_KEY");
  if (missing.length) {
    throw new Error(`Missing env values: ${missing.join(", ")}`);
  }
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function upsertCategories(supabase) {
  const rows = categories.map(({ name, slug }) => ({ name, slug }));
  const { data, error } = await supabase
    .from("categories")
    .upsert(rows, { onConflict: "slug" })
    .select("*");
  if (error) throw new Error(`Category upsert failed: ${error.message}`);
  return data;
}

async function searchCoupang(keyword, limit) {
  const query = new URLSearchParams({
    keyword,
    limit: String(limit)
  });

  if (COUPANG_SUB_ID) query.set("subId", COUPANG_SUB_ID);

  const pathname = "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search";
  const queryString = query.toString();
  const response = await fetch(`${API_HOST}${pathname}?${queryString}`, {
    headers: {
      Authorization: authorization("GET", pathname, queryString)
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Coupang API failed for "${keyword}" (${response.status}): ${text}`);
  }

  const json = await response.json();
  return json?.data?.productData ?? [];
}

function authorization(method, pathname, queryString = "") {
  const datetime = new Date()
    .toISOString()
    .slice(2, 19)
    .replace(/-/g, "")
    .replace(/:/g, "") + "Z";
  const message = `${datetime}${method}${pathname}${queryString}`;
  const signature = crypto
    .createHmac("sha256", COUPANG_SECRET_KEY)
    .update(message)
    .digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${COUPANG_ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`;
}

function toProductPayload(item, categoryId, categorySlug, keyword) {
  const price = Number(item.productPrice ?? 0);
  const baseScore = scoreFromRank(item.rank);
  const slug = slugify(`${categorySlug}-${item.productId}-${item.productName}`);

  return {
    category_id: categoryId,
    name: item.productName ?? "쿠팡 상품",
    slug,
    brand: guessBrand(item.productName),
    image_url: item.productImage || "https://picsum.photos/seed/coupang-product/900/700",
    price,
    rating: 0,
    review_count: 0,
    is_rocket: Boolean(item.isRocket),
    short_review: `${keyword} 카테고리에서 쿠팡 파트너스 API로 가져온 인기 상품 후보입니다.`,
    pros: [
      "쿠팡 검색 상위 노출 상품",
      item.isRocket ? "로켓배송 가능 상품" : "쿠팡 구매 가능 상품"
    ],
    cons: [
      "상세 스펙과 실사용 리뷰는 관리자 검수 필요"
    ],
    recommended_for: [
      `${keyword} 인기 상품을 빠르게 비교하려는 사용자`
    ],
    not_recommended_for: [
      "정밀한 실사용 리뷰 검증 없이 바로 구매하기 어려운 사용자"
    ],
    check_points: [
      "상품 상세페이지의 최신 가격",
      "배송 조건",
      "리뷰수와 최근 후기",
      "A/S 및 판매자 정보"
    ],
    performance_score: baseScore,
    durability_score: Math.max(70, baseScore - 4),
    usability_score: Math.max(70, baseScore - 2),
    design_score: Math.max(70, baseScore - 5),
    brand_score: Math.max(70, baseScore - 3),
    value_score: valueScore(price, baseScore),
    total_score: baseScore,
    affiliate_url: item.productUrl,
    is_featured: baseScore >= 88
  };
}

function scoreFromRank(rank) {
  const numericRank = Number(rank ?? 1);
  return Math.max(80, 94 - numericRank);
}

function valueScore(price, baseScore) {
  if (!price) return baseScore;
  if (price < 100000) return Math.min(95, baseScore + 3);
  if (price < 300000) return Math.min(94, baseScore + 1);
  return Math.max(78, baseScore - 2);
}

function guessBrand(name) {
  return String(name ?? "")
    .replace(/\[[^\]]+\]/g, "")
    .trim()
    .split(/\s+/)[0]
    .replace(/[^\p{L}\p{N}·.-]/gu, "") || "쿠팡";
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
