create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  brand text not null,
  image_url text not null,
  price integer not null default 0,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  is_rocket boolean not null default false,
  short_review text not null default '',
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  recommended_for text[] not null default '{}',
  not_recommended_for text[] not null default '{}',
  check_points text[] not null default '{}',
  performance_score integer not null default 80 check (performance_score between 0 and 100),
  durability_score integer not null default 80 check (durability_score between 0 and 100),
  usability_score integer not null default 80 check (usability_score between 0 and 100),
  design_score integer not null default 80 check (design_score between 0 and 100),
  brand_score integer not null default 80 check (brand_score between 0 and 100),
  value_score integer not null default 80 check (value_score between 0 and 100),
  total_score integer not null default 80 check (total_score between 0 and 100),
  affiliate_url text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists click_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text,
  user_agent text
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
before update on products
for each row execute function set_updated_at();

alter table categories enable row level security;
alter table products enable row level security;
alter table click_logs enable row level security;

drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);
drop policy if exists "public insert click logs" on click_logs;
create policy "public insert click logs" on click_logs for insert with check (true);

-- MVP 관리자 화면용 공개 CRUD 정책입니다. 실서비스 전에는 Supabase Auth와 관리자 권한 체크로 교체하세요.
drop policy if exists "mvp public manage categories" on categories;
create policy "mvp public manage categories" on categories for all using (true) with check (true);
drop policy if exists "mvp public manage products" on products;
create policy "mvp public manage products" on products for all using (true) with check (true);

insert into categories (name, slug) values
('생활가전', 'home-appliances'),
('주방가전', 'kitchen-appliances'),
('계절가전', 'seasonal-appliances'),
('디지털기기', 'digital-devices'),
('PC·주변기기', 'pc-accessories'),
('음향기기', 'audio-devices'),
('스마트홈', 'smart-home'),
('자동차 디지털용품', 'car-digital')
on conflict (slug) do update set name = excluded.name;

