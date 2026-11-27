export interface BokchaeItem {
  id: string;
  indexLabel: string;
  category: string;
  name: string;
  url: string;
}

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
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0W1VgU9pA'),
  },
  {
    id: 'choonsik-2027-desk-calendar',
    indexLabel: '02',
    category: '탁상 달력',
    name: '춘식이 2027 A4 사이즈 탁상 캘린더, 윙크, 1개',
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0W8wlmB52'),
  },
  {
    id: 'indigo-2027-lunar-wall-calendar',
    indexLabel: '03',
    category: '음력 달력',
    name: '인디고 2027 루나 옛날 3단 3개월 음력 벽걸이 달력 캘린더',
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0WUyZiKXI'),
  },
];

export const BOKCHAE_CONFIG = {
  kicker: '복채 · 저승차사 재(災) 찻값',
  title: '풀이가 도움이 되셨다면 복채를 남겨 보세요',
  quote:
    '위 상품과 무관하게 아래 경로를 통해 평소 필요하신 물건을 구매해 주셔도 서비스 운영에 큰 도움이 됩니다. 구매하시는 금액은 평소와 동일합니다.',
  itemCtaLabel: '쿠팡에서 보기',
  ftcNotice:
    '※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
} as const;
