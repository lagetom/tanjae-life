import {
  BRANCHES,
  ELEMENT_META,
  ELEMENT_ORDER,
  STEMS,
  calculateSajuChart,
  controlledBy,
  controls,
  generatedBy,
  generates,
  getLifeStage,
  getTenGod,
  getTenGodGroup,
} from './manseryeok.ts';
import { DAY_PILLAR_PROFILES } from './sajuKnowledge.ts';
import type {
  BirthInput,
  ElementBalanceItem,
  ElementType,
  GroupChemistryReport,
  GroupSamhapMatch,
  PairCompatibility,
  PairSignal,
  Pillar,
  PillarOrderMode,
  RelationMember,
  SajuChart,
  SeoldamMood,
  StemInfo,
  StrengthGrade,
  TenGod,
  TenGodGroup,
} from '../../src/types/saju.ts';

export type {
  GroupChemistryReport,
  GroupSamhapMatch,
  PairCompatibility,
  PairSignal,
  PillarOrderMode,
  RelationMember,
};

export interface ParsedPillarRaw {
  hour: { stemIdx: number; branchIdx: number } | null;
  day: { stemIdx: number; branchIdx: number };
  month: { stemIdx: number; branchIdx: number };
  year: { stemIdx: number; branchIdx: number };
}

export type ParseCodeResult =
  | { ok: true; raw: ParsedPillarRaw; normalizedCode: string }
  | { ok: false; error: string };

const STEM_CHAR_MAP = new Map<string, number>();
STEMS.forEach((s) => {
  STEM_CHAR_MAP.set(s.hangul, s.index);
  STEM_CHAR_MAP.set(s.hanja, s.index);
});

const BRANCH_CHAR_MAP = new Map<string, number>();
BRANCHES.forEach((b) => {
  BRANCH_CHAR_MAP.set(b.hangul, b.index);
  BRANCH_CHAR_MAP.set(b.hanja, b.index);
});

const UNKNOWN_TOKENS = new Set(['?', '-', '_', 'x', 'X', '○', '공', '모']);

function buildSinglePillar(
  position: Pillar['position'],
  label: string,
  stemIdx: number,
  branchIdx: number,
  dayMaster: StemInfo
): Pillar {
  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  const mainHiddenStemIdx = branch.hiddenStems[branch.hiddenStems.length - 1];
  const mainHiddenStem = STEMS[mainHiddenStemIdx];

  const hiddenStems = branch.hiddenStems.map((hsIdx, i) => {
    const hs = STEMS[hsIdx];
    const role: '여기' | '중기' | '정기' =
      i === branch.hiddenStems.length - 1 ? '정기' : i === 0 ? '여기' : '중기';
    return {
      stem: hs,
      tenGod: getTenGod(dayMaster, hs),
      role,
    };
  });

  return {
    position,
    label,
    stem,
    branch,
    ganjiHangul: `${stem.hangul}${branch.hangul}`,
    ganjiHanja: `${stem.hanja}${branch.hanja}`,
    stemTenGod: position === 'day' ? '일간(본원)' : getTenGod(dayMaster, stem),
    branchTenGod: getTenGod(dayMaster, mainHiddenStem),
    hiddenStems,
    lifeStage: getLifeStage(dayMaster, branch.index),
    isKnown: true,
  };
}

function validateGanjiPair(
  stemIdx: number,
  branchIdx: number,
  positionLabel: string
): string | null {
  if (stemIdx % 2 !== branchIdx % 2) {
    const s = STEMS[stemIdx];
    const b = BRANCHES[branchIdx];
    return `${positionLabel} '${s.hangul}${b.hangul}(${s.hanja}${b.hanja})'은 60갑자에 존재하지 않는 음양 조합입니다. 천간·지지 위치나 오타를 확인해 주세요.`;
  }
  return null;
}

/**
 * 만세력 약식 문자열 파서
 * 지원 형식:
 * 1) 천간+지지 이어쓰기 (기본 권장): '계병무경사술자술' (8자), '병무경술자술' (생시 미상 6자)
 * 2) 슬래시 구분: '계병무경/사술자술' (4주), '병무경/술자술' (3주), '?병무경/?술자술'
 * 3) 기둥 쌍 공백/이어쓰기: '계사 병술 무자 경술' (4주), '병술 무자 경술' (3주)
 * 한글 및 한자(癸丙戊庚巳戌子戌) 모두 지원
 */
