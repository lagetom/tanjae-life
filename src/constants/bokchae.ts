export interface BokchaeItem {
  id: string;
  indexLabel: string;
  category: string;
  name: string;
  description: string;
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
    category: '다이어리 · 새해 기록',
    name: '카카오프렌즈 KF 2027 날짜형 양장 다이어리',
    description: '2027년 월별 흐름과 하루의 다짐을 차분히 적어 내려가기 좋은 날짜형 양장 기록장입니다.',
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0W1VgU9pA'),
  },
  {
    id: 'choonsik-2027-desk-calendar',
    indexLabel: '02',
    category: '탁상 달력 · 일정 점검',
    name: '춘식이 2027 A4 사이즈 탁상 캘린더, 윙크, 1개',
    description: '책상 위에 두고 한 달의 주요 일정과 계절의 변곡점을 넉넉한 칸에 표시할 수 있습니다.',
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0W8wlmB52'),
  },
  {
    id: 'indigo-2027-lunar-wall-calendar',
    indexLabel: '03',
    category: '음력 벽걸이 달력 · 3개월 한눈에',
    name: '인디고 2027 루나 옛날 3단 3개월 음력 벽걸이 달력 캘린더',
    description: '음력과 달의 흐름은 물론 앞뒤 석 달의 호흡까지 한눈에 살필 수 있는 3단 벽걸이 달력입니다.',
    url: sanitizeExternalHttpUrl('https://link.coupang.com/a/i0WUyZiKXI'),
  },
];

export const BOKCHAE_CONFIG = {
  kicker: '복채 · 2027 새해 맞이 문구',
  title: '풀이가 도움이 되셨다면 복채를 남겨 보세요',
  quote:
    '따로 복채를 받지 않는 대신, 새해 일정을 적을 달력이나 기록장이 필요하실 때 아래 링크로 둘러봐 주시면 저승차사 재(災)의 찻값과 운영에 큰 힘이 됩니다.',
  itemCtaLabel: '쿠팡에서 보기',
  ftcNotice:
    '※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
  disclaimer:
    '구매하시는 금액은 평소와 동일하며, 본 명리·점성술 풀이는 자기 이해를 돕기 위한 참고용 콘텐츠입니다.',
} as const;
