export type BokchaeShop = 'coupang' | 'toss';

export interface BokchaeItem {
  id: string;
  indexLabel: string;
  category: string;
  name: string;
  shop: BokchaeShop;
  url: string;
}

export const BOKCHAE_SHOP_CTA: Record<BokchaeShop, string> = {
  coupang: '쿠팡에서 보기',
  toss: '토스쇼핑에서 보기',
};

function sanitizeExternalHttpUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

export const BOKCHAE_ITEMS: readonly BokchaeItem[] = [
  {
    id: 'kakao-2027-diary',
    indexLabel: '01',
    category: '다이어리',
    name: '카카오프렌즈 KF 2027 날짜형 양장 다이어리',
    shop: 'coupang',
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0W1VgU9pA'),
  },
  {
    id: 'indigo-2027-lunar-wall-calendar',
    indexLabel: '02',
    category: '음력 달력',
    name: '인디고 2027 루나 옛날 3단 3개월 음력 벽걸이 달력 캘린더',
    shop: 'coupang',
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0WUyZiKXI'),
  },
  {
    id: 'philips-taq2000-earcuff',
    indexLabel: '03',
    category: '이어폰',
    name: '필립스 TAQ2000 이어커프 무선 블루투스 이어폰, 화이트, 1개',
    shop: 'toss',
    url: sanitizeExternalHttpUrl('https://toss.shopping/_m/lMzwvmtq'),
  },
];

export const BOKCHAE_CONFIG = {
  kicker: '복채 · 저승차사 재(災) 찻값',
  title: '풀이가 도움이 되셨다면 복채를 남겨 보세요',
  quote:
    '꼭 위 상품이 아니어도 됩니다. 위 쿠팡 버튼으로 쿠팡에 들어가 평소 필요하신 물건을 사셔도 운영에 도움이 됩니다. 가격은 평소와 같습니다.',
  ftcNotices: [
    '※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
    '※ 이 포스팅은 토스쇼핑 쉐어링크 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
  ],
} as const;