export function parseManseryeokCode(
  input: string,
  order: PillarOrderMode = 'hour-first'
): ParseCodeResult {
  const cleaned = input.trim().replace(/[()[\],·|]/g, ' ').replace(/\s+/g, ' ');
  if (!cleaned) {
    return { ok: false, error: '만세력 여덟 글자를 입력해 주세요. 예: 계병무경사술자술' };
  }

  let pairList: ({ stemIdx: number; branchIdx: number } | null)[] = [];

  if (cleaned.includes('/')) {
    const parts = cleaned.split('/').map((p) => p.replace(/\s+/g, ''));
    if (parts.length !== 2) {
      return {
        ok: false,
        error: '슬래시(/)는 천간과 지지를 한 번만 구분하거나 생략해 주세요. 예: 계병무경사술자술',
      };
    }

    const stemChars = Array.from(parts[0]);
    const branchChars = Array.from(parts[1]);

    if (stemChars.length !== branchChars.length) {
      return {
        ok: false,
        error: `천간(${stemChars.length}자)과 지지(${branchChars.length}자)의 글자 수가 다릅니다.`,
      };
    }

    if (stemChars.length !== 3 && stemChars.length !== 4) {
      return {
        ok: false,
        error: '천간·지지는 각 4글자(총 8자) 또는 생시 미상 3글자(총 6자)로 입력해 주세요.',
      };
    }

    for (let i = 0; i < stemChars.length; i++) {
      const sc = stemChars[i];
      const bc = branchChars[i];
      if (UNKNOWN_TOKENS.has(sc) && UNKNOWN_TOKENS.has(bc)) {
        pairList.push(null);
        continue;
      }
      const sIdx = STEM_CHAR_MAP.get(sc);
      const bIdx = BRANCH_CHAR_MAP.get(bc);
      if (sIdx === undefined) {
        return {
          ok: false,
          error: `천간에 인식할 수 없는 글자 '${sc}'가 있습니다. (갑을병정무기경신임계 중 입력)`,
        };
      }
      if (bIdx === undefined) {
        return {
          ok: false,
          error: `지지에 인식할 수 없는 글자 '${bc}'가 있습니다. (자축인묘진사오미신유술해 중 입력)`,
        };
      }
      pairList.push({ stemIdx: sIdx, branchIdx: bIdx });
    }
  } else {
    const compact = cleaned.replace(/\s+/g, '');
    const chars = Array.from(compact);
    if (chars.length !== 6 && chars.length !== 8) {
      return {
        ok: false,
        error:
          '천간 4자+지지 4자 이어쓰기 8자(예: 계병무경사술자술) 또는 생시 미상 6자(예: 병무경술자술)로 입력해 주세요.',
      };
    }

    const half = chars.length / 2;
    const firstHalf = chars.slice(0, half);
    const secondHalf = chars.slice(half);

    const isStemsThenBranches =
      firstHalf.every(
        (c, i) =>
          STEM_CHAR_MAP.has(c) || (UNKNOWN_TOKENS.has(c) && UNKNOWN_TOKENS.has(secondHalf[i]))
      ) &&
      secondHalf.every(
        (c, i) =>
          BRANCH_CHAR_MAP.has(c) || (UNKNOWN_TOKENS.has(c) && UNKNOWN_TOKENS.has(firstHalf[i]))
      );

    let isAlternatingPairs = true;
    for (let i = 0; i < chars.length; i += 2) {
      const sc = chars[i];
      const bc = chars[i + 1];
      const bothUnknown = UNKNOWN_TOKENS.has(sc) && UNKNOWN_TOKENS.has(bc);
      if (!bothUnknown && (!STEM_CHAR_MAP.has(sc) || !BRANCH_CHAR_MAP.has(bc))) {
        isAlternatingPairs = false;
        break;
      }
    }

    if (isStemsThenBranches) {
      for (let i = 0; i < half; i++) {
        const sc = firstHalf[i];
        const bc = secondHalf[i];
        if (UNKNOWN_TOKENS.has(sc) && UNKNOWN_TOKENS.has(bc)) {
          pairList.push(null);
        } else {
          pairList.push({
            stemIdx: STEM_CHAR_MAP.get(sc)!,
            branchIdx: BRANCH_CHAR_MAP.get(bc)!,
          });
        }
      }
    } else if (isAlternatingPairs) {
      for (let i = 0; i < chars.length; i += 2) {
        const sc = chars[i];
        const bc = chars[i + 1];
        if (UNKNOWN_TOKENS.has(sc) && UNKNOWN_TOKENS.has(bc)) {
          pairList.push(null);
        } else {
          pairList.push({
            stemIdx: STEM_CHAR_MAP.get(sc)!,
            branchIdx: BRANCH_CHAR_MAP.get(bc)!,
          });
        }
      }
    } else {
      // Pinpoint exact invalid character assuming primary 천간(앞)+지지(뒤) format
      for (let i = 0; i < half; i++) {
        if (!STEM_CHAR_MAP.has(firstHalf[i]) && !UNKNOWN_TOKENS.has(firstHalf[i])) {
          return {
            ok: false,
            error: `앞쪽 천간 자리에 인식할 수 없는 글자 '${firstHalf[i]}'가 있습니다. (갑을병정무기경신임계 중 입력)`,
          };
        }
      }
      for (let i = 0; i < half; i++) {
        if (!BRANCH_CHAR_MAP.has(secondHalf[i]) && !UNKNOWN_TOKENS.has(secondHalf[i])) {
          return {
            ok: false,
            error: `뒤쪽 지지 자리에 인식할 수 없는 글자 '${secondHalf[i]}'가 있습니다. (자축인묘진사오미신유술해 중 입력)`,
          };
        }
      }
      return {
        ok: false,
        error: '만세력 형식을 인식할 수 없습니다. 예: 계병무경사술자술 (천간 4자 + 지지 4자)',
      };
    }
  }

  let hour: { stemIdx: number; branchIdx: number } | null = null;
  let day: { stemIdx: number; branchIdx: number } | null = null;
  let month: { stemIdx: number; branchIdx: number } | null = null;
  let year: { stemIdx: number; branchIdx: number } | null = null;

  if (pairList.length === 4) {
    if (order === 'hour-first') {
      [hour, day, month, year] = pairList;
    } else {
      [year, month, day, hour] = pairList;
    }
  } else {
    // 3 pillars (unknown birth hour)
    if (order === 'hour-first') {
      [day, month, year] = pairList;
    } else {
      [year, month, day] = pairList;
    }
  }

  if (!day || !month || !year) {
    return {
      ok: false,
      error: '일주·월주·연주 세 기둥은 비워둘 수 없습니다. 생시만 ?로 비우거나 3글자로 입력해 주세요.',
    };
  }

  const checks: [ { stemIdx: number; branchIdx: number } | null, string ][] = [
    [hour, '시주'],
    [day, '일주'],
    [month, '월주'],
    [year, '연주'],
  ];

  for (const [pair, label] of checks) {
    if (!pair) continue;
    const err = validateGanjiPair(pair.stemIdx, pair.branchIdx, label);
    if (err) {
      return { ok: false, error: err };
    }
  }

  const stemStr = [
    ...(hour ? [STEMS[hour.stemIdx].hangul] : []),
    STEMS[day.stemIdx].hangul,
    STEMS[month.stemIdx].hangul,
    STEMS[year.stemIdx].hangul,
  ].join('');
  const branchStr = [
    ...(hour ? [BRANCHES[hour.branchIdx].hangul] : []),
    BRANCHES[day.branchIdx].hangul,
    BRANCHES[month.branchIdx].hangul,
    BRANCHES[year.branchIdx].hangul,
  ].join('');

  return {
    ok: true,
    raw: { hour, day, month, year },
    normalizedCode: `${stemStr}${branchStr}`,
  };
}

