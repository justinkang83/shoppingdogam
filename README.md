# 픽가이드 MVP

Next.js App Router, TypeScript, Tailwind CSS, Supabase로 만든 가전·디지털 제품 큐레이팅 웹사이트 MVP입니다. 상품 검색, 카테고리, 상세 리뷰, 최대 3개 상품 비교, 관리자 CRUD, 쿠팡파트너스 클릭 로그 기록을 포함합니다.

## 설치 방법

```bash
npm install
cp .env.example .env.local
```

`.env.local`에 Supabase 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase 테이블 생성 SQL

Supabase 대시보드의 SQL Editor에서 [supabase/schema.sql](./supabase/schema.sql)을 실행하세요.

포함 테이블:

- `categories`: 카테고리
- `products`: 상품, 점수, 쿠팡파트너스 `affiliate_url`
- `click_logs`: 구매 버튼 클릭 로그

SQL에는 8개 카테고리와 20개 샘플 상품이 포함되어 있습니다. `affiliate_url`은 빈 값으로 들어가며, 관리자 페이지에서 나중에 입력하면 구매 버튼이 활성화됩니다.

## 로컬 실행 방법

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. Supabase 환경변수가 없으면 앱은 내장 샘플 데이터로 표시되고, 저장/삭제 기능은 안내 메시지만 표시합니다.

## 상품 등록 방법

1. `/admin`으로 이동합니다.
2. `상품 등록`을 누릅니다.
3. 상품명, 슬러그, 브랜드, 이미지 URL, 가격, 평점, 리뷰수, 점수, 장점/단점, 추천 대상, 체크포인트를 입력합니다.
4. `쿠팡파트너스 affiliate_url`에 상품별 쿠팡파트너스 링크를 입력합니다.
5. `저장`을 누릅니다.

현재 MVP 관리자 정책은 빠른 테스트를 위해 공개 CRUD로 열려 있습니다. 실제 배포 전에는 Supabase Auth를 붙이고 관리자 권한 사용자만 등록/수정/삭제할 수 있게 RLS 정책을 교체하세요.

## 쿠팡 인기상품 가져오기

쿠팡 상품을 자동으로 넣으려면 쿠팡 파트너스 Open API 키가 필요합니다. 공개 쿠팡 페이지를 스크래핑하는 방식은 차단될 수 있고 이용 조건 문제가 생길 수 있으므로, 이 프로젝트는 공식 API를 통해 가져오도록 구성했습니다.

Windows에서 가장 쉬운 방식:

1. `setup-env.cmd`를 더블클릭해 쿠팡 키를 입력합니다. Supabase 계정이 없으면 Supabase 항목은 비워도 됩니다.
2. `import-coupang.cmd`를 더블클릭해 쿠팡 상품을 가져옵니다.
3. `start-site.cmd`를 더블클릭하고 `http://localhost:3000`을 엽니다.

Supabase 없이 실행하면 쿠팡 상품은 `data/coupang-products.json`에 저장되고 사이트가 이 파일을 읽습니다.
Supabase를 나중에 연결하고 싶으면 Supabase SQL Editor에서 `supabase/schema.sql`을 실행한 뒤 `.env.local`에 Supabase 키를 추가하면 됩니다.

`.env.local`에 서버용 값을 추가합니다.

```env
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
COUPANG_ACCESS_KEY=your-coupang-access-key
COUPANG_SECRET_KEY=your-coupang-secret-key
COUPANG_SUB_ID=optional-channel-id
```

그 다음 실행합니다.

```bash
npm run import:coupang
```

기본 동작:

- 8개 카테고리별 검색 키워드로 쿠팡 파트너스 API 상품 검색을 호출합니다.
- 카테고리별 키워드마다 기본 3개 상품을 가져옵니다.
- `products.affiliate_url`에 쿠팡 파트너스 상품 URL을 저장합니다.
- 가격, 이미지, 로켓배송 여부는 API 응답값을 사용합니다.
- 평점과 리뷰수는 API 응답에 포함되지 않을 수 있어 `0`으로 넣고, 관리자 페이지에서 검수 후 입력합니다.
- 장점/단점/추천 대상/체크포인트는 자동 초안으로 넣고, 실제 발행 전 관리자 페이지에서 수정합니다.

가져올 개수를 늘리려면 실행 전에 `COUPANG_IMPORT_LIMIT`을 설정하세요.

PowerShell:

```powershell
$env:COUPANG_IMPORT_LIMIT=5
npm run import:coupang
```

macOS/Linux:

```bash
COUPANG_IMPORT_LIMIT=5 npm run import:coupang
```

## 구매 버튼 동작

- `products.affiliate_url`이 있으면 새 창으로 쿠팡 상품 페이지를 엽니다.
- 링크에는 `rel="nofollow sponsored noopener"`가 적용됩니다.
- 클릭 시 `/api/clicks`를 통해 `click_logs`에 `product_id`, `clicked_at`, `referrer`, `user_agent`가 기록됩니다.
- `affiliate_url`이 비어 있으면 버튼은 비활성화됩니다.

## 배포 방법

Vercel 기준:

1. GitHub에 프로젝트를 푸시합니다.
2. Vercel에서 저장소를 Import합니다.
3. Framework Preset은 `Next.js`를 선택합니다.
4. Environment Variables에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 추가합니다.
5. Deploy를 실행합니다.

배포 후 Supabase의 Site URL과 Redirect URL 설정이 필요한 인증 기능을 추가한다면, Vercel 배포 도메인을 Supabase Auth 설정에 추가하세요.
