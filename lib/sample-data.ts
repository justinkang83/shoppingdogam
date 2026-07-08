import type { Category, Product } from "@/lib/types";

export const categories: Category[] = [
  { id: "cat-life", name: "생활가전", slug: "home-appliances" },
  { id: "cat-kitchen", name: "주방가전", slug: "kitchen-appliances" },
  { id: "cat-season", name: "계절가전", slug: "seasonal-appliances" },
  { id: "cat-digital", name: "디지털기기", slug: "digital-devices" },
  { id: "cat-pc", name: "PC·주변기기", slug: "pc-accessories" },
  { id: "cat-audio", name: "음향기기", slug: "audio-devices" },
  { id: "cat-smart", name: "스마트홈", slug: "smart-home" },
  { id: "cat-car", name: "자동차 디지털용품", slug: "car-digital" }
];

const img = (seed: number) => `https://picsum.photos/seed/pickguide-${seed}/900/700`;

export const products: Product[] = [
  product("p1", "cat-life", "무선 물걸레 로봇청소기 R9", "wireless-robot-vacuum-r9", "클린큐", img(1), 399000, 4.7, 1824, true, 91, true, ["흡입과 물걸레를 한 번에 처리", "앱 예약 청소 지원"], ["문턱이 높은 집은 이동 제한"], ["맞벌이 가정", "반려동물 가정"], ["복잡한 구조의 원룸"], ["소모품 가격", "문턱 높이"]),
  product("p2", "cat-life", "초경량 무선청소기 V20", "light-cordless-vacuum-v20", "에어맥스", img(2), 219000, 4.5, 932, true, 87, false, ["가볍고 손목 부담이 적음", "거치대 충전 편리"], ["먼지통 용량은 평범"], ["매일 간단 청소하는 사용자"], ["대형 평수 메인 청소"], ["배터리 교체 가능 여부"]),
  product("p3", "cat-life", "프리미엄 의류관리기 S3", "garment-care-s3", "스타일온", img(3), 1189000, 4.8, 511, false, 92, true, ["정장·코트 관리에 강함", "탈취 성능 우수"], ["설치 공간 필요"], ["출근복 관리가 많은 가정"], ["공간이 좁은 원룸"], ["설치 폭", "소음"]),
  product("p4", "cat-kitchen", "올인원 에어프라이어 오븐 22L", "air-fryer-oven-22l", "쿡마스터", img(4), 159000, 4.6, 2510, true, 89, true, ["용량 대비 가격 좋음", "로티세리 구성 포함"], ["상단 발열 세척이 번거로움"], ["2~4인 가정", "냉동식품 활용 사용자"], ["싱크대 공간이 좁은 집"], ["실사용 크기", "세척 난이도"]),
  product("p5", "cat-kitchen", "저소음 초고속 블렌더 B7", "quiet-power-blender-b7", "블렌딕", img(5), 129000, 4.4, 823, true, 84, false, ["얼음 분쇄력 좋음", "가격 접근성 높음"], ["대용량 연속 사용은 제한"], ["스무디 입문자"], ["매장용 사용"], ["컵 소재", "칼날 세척"]),
  product("p6", "cat-kitchen", "6인용 식기세척기 미니", "mini-dishwasher-6", "워시온", img(6), 329000, 4.6, 774, false, 88, true, ["설치 부담이 낮음", "1~2인 가구에 적합"], ["대형 냄비 수납 제한"], ["1~2인 가구", "전세 거주자"], ["대가족"], ["급수 방식", "건조 성능"]),
  product("p7", "cat-season", "저전력 서큘레이터 C5", "energy-circulator-c5", "윈드랩", img(7), 79000, 4.5, 1840, true, 86, false, ["공기 순환 효율 우수", "저소음 모드 제공"], ["리모컨 수납이 아쉬움"], ["에어컨 보조용"], ["강풍 선풍기 대체 목적"], ["최저 소음", "회전 각도"]),
  product("p8", "cat-season", "프리미엄 제습기 16L", "dehumidifier-16l-pro", "드라이홈", img(8), 279000, 4.7, 1466, true, 90, true, ["제습 속도 빠름", "물통 분리 쉬움"], ["취침 시 약간의 운전음"], ["장마철 빨래 건조"], ["극저소음만 원하는 사용자"], ["일 제습량", "배수 호스"]),
  product("p9", "cat-season", "공기청정기 H13 타워", "h13-air-purifier-tower", "퓨어링", img(9), 199000, 4.6, 3221, true, 88, false, ["필터 등급 명확", "거실용 풍량 충분"], ["앱 기능은 단순"], ["거실 공기관리"], ["고급 IoT 자동화 목적"], ["필터 가격", "적정 면적"]),
  product("p10", "cat-digital", "10.9형 태블릿 라이트", "tablet-lite-109", "탭노바", img(10), 349000, 4.5, 1198, true, 86, true, ["영상·필기 균형 좋음", "배터리 준수"], ["고사양 게임은 제한"], ["인강·OTT 사용자"], ["전문 드로잉 작업"], ["펜 포함 여부", "저장 용량"]),
  product("p11", "cat-digital", "액션캠 4K 스테디", "actioncam-4k-steady", "무브샷", img(11), 229000, 4.3, 655, false, 82, false, ["손떨림 보정 우수", "방수 케이스 포함"], ["야간 화질은 평범"], ["브이로그 입문자"], ["전문 촬영 장비 대체"], ["배터리 시간", "마운트 호환"]),
  product("p12", "cat-digital", "전자책 리더 7인치", "ebook-reader-7", "리드온", img(12), 189000, 4.7, 904, true, 89, false, ["눈 부담이 낮음", "가벼운 휴대성"], ["컬러 콘텐츠에는 부적합"], ["독서량 많은 사용자"], ["만화·잡지 중심 사용자"], ["지원 서점", "방수 여부"]),
  product("p13", "cat-pc", "27형 QHD 165Hz 모니터", "qhd-165-monitor-27", "픽셀웍스", img(13), 269000, 4.6, 2044, true, 90, true, ["게임과 작업 모두 균형", "스탠드 조절폭 충분"], ["내장 스피커 품질 낮음"], ["게이밍 겸 작업용"], ["색보정 전문 작업"], ["패널 종류", "스탠드 규격"]),
  product("p14", "cat-pc", "기계식 저소음 키보드 K8", "silent-mechanical-keyboard-k8", "타건랩", img(14), 99000, 4.5, 1330, true, 85, false, ["타건감과 소음 균형", "핫스왑 지원"], ["전용 소프트웨어 완성도 보통"], ["재택근무", "입문 기계식"], ["초저소음 사무실"], ["배열", "스위치 호환"]),
  product("p15", "cat-pc", "USB-C 멀티 허브 8in1", "usb-c-hub-8in1", "포트업", img(15), 49000, 4.4, 2876, true, 83, false, ["필수 포트 구성", "휴대성 좋음"], ["고부하 시 발열 있음"], ["노트북 사용자"], ["상시 고속 전송 작업"], ["PD 출력", "HDMI 해상도"]),
  product("p16", "cat-audio", "노이즈캔슬링 무선 헤드폰", "anc-wireless-headphones", "사운드핏", img(16), 179000, 4.7, 1655, true, 91, true, ["ANC 성능 우수", "착용감 안정적"], ["접이식 힌지 내구성 확인 필요"], ["출퇴근·비행 이용자"], ["초경량 이어폰 선호자"], ["멀티포인트", "이어패드 교체"]),
  product("p17", "cat-audio", "데스크탑 블루투스 스피커", "desktop-bluetooth-speaker", "톤브릭", img(17), 89000, 4.4, 722, false, 82, false, ["공간감 좋은 사운드", "디자인 깔끔"], ["저음은 과하지 않음"], ["책상 음악 감상"], ["강한 저음 선호자"], ["입력 단자", "크기"]),
  product("p18", "cat-smart", "스마트 도어락 WiFi", "smart-doorlock-wifi", "세이프홈", img(18), 249000, 4.6, 618, true, 88, true, ["원격 확인 편리", "방문자 비밀번호 지원"], ["설치 환경 확인 필요"], ["가족·공유주택"], ["자가 설치가 어려운 사용자"], ["문 규격", "설치비"]),
  product("p19", "cat-smart", "스마트 플러그 4팩", "smart-plug-4pack", "홈링크", img(19), 39000, 4.5, 2440, true, 84, false, ["자동화 입문에 적합", "전력 측정 지원"], ["고전력 제품은 주의"], ["스마트홈 입문자"], ["에어컨 등 고전력 제어"], ["정격 전류", "앱 호환"]),
  product("p20", "cat-car", "2채널 QHD 블랙박스", "qhd-dual-dashcam", "로드아이", img(20), 219000, 4.6, 1119, true, 89, true, ["전후방 화질 선명", "주차 녹화 안정적"], ["상시 전원 설치 필요"], ["출퇴근 운전자"], ["간단 탈부착 목적"], ["메모리 지원", "장착 비용"])
];

function product(id: string, category_id: string, name: string, slug: string, brand: string, image_url: string, price: number, rating: number, review_count: number, is_rocket: boolean, total_score: number, is_featured: boolean, pros: string[], cons: string[], recommended_for: string[], not_recommended_for: string[], check_points: string[]): Product {
  const base = Math.max(76, total_score - 6);
  return {
    id,
    category_id,
    name,
    slug,
    brand,
    image_url,
    price,
    rating,
    review_count,
    is_rocket,
    short_review: `${brand} ${name}은 가격과 사용성을 함께 고려했을 때 구매 후보에 올릴 만한 제품입니다.`,
    pros,
    cons,
    recommended_for,
    not_recommended_for,
    check_points,
    performance_score: Math.min(95, base + 4),
    durability_score: Math.min(95, base + 1),
    usability_score: Math.min(95, base + 3),
    design_score: Math.min(95, base),
    brand_score: Math.min(95, base + 2),
    value_score: Math.min(95, base + 5),
    total_score,
    affiliate_url: "",
    is_featured
  };
}