export function buildRelationMemberFromRaw(
  id: string,
  name: string,
  raw: ParsedPillarRaw,
  source: RelationMember['source'],
  isSample = false
): RelationMember {
  const dayMaster = STEMS[raw.day.stemIdx];
  const hourPillar = raw.hour
    ? buildSinglePillar('hour', '시주', raw.hour.stemIdx, raw.hour.branchIdx, dayMaster)
    : null;
  const dayPillar = buildSinglePillar('day', '일주', raw.day.stemIdx, raw.day.branchIdx, dayMaster);
  const monthPillar = buildSinglePillar(
    'month',
    '월주',
    raw.month.stemIdx,
    raw.month.branchIdx,
    dayMaster
  );
  const yearPillar = buildSinglePillar(
    'year',
    '연주',
    raw.year.stemIdx,
    raw.year.branchIdx,
    dayMaster
  );

  const activePillars = [yearPillar, monthPillar, dayPillar, ...(hourPillar ? [hourPillar] : [])];

  // Weighted Five Elements (identical weighting to manseryeok.ts)
  const rawCounts: Record<ElementType, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const weighted: Record<ElementType, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  for (const p of activePillars) {
    rawCounts[p.stem.element] += 1;
    rawCounts[p.branch.element] += 1;

    const stemWeight = p.position === 'day' ? 1.15 : 1.0;
    const branchWeight = p.position === 'month' ? 2.1 : p.position === 'day' ? 1.35 : 1.1;

    weighted[p.stem.element] += stemWeight;
    weighted[p.branch.element] += branchWeight;

    p.hiddenStems.forEach((hs) => {
      if (hs.role === '여기') weighted[hs.stem.element] += 0.15;
      if (hs.role === '중기') weighted[hs.stem.element] += 0.25;
    });
  }

  const totalWeight = ELEMENT_ORDER.reduce((sum, el) => sum + weighted[el], 0) || 1;
  const elementBalance: ElementBalanceItem[] = ELEMENT_ORDER.map((el) => {
    const pct = Math.round((weighted[el] / totalWeight) * 100);
    let status: ElementBalanceItem['status'] = '적정';
    if (rawCounts[el] === 0 && pct < 8) status = '결핍';
    else if (pct < 12) status = '부족';
    else if (pct >= 34) status = '과다';
    else if (pct >= 24) status = '발달';

    return {
      element: el,
      hangul: ELEMENT_META[el].hangul,
      hanja: ELEMENT_META[el].hanja,
      rawCount: rawCounts[el],
      weightedScore: Number(weighted[el].toFixed(2)),
      percentage: pct,
      status,
    };
  });

  const sortedByScore = [...elementBalance].sort((a, b) => b.weightedScore - a.weightedScore);
  const dominantElement = sortedByScore[0].element;
  const weakestElement = sortedByScore[sortedByScore.length - 1].element;

  // Strength & Yongsin (consistent with manseryeok.ts)
  const groupWeights: Record<TenGodGroup, number> = {
    비겁: 0,
    식상: 0,
    재성: 0,
    관성: 0,
    인성: 0,
  };
  for (const p of activePillars) {
    if (p.position !== 'day') {
      groupWeights[getTenGodGroup(p.stemTenGod)] += 1.0;
    }
    const bw = p.position === 'month' ? 2.0 : p.position === 'day' ? 1.3 : 1.0;
    groupWeights[getTenGodGroup(p.branchTenGod)] += bw;
  }
  const totalTG = Object.values(groupWeights).reduce((a, b) => a + b, 0) || 1;
  const supportRatio = (groupWeights['비겁'] + groupWeights['인성']) / totalTG;
  const strengthScore = Math.min(95, Math.max(8, Math.round(supportRatio * 100)));

  let strengthGrade: StrengthGrade = '중화';
  if (strengthScore >= 72) strengthGrade = '극왕';
  else if (strengthScore >= 56) strengthGrade = '신강';
  else if (strengthScore >= 43) strengthGrade = '중화';
  else if (strengthScore >= 28) strengthGrade = '신약';
  else strengthGrade = '극약';

  const drainCandidates: ElementType[] = [
    generates(dayMaster.element),
    controls(dayMaster.element),
    controlledBy(dayMaster.element),
  ];
  const boostCandidates: ElementType[] = [generatedBy(dayMaster.element), dayMaster.element];

  let yongsinPrimary: ElementType;
  let yongsinSecondary: ElementType;

  if (strengthGrade === '신강' || strengthGrade === '극왕') {
    const sorted = [...drainCandidates].sort((a, b) => weighted[a] - weighted[b]);
    yongsinPrimary = sorted[0];
    yongsinSecondary = sorted[1];
  } else if (strengthGrade === '신약' || strengthGrade === '극약') {
    const sorted = [...boostCandidates].sort((a, b) => weighted[a] - weighted[b]);
    yongsinPrimary = sorted[0];
    yongsinSecondary = sorted[1];
  } else {
    const sortedAll = [...ELEMENT_ORDER].sort((a, b) => weighted[a] - weighted[b]);
    yongsinPrimary = sortedAll[0];
    yongsinSecondary = sortedAll[1];
  }

  const stemStr = [
    ...(hourPillar ? [hourPillar.stem.hangul] : []),
    dayPillar.stem.hangul,
    monthPillar.stem.hangul,
    yearPillar.stem.hangul,
  ].join('');
  const branchStr = [
    ...(hourPillar ? [hourPillar.branch.hangul] : []),
    dayPillar.branch.hangul,
    monthPillar.branch.hangul,
    yearPillar.branch.hangul,
  ].join('');

  const dayProfile = DAY_PILLAR_PROFILES[dayPillar.ganjiHangul];

  return {
    id,
    name: name.trim() || '무명',
    source,
    isSample,
    shorthand: `${stemStr}${branchStr}`,
    pillars: {
      hour: hourPillar,
      day: dayPillar,
      month: monthPillar,
      year: yearPillar,
    },
    dayMaster,
    dayPillarCode: dayPillar.ganjiHangul,
    dayPillarTitle: dayProfile ? dayProfile.symbol : dayMaster.natureTitle,
    elementBalance,
    dominantElement,
    weakestElement,
    strengthGrade,
    strengthScore,
    yongsinPrimary,
    yongsinSecondary,
  };
}

export function createMemberFromCode(
  id: string,
  name: string,
  code: string,
  order: PillarOrderMode = 'hour-first'
): { ok: true; member: RelationMember } | { ok: false; error: string } {
  const parsed = parseManseryeokCode(code, order);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  return {
    ok: true,
    member: buildRelationMemberFromRaw(id, name, parsed.raw, 'manual'),
  };
}

export function createMemberFromSajuChart(chart: SajuChart, id = 'my-report-self'): RelationMember {
  const raw: ParsedPillarRaw = {
    hour: chart.pillars.hour
      ? { stemIdx: chart.pillars.hour.stem.index, branchIdx: chart.pillars.hour.branch.index }
      : null,
    day: { stemIdx: chart.pillars.day.stem.index, branchIdx: chart.pillars.day.branch.index },
    month: { stemIdx: chart.pillars.month.stem.index, branchIdx: chart.pillars.month.branch.index },
    year: { stemIdx: chart.pillars.year.stem.index, branchIdx: chart.pillars.year.branch.index },
  };
  const displayName = chart.input.name.trim() ? `${chart.input.name.trim()} (나)` : '나 (내 리포트)';
  return buildRelationMemberFromRaw(id, displayName, raw, 'my-report');
}

export function createMemberFromBirthInput(
  id: string,
  input: BirthInput
): { ok: true; member: RelationMember } | { ok: false; error: string } {
  try {
    const chart = calculateSajuChart(input);
    const raw: ParsedPillarRaw = {
      hour: chart.pillars.hour
        ? { stemIdx: chart.pillars.hour.stem.index, branchIdx: chart.pillars.hour.branch.index }
        : null,
      day: { stemIdx: chart.pillars.day.stem.index, branchIdx: chart.pillars.day.branch.index },
      month: { stemIdx: chart.pillars.month.stem.index, branchIdx: chart.pillars.month.branch.index },
      year: { stemIdx: chart.pillars.year.stem.index, branchIdx: chart.pillars.year.branch.index },
    };
    return {
      ok: true,
      member: buildRelationMemberFromRaw(id, input.name.trim() || '친구', raw, 'birth'),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : '생년월일을 계산할 수 없습니다.',
    };
  }
}

/**
 * 일괄 텍스트 파싱:
 * 김봄 계병무경사술자술
 * 이여름 신을계임사유묘신
 * 박가을 정무병기사오자묘
 * 최겨울 을정경정사축술해
 */
