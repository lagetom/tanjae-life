const rawUrl = (import.meta.env.VITE_COUPANG_PARTNERS_URL ?? '').trim();

function sanitizeExternalHttpUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

export const BOKCHAE_CONFIG = {
  /**
   * 쿠팡 파트너스 링크를 연결하려면 .env(또는 환경 변수)의
   * VITE_COUPANG_PARTNERS_URL 값을 설정하거나 아래 기본값을 교체하세요.
   */
  coupangUrl: sanitizeExternalHttpUrl(rawUrl),
  title: '풀이가 도움이 되셨다면 복채를 남겨 보세요',
  quote:
    '따로 비용을 받지 않는 대신, 평소 필요하신 물건을 아래 쿠팡 링크를 통해 구매해 주시면 저승차사 재(災)의 찻값과 서비스 운영에 큰 힘이 됩니다. 구매하시는 금액이 달라지지는 않습니다.',
  ctaLabel: '쿠팡에서 쇼핑하고 복채 전하기',
  ftcNotice:
    '이 서비스는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
  disclaimer:
    '본 명리·점성술 풀이는 자기 이해와 즐거움을 돕기 위한 참고용 콘텐츠입니다.',
} as const;