with c as (select id, slug from categories)
insert into products (
  category_id, name, slug, brand, image_url, price, rating, review_count, is_rocket, short_review,
  pros, cons, recommended_for, not_recommended_for, check_points,
  performance_score, durability_score, usability_score, design_score, brand_score, value_score, total_score, affiliate_url, is_featured
) values
((select id from c where slug='home-appliances'), '무선 물걸레 로봇청소기 R9', 'wireless-robot-vacuum-r9', '클린큐', 'https://picsum.photos/seed/pickguide-1/900/700', 399000, 4.7, 1824, true, '흡입과 물걸레를 한 번에 처리하는 자동 청소 후보입니다.', array['흡입과 물걸레를 한 번에 처리','앱 예약 청소 지원'], array['문턱이 높은 집은 이동 제한'], array['맞벌이 가정','반려동물 가정'], array['복잡한 구조의 원룸'], array['소모품 가격','문턱 높이'], 89,86,88,85,87,90,91,'',true),
((select id from c where slug='home-appliances'), '초경량 무선청소기 V20', 'light-cordless-vacuum-v20', '에어맥스', 'https://picsum.photos/seed/pickguide-2/900/700', 219000, 4.5, 932, true, '가볍고 매일 쓰기 쉬운 무선청소기입니다.', array['가볍고 손목 부담이 적음','거치대 충전 편리'], array['먼지통 용량은 평범'], array['매일 간단 청소하는 사용자'], array['대형 평수 메인 청소'], array['배터리 교체 가능 여부'], 85,82,86,81,83,88,87,'',false),
((select id from c where slug='home-appliances'), '프리미엄 의류관리기 S3', 'garment-care-s3', '스타일온', 'https://picsum.photos/seed/pickguide-3/900/700', 1189000, 4.8, 511, false, '정장과 코트 관리에 강한 프리미엄 선택지입니다.', array['정장·코트 관리에 강함','탈취 성능 우수'], array['설치 공간 필요'], array['출근복 관리가 많은 가정'], array['공간이 좁은 원룸'], array['설치 폭','소음'], 91,89,90,88,92,84,92,'',true),
((select id from c where slug='kitchen-appliances'), '올인원 에어프라이어 오븐 22L', 'air-fryer-oven-22l', '쿡마스터', 'https://picsum.photos/seed/pickguide-4/900/700', 159000, 4.6, 2510, true, '용량과 가격 균형이 좋은 주방가전입니다.', array['용량 대비 가격 좋음','로티세리 구성 포함'], array['상단 발열 세척이 번거로움'], array['2~4인 가정','냉동식품 활용 사용자'], array['싱크대 공간이 좁은 집'], array['실사용 크기','세척 난이도'], 87,84,88,83,86,91,89,'',true),
((select id from c where slug='kitchen-appliances'), '저소음 초고속 블렌더 B7', 'quiet-power-blender-b7', '블렌딕', 'https://picsum.photos/seed/pickguide-5/900/700', 129000, 4.4, 823, true, '스무디 입문자에게 맞는 합리적 블렌더입니다.', array['얼음 분쇄력 좋음','가격 접근성 높음'], array['대용량 연속 사용은 제한'], array['스무디 입문자'], array['매장용 사용'], array['컵 소재','칼날 세척'], 84,80,83,82,81,87,84,'',false),
((select id from c where slug='kitchen-appliances'), '6인용 식기세척기 미니', 'mini-dishwasher-6', '워시온', 'https://picsum.photos/seed/pickguide-6/900/700', 329000, 4.6, 774, false, '설치 부담을 낮춘 1~2인 가구용 식기세척기입니다.', array['설치 부담이 낮음','1~2인 가구에 적합'], array['대형 냄비 수납 제한'], array['1~2인 가구','전세 거주자'], array['대가족'], array['급수 방식','건조 성능'], 86,85,88,84,85,87,88,'',true),
((select id from c where slug='seasonal-appliances'), '저전력 서큘레이터 C5', 'energy-circulator-c5', '윈드랩', 'https://picsum.photos/seed/pickguide-7/900/700', 79000, 4.5, 1840, true, '에어컨 보조용으로 가성비가 좋은 서큘레이터입니다.', array['공기 순환 효율 우수','저소음 모드 제공'], array['리모컨 수납이 아쉬움'], array['에어컨 보조용'], array['강풍 선풍기 대체 목적'], array['최저 소음','회전 각도'], 84,82,86,81,83,89,86,'',false),
((select id from c where slug='seasonal-appliances'), '프리미엄 제습기 16L', 'dehumidifier-16l-pro', '드라이홈', 'https://picsum.photos/seed/pickguide-8/900/700', 279000, 4.7, 1466, true, '장마철 빨래 건조와 습도 관리에 적합합니다.', array['제습 속도 빠름','물통 분리 쉬움'], array['취침 시 약간의 운전음'], array['장마철 빨래 건조'], array['극저소음만 원하는 사용자'], array['일 제습량','배수 호스'], 89,87,88,84,86,88,90,'',true),
((select id from c where slug='seasonal-appliances'), '공기청정기 H13 타워', 'h13-air-purifier-tower', '퓨어링', 'https://picsum.photos/seed/pickguide-9/900/700', 199000, 4.6, 3221, true, '거실용 풍량과 필터 등급이 명확한 공기청정기입니다.', array['필터 등급 명확','거실용 풍량 충분'], array['앱 기능은 단순'], array['거실 공기관리'], array['고급 IoT 자동화 목적'], array['필터 가격','적정 면적'], 87,85,86,84,86,89,88,'',false),
((select id from c where slug='digital-devices'), '10.9형 태블릿 라이트', 'tablet-lite-109', '탭노바', 'https://picsum.photos/seed/pickguide-10/900/700', 349000, 4.5, 1198, true, '영상과 필기 용도에 균형 잡힌 태블릿입니다.', array['영상·필기 균형 좋음','배터리 준수'], array['고사양 게임은 제한'], array['인강·OTT 사용자'], array['전문 드로잉 작업'], array['펜 포함 여부','저장 용량'], 85,83,87,84,84,86,86,'',true),
((select id from c where slug='digital-devices'), '액션캠 4K 스테디', 'actioncam-4k-steady', '무브샷', 'https://picsum.photos/seed/pickguide-11/900/700', 229000, 4.3, 655, false, '입문 브이로그용으로 손떨림 보정이 좋은 액션캠입니다.', array['손떨림 보정 우수','방수 케이스 포함'], array['야간 화질은 평범'], array['브이로그 입문자'], array['전문 촬영 장비 대체'], array['배터리 시간','마운트 호환'], 83,80,82,82,80,85,82,'',false),
((select id from c where slug='digital-devices'), '전자책 리더 7인치', 'ebook-reader-7', '리드온', 'https://picsum.photos/seed/pickguide-12/900/700', 189000, 4.7, 904, true, '독서량이 많은 사용자에게 맞는 휴대용 리더입니다.', array['눈 부담이 낮음','가벼운 휴대성'], array['컬러 콘텐츠에는 부적합'], array['독서량 많은 사용자'], array['만화·잡지 중심 사용자'], array['지원 서점','방수 여부'], 85,84,89,84,86,88,89,'',false),
((select id from c where slug='pc-accessories'), '27형 QHD 165Hz 모니터', 'qhd-165-monitor-27', '픽셀웍스', 'https://picsum.photos/seed/pickguide-13/900/700', 269000, 4.6, 2044, true, '게임과 작업을 함께 고려한 QHD 모니터입니다.', array['게임과 작업 모두 균형','스탠드 조절폭 충분'], array['내장 스피커 품질 낮음'], array['게이밍 겸 작업용'], array['색보정 전문 작업'], array['패널 종류','스탠드 규격'], 90,85,87,86,84,89,90,'',true),
((select id from c where slug='pc-accessories'), '기계식 저소음 키보드 K8', 'silent-mechanical-keyboard-k8', '타건랩', 'https://picsum.photos/seed/pickguide-14/900/700', 99000, 4.5, 1330, true, '타건감과 소음 균형을 잡은 입문형 키보드입니다.', array['타건감과 소음 균형','핫스왑 지원'], array['전용 소프트웨어 완성도 보통'], array['재택근무','입문 기계식'], array['초저소음 사무실'], array['배열','스위치 호환'], 83,84,86,83,82,87,85,'',false),
((select id from c where slug='pc-accessories'), 'USB-C 멀티 허브 8in1', 'usb-c-hub-8in1', '포트업', 'https://picsum.photos/seed/pickguide-15/900/700', 49000, 4.4, 2876, true, '노트북 필수 포트를 합리적으로 확장합니다.', array['필수 포트 구성','휴대성 좋음'], array['고부하 시 발열 있음'], array['노트북 사용자'], array['상시 고속 전송 작업'], array['PD 출력','HDMI 해상도'], 81,80,85,82,81,88,83,'',false),
((select id from c where slug='audio-devices'), '노이즈캔슬링 무선 헤드폰', 'anc-wireless-headphones', '사운드핏', 'https://picsum.photos/seed/pickguide-16/900/700', 179000, 4.7, 1655, true, '출퇴근과 비행에 어울리는 ANC 헤드폰입니다.', array['ANC 성능 우수','착용감 안정적'], array['접이식 힌지 내구성 확인 필요'], array['출퇴근·비행 이용자'], array['초경량 이어폰 선호자'], array['멀티포인트','이어패드 교체'], 89,86,88,87,86,89,91,'',true),
((select id from c where slug='audio-devices'), '데스크탑 블루투스 스피커', 'desktop-bluetooth-speaker', '톤브릭', 'https://picsum.photos/seed/pickguide-17/900/700', 89000, 4.4, 722, false, '책상 위 음악 감상에 적합한 스피커입니다.', array['공간감 좋은 사운드','디자인 깔끔'], array['저음은 과하지 않음'], array['책상 음악 감상'], array['강한 저음 선호자'], array['입력 단자','크기'], 82,80,83,85,80,84,82,'',false),
((select id from c where slug='smart-home'), '스마트 도어락 WiFi', 'smart-doorlock-wifi', '세이프홈', 'https://picsum.photos/seed/pickguide-18/900/700', 249000, 4.6, 618, true, '원격 확인과 방문자 비밀번호가 편리한 도어락입니다.', array['원격 확인 편리','방문자 비밀번호 지원'], array['설치 환경 확인 필요'], array['가족·공유주택'], array['자가 설치가 어려운 사용자'], array['문 규격','설치비'], 86,88,87,84,88,86,88,'',true),
((select id from c where slug='smart-home'), '스마트 플러그 4팩', 'smart-plug-4pack', '홈링크', 'https://picsum.photos/seed/pickguide-19/900/700', 39000, 4.5, 2440, true, '스마트홈 자동화 입문에 좋은 4팩 구성입니다.', array['자동화 입문에 적합','전력 측정 지원'], array['고전력 제품은 주의'], array['스마트홈 입문자'], array['에어컨 등 고전력 제어'], array['정격 전류','앱 호환'], 81,82,86,80,82,90,84,'',false),
((select id from c where slug='car-digital'), '2채널 QHD 블랙박스', 'qhd-dual-dashcam', '로드아이', 'https://picsum.photos/seed/pickguide-20/900/700', 219000, 4.6, 1119, true, '전후방 화질과 주차 녹화를 중시한 블랙박스입니다.', array['전후방 화질 선명','주차 녹화 안정적'], array['상시 전원 설치 필요'], array['출퇴근 운전자'], array['간단 탈부착 목적'], array['메모리 지원','장착 비용'], 88,86,86,84,86,88,89,'',true)
on conflict (slug) do nothing;