export function parseBatchMembersText(
  text: string,
  order: PillarOrderMode = 'hour-first'
): { members: RelationMember[]; errors: string[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const members: RelationMember[] = [];
  const errors: string[] = [];

  lines.forEach((line, idx) => {
    // Allow formats:
    // "김봄 계병무경사술자술", "김봄 계병무경/사술자술", "김봄: 계병무경사술자술",
    // "김봄 계사 병술 무자 경술", or just "계병무경사술자술"
    let name = `인물 ${String.fromCharCode(65 + (idx % 26))}`;
    let codePart = line;

    const colonMatch = line.match(/^([^:：-]+)\s*[:：-]\s*(.+)$/);
    if (colonMatch) {
      name = colonMatch[1].trim();
      codePart = colonMatch[2].trim();
    } else if (line.includes('/')) {
      const slashIdx = line.indexOf('/');
      const beforeSlash = line.slice(0, slashIdx).trim();
      const afterSlash = line.slice(slashIdx + 1).trim();
      const tokens = beforeSlash.split(/\s+/);
      if (tokens.length >= 2) {
        const stemToken = tokens[tokens.length - 1];
        name = tokens.slice(0, -1).join(' ').trim();
        codePart = `${stemToken}/${afterSlash}`;
      }
    } else {
      const tokens = line.split(/\s+/);
      if (tokens.length >= 2) {
        const lastTokenChars = Array.from(tokens[tokens.length - 1]);
        if (lastTokenChars.length === 8 || lastTokenChars.length === 6) {
          // Format: "김봄 계병무경사술자술" or "김봄 병무경술자술"
          name = tokens.slice(0, -1).join(' ').trim();
          codePart = tokens[tokens.length - 1];
        } else if (tokens.length === 5 || tokens.length === 4) {
          // Format: "김봄 계사 병술 무자 경술" or "계사 병술 무자 경술"
          const firstIsPillar =
            tokens[0].length === 2 &&
            STEM_CHAR_MAP.has(tokens[0][0]) &&
            BRANCH_CHAR_MAP.has(tokens[0][1]);
          if (!firstIsPillar) {
            name = tokens[0];
            codePart = tokens.slice(1).join(' ');
          }
        }
      }
    }

    const res = createMemberFromCode(`batch-${Date.now()}-${idx}`, name, codePart, order);
    if (res.ok) {
      members.push(res.member);
    } else {
      errors.push(`${idx + 1}번째 줄 (${name}): ${res.error}`);
    }
  });

  return { members, errors };
}

// ---------- Pairwise Saju Rules ----------

const STEM_COMBINES: [number, number, string, ElementType][] = [
  [0, 5, '갑기합(甲己合 · 토화)', 'earth'],
  [1, 6, '을경합(乙庚合 · 금화)', 'metal'],
  [2, 7, '병신합(丙辛合 · 수화)', 'water'],
  [3, 8, '정임합(丁壬合 · 목화)', 'wood'],
  [4, 9, '무계합(戊癸合 · 화화)', 'fire'],
];

const STEM_CLASHES: [number, number, string][] = [
  [0, 6, '갑경충(甲庚沖)'],
  [1, 7, '을신충(乙辛沖)'],
  [2, 8, '병임충(丙壬沖)'],
  [3, 9, '정계충(丁癸沖)'],
];

const BRANCH_YUKHAP: [number, number, string][] = [
  [0, 1, '자축합(子丑合)'],
  [2, 11, '인해합(寅亥合)'],
  [3, 10, '묘술합(卯戌合)'],
  [4, 9, '진유합(辰酉合)'],
  [5, 8, '사신합(巳申合)'],
  [6, 7, '오미합(午未合)'],
];

const BRANCH_CHUNG: [number, number, string][] = [
  [0, 6, '자오충(子午沖)'],
  [1, 7, '축미충(丑未沖)'],
  [2, 8, '인신충(寅申沖)'],
  [3, 9, '묘유충(卯酉沖)'],
  [4, 10, '진술충(辰戌沖)'],
  [5, 11, '사해충(巳亥沖)'],
];

const BRANCH_WONJIN: [number, number, string][] = [
  [0, 7, '자미 원진(子未怨嗔)'],
  [1, 6, '축오 원진(丑午怨嗔)'],
  [2, 9, '인유 원진(寅酉怨嗔)'],
  [3, 8, '묘신 원진(卯申怨嗔)'],
  [4, 11, '진해 원진(辰亥怨嗔)'],
  [5, 10, '사술 원진(巳戌怨嗔)'],
];

const SAMHAP_TRIOS: { trio: [number, number, number]; name: string; element: ElementType }[] = [
  { trio: [2, 6, 10], name: '인오술(寅午戌) 화국', element: 'fire' },
  { trio: [5, 9, 1], name: '사유축(巳酉丑) 금국', element: 'metal' },
  { trio: [8, 0, 4], name: '신자진(申子辰) 수국', element: 'water' },
  { trio: [11, 3, 7], name: '해묘미(亥卯未) 목국', element: 'wood' },
];

const BANGHAP_TRIOS: { trio: [number, number, number]; name: string; element: ElementType }[] = [
  { trio: [2, 3, 4], name: '인묘진(寅卯辰) 동방 목국', element: 'wood' },
  { trio: [5, 6, 7], name: '사오미(巳午未) 남방 화국', element: 'fire' },
  { trio: [8, 9, 10], name: '신유술(申酉戌) 서방 금국', element: 'metal' },
  { trio: [11, 0, 1], name: '해자축(亥子丑) 북방 수국', element: 'water' },
];

const CHEONEUL_MAP: Record<number, number[]> = {
  0: [1, 7],
  4: [1, 7],
  6: [1, 7],
  1: [0, 8],
  5: [0, 8],
  2: [11, 9],
  3: [11, 9],
  7: [2, 6],
  8: [3, 5],
  9: [3, 5],
};

function matchPair(idx1: number, idx2: number, a: number, b: number): boolean {
  return (idx1 === a && idx2 === b) || (idx1 === b && idx2 === a);
}

function describeDirectionalRole(
  fromName: string,
  toName: string,
  tenGod: TenGod
): { roleLabel: string; description: string } {
  switch (tenGod) {
    case '비견':
      return {
        roleLabel: '결이 닮은 동지',
        description: `${fromName}님 입장에서 ${toName}님은 눈높이가 비슷하고 편하게 속내를 나눌 수 있는 동료 같은 존재입니다. 다만 고집이 겹치면 양보가 늦어질 수 있습니다.`,
      };
    case '겁재':
      return {
        roleLabel: '자극을 주는 라이벌·단짝',
        description: `${fromName}님 입장에서 ${toName}님은 같이 있으면 승부욕과 에너지가 살아나는 짝꿍입니다. 같은 목표를 잡으면 폭발력이 크지만 영역 구분이 분명해야 오래 갑니다.`,
      };
    case '식신':
      return {
        roleLabel: '자연스레 챙겨주고 싶은 사람',
        description: `${fromName}님이 ${toName}님에게 마음을 편히 열고 먼저 배려하게 되는 온화한 흐름입니다. 함께 취미나 식사를 나누며 정이 깊어집니다.`,
      };
    case '상관':
      return {
        roleLabel: '말과 영감이 트이는 상대',
        description: `${fromName}님이 ${toName}님 앞에서 솔직한 생각과 재치가 거침없이 쏟아집니다. 대화가 재밌지만 직설이 지나치지 않게 완급만 조절하면 최상의 티키타카가 됩니다.`,
      };
    case '편재':
      return {
        roleLabel: '판과 재미를 넓혀주는 파트너',
        description: `${fromName}님이 ${toName}님과 함께할 때 새로운 시도나 활동 반경이 넓어집니다. 결과와 현실 감각을 맞춰 가며 프로젝트를 꾸리기에 좋습니다.`,
      };
    case '정재':
      return {
        roleLabel: '신뢰하고 안정감을 느끼는 상대',
        description: `${fromName}님이 ${toName}님에게 현실적인 믿음과 책임감을 느끼며 꾸준히 챙기려 합니다. 약속과 실리를 지키며 오래 가는 관계로 자랍니다.`,
      };
    case '편관':
      return {
        roleLabel: '긴장감과 성장을 주는 존재',
        description: `${fromName}님 입장에서 ${toName}님은 카리스마가 느껴지거나 나를 긴장하게 만드는 존재입니다. 적절히 존중하면 큰 성장을 돕지만, 지나친 간섭은 피로로 번질 수 있습니다.`,
      };
    case '정관':
      return {
        roleLabel: '기준을 세워주는 든든한 조력자',
        description: `${fromName}님이 ${toName}님의 단정한 태도와 판단력에 신뢰를 느낍니다. 흔들릴 때 중심을 잡아주는 고마운 기준점 역할을 해줍니다.`,
      };
    case '편인':
      return {
        roleLabel: '독특한 시선과 통찰을 주는 사람',
        description: `${fromName}님이 ${toName}님의 색다른 관점에서 영감을 받습니다. 서로의 개인 시간을 존중할 때 깊은 지적인 교감이 이루어집니다.`,
      };
    case '정인':
      return {
        roleLabel: '마음을 기대고 위로받는 안식처',
        description: `${fromName}님이 ${toName}님 곁에서 정서적인 지지와 편안함을 얻습니다. 조언을 구하거나 지칠 때 먼저 떠올리게 되는 따뜻한 존재입니다.`,
      };
    default:
      return {
        roleLabel: '동등한 동반자',
        description: `서로 비슷한 결을 공유하는 담백한 관계입니다.`,
      };
  }
}

export function getPairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}__${idB}` : `${idB}__${idA}`;
}

export function analyzePairCompatibility(a: RelationMember, b: RelationMember): PairCompatibility {
  const signals: PairSignal[] = [];
  const harmonyPoints: string[] = [];
  const cautionPoints: string[] = [];

  let score = 62; // Neutral baseline

  // 1. Bidirectional Day Master Ten God
  const aSeesB = getTenGod(a.dayMaster, b.dayMaster);
  const bSeesA = getTenGod(b.dayMaster, a.dayMaster);
  const aToBGroup = getTenGodGroup(aSeesB);
  const bToAGroup = getTenGodGroup(bSeesA);
  const aToBDesc = describeDirectionalRole(a.name, b.name, aSeesB);
  const bToADesc = describeDirectionalRole(b.name, a.name, bSeesA);

  // Day Master elemental relation (상생 +6, 비화 +3, 상극 -2)
  if (generates(a.dayMaster.element) === b.dayMaster.element || generates(b.dayMaster.element) === a.dayMaster.element) {
    score += 6;
    const giver = generates(a.dayMaster.element) === b.dayMaster.element ? a : b;
    const receiver = giver === a ? b : a;
    harmonyPoints.push(
      `${giver.name}(${ELEMENT_META[giver.dayMaster.element].hangul})이 ${receiver.name}(${ELEMENT_META[receiver.dayMaster.element].hangul})을 자연스럽게 생(生)해 주어 에너지가 매끄럽게 흐릅니다.`
    );
  } else if (a.dayMaster.element === b.dayMaster.element) {
    score += 3;
    harmonyPoints.push(
      `두 사람 모두 ${ELEMENT_META[a.dayMaster.element].hangul}(${ELEMENT_META[a.dayMaster.element].hanja}) 일간이라 가치관과 대화 템포가 빠르게 통합니다.`
    );
  } else {
    score -= 2;
    cautionPoints.push(
      `일간 오행이 상극 구도라 서로 다른 관점으로 자극을 줍니다. '틀림'이 아니라 '역할 분담'으로 받아들이면 오히려 균형이 잡힙니다.`
    );
  }

  // 2. Day Master 천간합 / 천간충
  for (const [s1, s2, label] of STEM_COMBINES) {
    if (matchPair(a.dayMaster.index, b.dayMaster.index, s1, s2)) {
      score += 14;
      signals.push({
        id: `dm-combine-${s1}-${s2}`,
        category: '천간',
        polarity: 'harmony',
        label: `일간 ${label}`,
        detail: `${a.dayMaster.hangul}(${a.dayMaster.hanja})과 ${b.dayMaster.hangul}(${b.dayMaster.hanja})이 천간합을 이루어 처음 만나도 자연스럽게 끌리고 호흡이 잘 붙습니다.`,
      });
      harmonyPoints.push(`두 일간이 ${label}을 이루어 서로에게 강한 인연감과 결속력이 생깁니다.`);
    }
  }
  for (const [s1, s2, label] of STEM_CLASHES) {
    if (matchPair(a.dayMaster.index, b.dayMaster.index, s1, s2)) {
      score -= 6;
      signals.push({
        id: `dm-clash-${s1}-${s2}`,
        category: '천간',
        polarity: 'tension',
        label: `일간 ${label}`,
        detail: `표현 방식과 의사결정 속도가 정반대라 의견 충돌이 선명하게 드러납니다. 대신 서로의 맹점을 정확히 짚어 주는 장점이 있습니다.`,
      });
      cautionPoints.push(`일간 ${label}이 있어 직설적인 의견 충돌이 잦을 수 있으니 결론을 서두르지 않는 편이 좋습니다.`);
    }
  }

  // 3. Day Branch (일지 — 속마음·생활 궁합)
  const dayBrA = a.pillars.day.branch.index;
  const dayBrB = b.pillars.day.branch.index;

  if (dayBrA === dayBrB) {
    score += 4;
    signals.push({
      id: `daybr-same-${dayBrA}`,
      category: '일지',
      polarity: 'harmony',
      label: `일지 동지(${BRANCHES[dayBrA].hangul}${BRANCHES[dayBrA].hanja})`,
      detail: `일상 리듬과 휴식 방식이 비슷해 함께 있어도 불필요한 에너지 소모가 적습니다.`,
    });
    harmonyPoints.push(`속마음 자리(일지)가 같은 '${BRANCHES[dayBrA].hangul}'이라 생활 감각과 편안함의 기준이 닮아 있습니다.`);
  }

  for (const [b1, b2, label] of BRANCH_YUKHAP) {
    if (matchPair(dayBrA, dayBrB, b1, b2)) {
      score += 13;
      signals.push({
        id: `daybr-yukhap-${b1}-${b2}`,
        category: '일지',
        polarity: 'harmony',
        label: `일지 ${label}`,
        detail: `속마음과 일상 궁합을 보는 일지가 육합으로 묶여, 함께 시간을 보낼수록 정서적 안정감과 애착이 커집니다.`,
      });
      harmonyPoints.push(`일지 ${label}이 성립해 말하지 않아도 통하는 편안한 정서적 밀착감이 뛰어납니다.`);
    }
  }

  for (const s of SAMHAP_TRIOS) {
    if (dayBrA !== dayBrB && s.trio.includes(dayBrA) && s.trio.includes(dayBrB)) {
      score += 9;
      signals.push({
        id: `daybr-samhap-${s.name}`,
        category: '일지',
        polarity: 'harmony',
        label: `일지 ${s.name} 합`,
        detail: `두 사람의 일지가 같은 삼합 국을 공유해 공통의 목표나 취향을 함께 추진할 때 시너지가 큽니다.`,
      });
      harmonyPoints.push(`일지가 ${s.name}의 같은 방향을 바라보아 함께 움직일 때 추진력이 배가됩니다.`);
    }
  }

  for (const bng of BANGHAP_TRIOS) {
    if (dayBrA !== dayBrB && bng.trio.includes(dayBrA) && bng.trio.includes(dayBrB)) {
      score += 6;
      signals.push({
        id: `daybr-banghap-${bng.name}`,
        category: '일지',
        polarity: 'harmony',
        label: `일지 ${bng.name} 방합`,
        detail: `같은 계절의 기운을 공유해 오래 알던 가족이나 동네 친구처럼 자연스러운 유대감이 생깁니다.`,
      });
    }
  }

  for (const [b1, b2, label] of BRANCH_CHUNG) {
    if (matchPair(dayBrA, dayBrB, b1, b2)) {
      score -= 10;
      signals.push({
        id: `daybr-chung-${b1}-${b2}`,
        category: '일지',
        polarity: 'tension',
        label: `일지 ${label}`,
        detail: `생활 습관이나 감정 해소 방식이 정반대여서 사소한 타이밍 차이로 부딪히기 쉽습니다. 적절한 거리감과 사전 합의가 핵심입니다.`,
      });
      cautionPoints.push(`일지 ${label}이 작동하므로 '당연히 알겠지'보다 생활 규칙과 일정을 말로 분명히 맞추는 게 좋습니다.`);
    }
  }

  for (const [b1, b2, label] of BRANCH_WONJIN) {
    if (matchPair(dayBrA, dayBrB, b1, b2)) {
      score -= 7;
      signals.push({
        id: `daybr-wonjin-${b1}-${b2}`,
        category: '일지',
        polarity: 'tension',
        label: `일지 ${label}`,
        detail: `가까울수록 작은 말투나 습관이 유독 신경 쓰이는 애증의 코드가 있습니다. 붙어 있기보다 각자의 숨 쉴 공간을 확보하면 오히려 애틋해집니다.`,
      });
      cautionPoints.push(`일지 ${label}이 있어 가까워질수록 서운함이 쌓이기 쉽습니다. 감정이 올라올 땐 한 박자 쉬고 대화하세요.`);
    }
  }

  // 4. Month Branch (월지 — 사회적 결·업무 호흡)
  const monBrA = a.pillars.month.branch.index;
  const monBrB = b.pillars.month.branch.index;
  for (const [b1, b2, label] of BRANCH_YUKHAP) {
    if (matchPair(monBrA, monBrB, b1, b2)) {
      score += 5;
      signals.push({
        id: `monbr-yukhap-${b1}-${b2}`,
        category: '지지',
        polarity: 'harmony',
        label: `월지 ${label}`,
        detail: `사회적 환경과 일하는 방식(월지)이 합을 이루어 협업·프로젝트 파트너로서 궁합이 좋습니다.`,
      });
    }
  }
  for (const [b1, b2, label] of BRANCH_CHUNG) {
    if (matchPair(monBrA, monBrB, b1, b2)) {
      score -= 4;
      signals.push({
        id: `monbr-chung-${b1}-${b2}`,
        category: '지지',
        polarity: 'tension',
        label: `월지 ${label}`,
        detail: `사회적 리듬이나 일 처리 순서가 달라 협업 시에는 역할 경계를 명확히 나누는 편이 안전합니다.`,
      });
    }
  }

  // 5. Cross-Chart 천을귀인 (Nobleman Star)
  const bBranches = [b.pillars.year.branch.index, b.pillars.month.branch.index, b.pillars.day.branch.index, ...(b.pillars.hour ? [b.pillars.hour.branch.index] : [])];
  const aBranches = [a.pillars.year.branch.index, a.pillars.month.branch.index, a.pillars.day.branch.index, ...(a.pillars.hour ? [a.pillars.hour.branch.index] : [])];

  const bIsNobleForA = bBranches.some((idx) => CHEONEUL_MAP[a.dayMaster.index].includes(idx));
  const aIsNobleForB = aBranches.some((idx) => CHEONEUL_MAP[b.dayMaster.index].includes(idx));

  if (bIsNobleForA && aIsNobleForB) {
    score += 9;
    signals.push({
      id: 'noble-both',
      category: '귀인',
      polarity: 'harmony',
      label: '쌍방 천을귀인(天乙貴人)',
      detail: `두 사람 모두 상대의 원국에 천을귀인 글자를 품고 있어, 결정적인 순간에 서로의 막힌 길을 열어 주는 귀한 인연입니다.`,
    });
    harmonyPoints.push(`서로가 서로의 천을귀인을 지니고 있어 어려울 때 든든한 구원투수가 되어 줍니다.`);
  } else if (bIsNobleForA || aIsNobleForB) {
    score += 5;
    const helper = bIsNobleForA ? b : a;
    const beneficiary = bIsNobleForA ? a : b;
    signals.push({
      id: 'noble-one',
      category: '귀인',
      polarity: 'harmony',
      label: `${beneficiary.name}에게 ${helper.name}님은 천을귀인`,
      detail: `${helper.name}님의 원국에 ${beneficiary.name}님의 천을귀인 지지가 자리해, 실질적인 도움이나 좋은 소식을 가져다주는 인연입니다.`,
    });
  }

  // 6. Five-Element Yongsin Complementarity
  const bElementPct = (el: ElementType) =>
    b.elementBalance.find((item) => item.element === el)?.percentage ?? 0;
  const aElementPct = (el: ElementType) =>
    a.elementBalance.find((item) => item.element === el)?.percentage ?? 0;

  const bHelpsA = bElementPct(a.yongsinPrimary) >= 22 || bElementPct(a.yongsinSecondary) >= 26;
  const aHelpsB = aElementPct(b.yongsinPrimary) >= 22 || aElementPct(b.yongsinSecondary) >= 26;

  let elementComplementSummary = '';
  if (bHelpsA && aHelpsB) {
    score += 8;
    elementComplementSummary = `${b.name}님은 ${a.name}님에게 필요한 ${ELEMENT_META[a.yongsinPrimary].hangul}(${ELEMENT_META[a.yongsinPrimary].hanja}) 기운을, ${a.name}님은 ${b.name}님에게 필요한 ${ELEMENT_META[b.yongsinPrimary].hangul}(${ELEMENT_META[b.yongsinPrimary].hanja}) 기운을 서로 채워 주는 이상적인 상호 보완 구도입니다.`;
    signals.push({
      id: 'yongsin-both',
      category: '오행',
      polarity: 'harmony',
      label: '쌍방 용신 보완',
      detail: elementComplementSummary,
    });
    harmonyPoints.push(`서로에게 부족한 오행(용신)을 채워 주어 함께할수록 컨디션과 판단력이 안정됩니다.`);
  } else if (bHelpsA) {
    score += 4;
    elementComplementSummary = `${b.name}님이 가진 풍부한 ${ELEMENT_META[a.yongsinPrimary].hangul}(${ELEMENT_META[a.yongsinPrimary].hanja}) 기운이 ${a.name}님의 빈틈을 채워 줍니다. ${a.name}님이 ${b.name}님에게 먼저 고마움을 표현하면 균형이 오래 유지됩니다.`;
    signals.push({
      id: 'yongsin-b-to-a',
      category: '오행',
      polarity: 'harmony',
      label: `${a.name} 용신 보완`,
      detail: elementComplementSummary,
    });
  } else if (aHelpsB) {
    score += 4;
    elementComplementSummary = `${a.name}님의 강한 ${ELEMENT_META[b.yongsinPrimary].hangul}(${ELEMENT_META[b.yongsinPrimary].hanja}) 기운이 ${b.name}님에게 든든한 버팀목이 됩니다. ${b.name}님이 받기만 하지 않고 가볍게 화답할 때 관계가 더 단단해집니다.`;
    signals.push({
      id: 'yongsin-a-to-b',
      category: '오행',
      polarity: 'harmony',
      label: `${b.name} 용신 보완`,
      detail: elementComplementSummary,
    });
  } else if (a.dominantElement === b.dominantElement) {
    elementComplementSummary = `두 사람 모두 ${ELEMENT_META[a.dominantElement].hangul}(${ELEMENT_META[a.dominantElement].hanja}) 기운이 두드러진 동질 공명형입니다. 흥미와 관심사가 빨리 통하지만 같은 약점을 공유하므로 제3의 관점을 의식적으로 챙기면 좋습니다.`;
    signals.push({
      id: 'yongsin-same',
      category: '오행',
      polarity: 'neutral',
      label: `${ELEMENT_META[a.dominantElement].hangul} 기운 동질 공명`,
      detail: elementComplementSummary,
    });
  } else {
    elementComplementSummary = `각자 독립적인 오행 밸런스를 유지하는 담백한 구조입니다. 과도하게 얽히기보다 서로의 개성을 존중할 때 가장 편안한 거리가 유지됩니다.`;
  }

  // Clamp deterministic score
  score = Math.min(98, Math.max(38, Math.round(score)));

  let relationTier: PairCompatibility['relationTier'];
  let relationTitle: string;
  let shortKeyword: string;
  let mood: SeoldamMood;

  if (score >= 82) {
    relationTier = '천생 호흡';
    relationTitle = '결이 맞고 빈틈까지 채워 주는 단단한 인연';
    shortKeyword = '깊은 합 · 귀인';
    mood = 'warm';
  } else if (score >= 68) {
    relationTier = '상호 보완';
    relationTitle = '서로의 장점을 살리며 편안히 자라는 관계';
    shortKeyword = '안정 · 보완';
    mood = 'calm';
  } else if (score >= 55) {
    relationTier = '티키타카 자극';
    relationTitle = '다름이 매력이 되는 입체적 티키타카 구도';
    shortKeyword = '자극 · 개성';
    mood = 'keen';
  } else {
    relationTier = '조율 필요';
    relationTitle = '속도와 방식을 맞추는 약속이 필요한 관계';
    shortKeyword = '거리 조율';
    mood = 'keen';
  }

  if (harmonyPoints.length === 0) {
    harmonyPoints.push(
      `${a.name}(${a.dayPillarCode})과 ${b.name}(${b.dayPillarCode})은 서로 다른 기질을 지녀 각자의 영역에서 배울 점이 분명합니다.`
    );
  }
  if (cautionPoints.length === 0) {
    cautionPoints.push(
      `큰 충돌 기운은 적지만, 너무 편안해지면 서로의 수고를 당연하게 여기기 쉬우므로 가끔은 말로 고마움을 건네는 게 좋습니다.`
    );
  }

  // 2027 정미년 (丁火 / 未土) joint flow note
  const needsFireOrEarth = (m: RelationMember) =>
    m.yongsinPrimary === 'fire' ||
    m.yongsinPrimary === 'earth' ||
    m.yongsinSecondary === 'fire' ||
    m.yongsinSecondary === 'earth';

  let year2027JointNote = '';
  const aLikes2027 = needsFireOrEarth(a);
  const bLikes2027 = needsFireOrEarth(b);
  const aHasOx = aBranches.includes(1); // 축미충
  const bHasOx = bBranches.includes(1);

  if (aLikes2027 && bLikes2027) {
    year2027JointNote =
      '2027 정미년(丁未)의 따뜻한 화·토 기운이 두 사람 모두에게 보탬이 되는 해입니다. 함께 여행을 가거나 공동 계획을 세우기에 호흡이 가장 잘 맞습니다.';
  } else if (aHasOx || bHasOx) {
    year2027JointNote =
      '2027 정미년(丁未)은 두 사람 중 한쪽의 원국에 변동(축미충)을 일으킬 수 있어 바쁜 시기가 엇갈릴 수 있습니다. 연락 빈도보다 서로의 변화를 응원해 주는 여유가 빛납니다.';
  } else {
    year2027JointNote =
      '2027 정미년(丁未)은 차분하게 결실을 다지는 해입니다. 거창한 이벤트보다 소소하게 자주 안부를 묻고 약속을 지키는 리듬이 두 사람의 신뢰를 깊게 만듭니다.';
  }

  // Character Note — 저승차사 재(災) (calm, respectful polite voice)
  const seoldamQuote =
    score >= 82
      ? `${a.name}님과 ${b.name}님의 명부를 나란히 펼쳐 보니, 톱니바퀴가 억지 없이 딱 맞물려 있군요. 이런 인연은 흔치 않으니 바쁘시더라도 안부를 소홀히 하지 않으시길 바랍니다.`
      : score >= 68
        ? `두 분이 함께 계시면 한쪽의 모자란 기운을 다른 쪽이 은근히 채워 주는 구조입니다. 억지로 똑같아지려 하기보다 지금처럼 각자의 역할대로 두시는 편이 가장 오래 갑니다.`
        : score >= 55
          ? `성격의 결은 꽤 다르지만, 그래서 오히려 심심할 틈이 없는 조합이군요. 의견이 부딪힐 때 '왜 다를까' 대신 '저분은 저렇게 보시는구나' 한 번만 곱씹어 보세요.`
          : `솔직히 명식만 살펴보면 리듬이 다소 엇갈리는 편입니다. 그래도 알고 만나는 인연은 다르지요. 선을 넘지 않는 적당한 거리와 미리 정한 약속만 지키신다면 의외로 깔끔하게 오래 가실 수 있습니다.`;

  const seoldamTip =
    signals.some((s) => s.polarity === 'tension')
      ? `핵심 처방: 서운함이 쌓이기 전에 짧게 합의하시고, 함께한 시간 뒤에는 각자 충전할 여백을 확보해 보세요.`
      : `핵심 처방: 편안함에 기대어 고마움을 생략하지 마시고, 2027년에는 작은 공동 목표를 하나 세워 보시길 권합니다.`;

  return {
    pairKey: getPairKey(a.id, b.id),
    a,
    b,
    score,
    relationTier,
    relationTitle,
    shortKeyword,
    aToB: {
      tenGod: aSeesB,
      group: aToBGroup,
      roleLabel: aToBDesc.roleLabel,
      description: aToBDesc.description,
    },
    bToA: {
      tenGod: bSeesA,
      group: bToAGroup,
      roleLabel: bToADesc.roleLabel,
      description: bToADesc.description,
    },
    signals,
    harmonyPoints,
    cautionPoints,
    elementComplementSummary,
    year2027JointNote,
    seoldamNote: {
      mood,
      quote: seoldamQuote,
      tip: seoldamTip,
    },
  };
}

// ---------- Multi-Person Group Chemistry ----------

export function analyzeGroupChemistry(members: RelationMember[]): GroupChemistryReport {
  const pairs: PairCompatibility[] = [];
  const pairMap: Record<string, PairCompatibility> = {};

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const pair = analyzePairCompatibility(members[i], members[j]);
      pairs.push(pair);
      pairMap[pair.pairKey] = pair;
    }
  }

  // Collective Five-Element Balance
  const totalWeighted: Record<ElementType, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  const totalRaw: Record<ElementType, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  for (const m of members) {
    for (const item of m.elementBalance) {
      totalWeighted[item.element] += item.weightedScore;
      totalRaw[item.element] += item.rawCount;
    }
  }

  const grandTotal = ELEMENT_ORDER.reduce((sum, el) => sum + totalWeighted[el], 0) || 1;
  const collectiveElements: ElementBalanceItem[] = ELEMENT_ORDER.map((el) => {
    const pct = Math.round((totalWeighted[el] / grandTotal) * 100);
    let status: ElementBalanceItem['status'] = '적정';
    if (totalRaw[el] === 0 && pct < 8) status = '결핍';
    else if (pct < 13) status = '부족';
    else if (pct >= 30) status = '과다';
    else if (pct >= 24) status = '발달';

    return {
      element: el,
      hangul: ELEMENT_META[el].hangul,
      hanja: ELEMENT_META[el].hanja,
      rawCount: totalRaw[el],
      weightedScore: Number(totalWeighted[el].toFixed(2)),
      percentage: pct,
      status,
    };
  });

  const sortedEl = [...collectiveElements].sort((a, b) => b.weightedScore - a.weightedScore);
  const strongestGroupElement = sortedEl[0].element;
  const weakestGroupElement = sortedEl[sortedEl.length - 1].element;

  const GROUP_TEMP: Record<ElementType, { title: string; summary: string }> = {
    wood: {
      title: '아이디어와 성장이 끊이지 않는 기획·개척형 모임',
      summary: '모이면 새로운 계획과 배움 이야기가 자연스레 피어납니다. 시작은 빠르니 마무리를 챙길 일정을 정해 두면 실행력이 극대화됩니다.',
    },
    fire: {
      title: '에너지와 흥이 넘치는 열정·표현형 모임',
      summary: '분위기가 금세 달아오르고 솔직한 리액션이 오갑니다. 감정이 과열될 때 잠시 식혀 줄 차분한 휴식 포인트만 두면 오래 즐겁습니다.',
    },
    earth: {
      title: '믿음직하고 편안한 안식처·실속형 모임',
      summary: '자극적이지 않아도 오래 만나도 질리지 않는 묵직한 유대감이 강점입니다. 가끔은 익숙한 곳을 벗어나 새로운 활동으로 환기해 보세요.',
    },
    metal: {
      title: '선명한 기준과 깔끔한 의리를 지키는 정예 모임',
      summary: '약속과 선을 잘 지키고, 필요할 때 냉철한 조언을 아끼지 않습니다. 옳고 그름보다 가벼운 농담과 칭찬을 조금 더 보태면 온기가 살아납니다.',
    },
    water: {
      title: '깊은 대화와 통찰이 오가는 사유·감성형 모임',
      summary: '밤새 속 깊은 이야기를 나눠도 어색하지 않은 유연함과 공감력이 돋보입니다. 생각이 많아져 행동이 늦어질 때 가볍게 실행 버튼을 눌러 보세요.',
    },
  };

  // Best & Most Dynamic Pairs
  const sortedPairs = [...pairs].sort((a, b) => b.score - a.score);
  const bestPair = sortedPairs[0] ?? null;
  const tensionPair = sortedPairs.length >= 2 ? sortedPairs[sortedPairs.length - 1] : null;

  // Mediator (highest average harmony across all other members)
  let mediator: GroupChemistryReport['mediator'] = null;
  if (members.length >= 3) {
    let bestAvg = -1;
    let bestMember = members[0];
    for (const m of members) {
      const related = pairs.filter((p) => p.a.id === m.id || p.b.id === m.id);
      const avg = related.reduce((sum, p) => sum + p.score, 0) / (related.length || 1);
      if (avg > bestAvg) {
        bestAvg = avg;
        bestMember = m;
      }
    }
    mediator = {
      member: bestMember,
      avgScore: Math.round(bestAvg),
      reason: `모임 구성원 전체와 평균 조화도 ${Math.round(bestAvg)}점으로 가장 고르게 호흡이 맞아, 의견이 갈릴 때 자연스럽게 완충 역할을 해줍니다.`,
    };
  }

  // Balancer (member contributing the most to the group's weakest element)
  let balancer: GroupChemistryReport['balancer'] = null;
  if (members.length >= 2) {
    let bestContrib = -1;
    let bestBalancer = members[0];
    for (const m of members) {
      const elItem = m.elementBalance.find((e) => e.element === weakestGroupElement);
      const val = elItem ? elItem.weightedScore : 0;
      if (val > bestContrib) {
        bestContrib = val;
        bestBalancer = m;
      }
    }
    if (bestContrib > 0.5) {
      const elMeta = ELEMENT_META[weakestGroupElement];
      balancer = {
        member: bestBalancer,
        element: weakestGroupElement,
        reason: `모임 전체에서 가장 희소한 ${elMeta.hangul}(${elMeta.hanja}) 기운을 가장 많이 품고 있어, 모임의 빈틈과 균형을 잡아 주는 귀중한 역할입니다.`,
      };
    }
  }

  // Multi-member Samhap / Banghap completion across distinct members
  const groupSamhaps: GroupSamhapMatch[] = [];
  if (members.length >= 3) {
    const getMemberBranchSet = (m: RelationMember): Set<number> => {
      const set = new Set<number>([
        m.pillars.day.branch.index,
        m.pillars.month.branch.index,
        m.pillars.year.branch.index,
      ]);
      if (m.pillars.hour) set.add(m.pillars.hour.branch.index);
      return set;
    };

    const checkTrios = (
      list: { trio: [number, number, number]; name: string; element: ElementType }[],
      type: '삼합' | '방합'
    ) => {
      for (const item of list) {
        // Try to pick 3 distinct members who cover the 3 branches (prefer day/month branch match)
        const picks: { memberName: string; branchIdx: number }[] = [];
        const usedIds = new Set<string>();
        let allFound = true;

        for (const targetBranch of item.trio) {
          const candidate =
            members.find((m) => !usedIds.has(m.id) && m.pillars.day.branch.index === targetBranch) ||
            members.find((m) => !usedIds.has(m.id) && getMemberBranchSet(m).has(targetBranch));
          if (candidate) {
            usedIds.add(candidate.id);
            picks.push({ memberName: candidate.name, branchIdx: targetBranch });
          } else {
            allFound = false;
            break;
          }
        }

        if (allFound && picks.length === 3) {
          const elMeta = ELEMENT_META[item.element];
          groupSamhaps.push({
            id: `${type}-${item.trio.join('-')}`,
            type,
            name: `${item.name} ${type}`,
            element: item.element,
            contributors: picks.map((p) => ({
              memberName: p.memberName,
              branchHangul: BRANCHES[p.branchIdx].hangul,
              branchHanja: BRANCHES[p.branchIdx].hanja,
            })),
            meaning:
              type === '삼합'
                ? `세 사람이 모일 때 각자의 지지가 하나로 결집해 강력한 ${elMeta.hangul}(${elMeta.hanja}) 시너지를 일으킵니다. 혼자일 때보다 함께 움직일 때 판이 커지는 조합입니다.`
                : `세 사람이 계절의 기운을 나란히 완성해, 오래 알아 온 식구 같은 친밀한 ${elMeta.hangul}(${elMeta.hanja}) 분위기를 만듭니다.`,
          });
        }
      }
    };

    checkTrios(SAMHAP_TRIOS, '삼합');
    checkTrios(BANGHAP_TRIOS, '방합');
  }

  const strongMeta = ELEMENT_META[strongestGroupElement];
  const weakMeta = ELEMENT_META[weakestGroupElement];
  const seoldamGroupSummary =
    members.length >= 3
      ? `${members.length}분의 명부를 한 판에 펼쳐 보니 ${strongMeta.hangul}(${strongMeta.hanja}) 기운이 중심을 잡고 있군요. ${
          groupSamhaps.length > 0
            ? `게다가 여럿이 모여 ${groupSamhaps[0].name}까지 완성되니, 함께 뭉치실 때 추진력이 남다릅니다.`
            : `서로의 빈틈을 메워 가며 굴러가는 안정적인 흐름입니다.`
        } 다만 모임 전체에 ${weakMeta.hangul}(${weakMeta.hanja}) 기운이 가장 귀하니, ${
          balancer
            ? `${balancer.member.name}님의 의견에 귀를 기울여 주시면`
            : `의식적으로 속도를 한 박자 조절해 보신다면`
        } 작은 어긋남도 없이 오래도록 든든한 인연이 될 것입니다.`
      : bestPair
        ? bestPair.seoldamNote.quote
        : '최소 두 분의 만세력을 입력하시면 서로의 명리 상관관계를 차분히 펼쳐 드리겠습니다.';

  return {
    members,
    pairs,
    pairMap,
    collectiveElements,
    strongestGroupElement,
    weakestGroupElement,
    groupTemperamentTitle: GROUP_TEMP[strongestGroupElement].title,
    groupTemperamentSummary: GROUP_TEMP[strongestGroupElement].summary,
    bestPair,
    tensionPair,
    mediator,
    balancer,
    groupSamhaps,
    seoldamGroupSummary,
  };
}

// Default 4-person sample group: 김봄, 이여름, 박가을, 최겨울
export const SAMPLE_RELATION_BATCH_TEXT = `김봄 계병무경사술자술
이여름 신을계임사유묘신
박가을 정무병기사오자묘
최겨울 을정경정사축술해`;

export function createSampleRelationMembers(): RelationMember[] {
  return parseBatchMembersText(SAMPLE_RELATION_BATCH_TEXT, 'hour-first').members.map((m, idx) => ({
    ...m,
    id: `sample-season-${idx + 1}`,
    isSample: true,
  }));
}
