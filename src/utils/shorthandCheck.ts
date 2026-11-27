import type { PillarOrderMode } from '../types/saju';

const STEM_HANGUL = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const STEM_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCH_HANGUL = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const UNKNOWN_SET = new Set(['?', '-', '_', 'x', 'X', '○', '공', '모']);

const STEM_MAP = new Map<string, number>();
STEM_HANGUL.forEach((c, i) => {
  STEM_MAP.set(c, i);
  STEM_MAP.set(STEM_HANJA[i], i);
});

const BRANCH_MAP = new Map<string, number>();
BRANCH_HANGUL.forEach((c, i) => {
  BRANCH_MAP.set(c, i);
  BRANCH_MAP.set(BRANCH_HANJA[i], i);
});

export type ShorthandPreviewResult =
  | { ok: true; previewLabel: string }
  | { ok: false; error: string };

/**
 * 입력창 실시간 오타 점검용 경량 포맷 확인기
 * (실제 원국 구성 및 궁합 계산은 서버 API에서 수행)
 */
export function previewShorthandCode(
  input: string,
  order: PillarOrderMode = 'hour-first'
): ShorthandPreviewResult {
  const cleaned = input.trim().replace(/[()[\],·|]/g, ' ').replace(/\s+/g, ' ');
  if (!cleaned) {
    return { ok: false, error: '만세력 여덟 글자를 입력해 주세요.' };
  }

  const pairList: ({ s: number; b: number } | null)[] = [];

  if (cleaned.includes('/')) {
    const parts = cleaned.split('/').map((p) => p.replace(/\s+/g, ''));
    if (parts.length !== 2) {
      return { ok: false, error: '슬래시(/)는 천간과 지지를 한 번만 구분하거나 생략해 주세요.' };
    }
    const sc = Array.from(parts[0]);
    const bc = Array.from(parts[1]);
    if (sc.length !== bc.length || (sc.length !== 3 && sc.length !== 4)) {
      return { ok: false, error: '천간·지지는 각 4글자(총 8자) 또는 생시 미상 3글자(총 6자)로 입력해 주세요.' };
    }
    for (let i = 0; i < sc.length; i++) {
      if (UNKNOWN_SET.has(sc[i]) && UNKNOWN_SET.has(bc[i])) {
        pairList.push(null);
        continue;
      }
      const s = STEM_MAP.get(sc[i]);
      const b = BRANCH_MAP.get(bc[i]);
      if (s === undefined) return { ok: false, error: `천간에 인식할 수 없는 글자 '${sc[i]}'가 있습니다.` };
      if (b === undefined) return { ok: false, error: `지지에 인식할 수 없는 글자 '${bc[i]}'가 있습니다.` };
      pairList.push({ s, b });
    }
  } else {
    const chars = Array.from(cleaned.replace(/\s+/g, ''));
    if (chars.length !== 6 && chars.length !== 8) {
      return {
        ok: false,
        error: '천간 4자+지지 4자 이어쓰기 8자(예: 계병무경사술자술) 또는 생시 미상 6자로 입력해 주세요.',
      };
    }
    const half = chars.length / 2;
    const first = chars.slice(0, half);
    const second = chars.slice(half);
    const stemsThenBranches =
      first.every((c, i) => STEM_MAP.has(c) || (UNKNOWN_SET.has(c) && UNKNOWN_SET.has(second[i]))) &&
      second.every((c, i) => BRANCH_MAP.has(c) || (UNKNOWN_SET.has(c) && UNKNOWN_SET.has(first[i])));

    if (stemsThenBranches) {
      for (let i = 0; i < half; i++) {
        if (UNKNOWN_SET.has(first[i]) && UNKNOWN_SET.has(second[i])) pairList.push(null);
        else pairList.push({ s: STEM_MAP.get(first[i])!, b: BRANCH_MAP.get(second[i])! });
      }
    } else {
      for (let i = 0; i < chars.length; i += 2) {
        const sc = chars[i];
        const bc = chars[i + 1];
        if (UNKNOWN_SET.has(sc) && UNKNOWN_SET.has(bc)) {
          pairList.push(null);
          continue;
        }
        const s = STEM_MAP.get(sc);
        const b = BRANCH_MAP.get(bc);
        if (s === undefined || b === undefined) {
          return { ok: false, error: '만세력 형식을 확인해 주세요. 예: 계병무경사술자술' };
        }
        pairList.push({ s, b });
      }
    }
  }

  let hour: { s: number; b: number } | null = null;
  let day: { s: number; b: number } | null = null;
  let month: { s: number; b: number } | null = null;
  let year: { s: number; b: number } | null = null;

  if (pairList.length === 4) {
    if (order === 'hour-first') [hour, day, month, year] = pairList;
    else [year, month, day, hour] = pairList;
  } else {
    if (order === 'hour-first') [day, month, year] = pairList;
    else [year, month, day] = pairList;
  }

  if (!day || !month || !year) {
    return { ok: false, error: '일주·월주·연주 세 기둥은 비워둘 수 없습니다.' };
  }

  const checks: [{ s: number; b: number } | null, string][] = [
    [hour, '시주'],
    [day, '일주'],
    [month, '월주'],
    [year, '연주'],
  ];
  for (const [p, label] of checks) {
    if (p && p.s % 2 !== p.b % 2) {
      return {
        ok: false,
        error: `${label} '${STEM_HANGUL[p.s]}${BRANCH_HANGUL[p.b]}'은 60갑자에 없는 음양 조합입니다.`,
      };
    }
  }

  const fmt = (p: { s: number; b: number } | null) =>
    p ? `${STEM_HANGUL[p.s]}${BRANCH_HANGUL[p.b]}` : '미상';

  return {
    ok: true,
    previewLabel: `${fmt(hour)}(시) · ${fmt(day)}(일) · ${fmt(month)}(월) · ${fmt(year)}(년)`,
  };
}
