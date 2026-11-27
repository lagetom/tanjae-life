import {
  BirthInput,
  BranchInfo,
  ElementBalanceItem,
  ElementType,
  InteractionItem,
  LifeStage12,
  Pillar,
  SajuChart,
  SinsalItem,
  StemInfo,
  StrengthGrade,
  TenGod,
  TenGodGroup,
  TenGodGroupScore,
} from './sajuTypes';
import { isValidSolarDate, lunarToSolar, solarToLunar } from './lunarCalendar';

export const ELEMENT_META: Record<
  ElementType,
  { hangul: string; hanja: string; color: string; bgTint: string; borderTint: string }
> = {
  wood: {
    hangul: '목',
    hanja: '木',
    color: '#14532D',
    bgTint: '#F2F7F4',
    borderTint: '#C7DCD0',
  },
  fire: {
    hangul: '화',
    hanja: '火',
    color: '#9A3412',
    bgTint: '#FDF5F2',
    borderTint: '#E9CEC3',
  },
  earth: {
    hangul: '토',
    hanja: '土',
    color: '#854D0E',
    bgTint: '#FBF8F1',
    borderTint: '#E5D8BF',
  },
  metal: {
    hangul: '금',
    hanja: '金',
    color: '#475569',
    bgTint: '#F6F7F9',
    borderTint: '#D4DAE2',
  },
  water: {
    hangul: '수',
    hanja: '水',
    color: '#1E3A8A',
    bgTint: '#F2F5FB',
    borderTint: '#C9D5EC',
  },
};

export const ELEMENT_ORDER: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export const STEMS: readonly StemInfo[] = [
  { index: 0, hangul: '갑', hanja: '甲', element: 'wood', yinYang: 'yang', natureTitle: '우뚝 선 큰 나무' },
  { index: 1, hangul: '을', hanja: '乙', element: 'wood', yinYang: 'yin', natureTitle: '유연한 화초와 덩굴' },
  { index: 2, hangul: '병', hanja: '丙', element: 'fire', yinYang: 'yang', natureTitle: '하늘의 밝은 태양' },
  { index: 3, hangul: '정', hanja: '丁', element: 'fire', yinYang: 'yin', natureTitle: '은은하고 깊은 등불' },
  { index: 4, hangul: '무', hanja: '戊', element: 'earth', yinYang: 'yang', natureTitle: '웅장하고 묵직한 큰 산' },
  { index: 5, hangul: '기', hanja: '己', element: 'earth', yinYang: 'yin', natureTitle: '만물을 기르는 비옥한 대지' },
  { index: 6, hangul: '경', hanja: '庚', element: 'metal', yinYang: 'yang', natureTitle: '단단한 원석과 무쇠' },
  { index: 7, hangul: '신', hanja: '辛', element: 'metal', yinYang: 'yin', natureTitle: '정교하게 세공된 보석' },
  { index: 8, hangul: '임', hanja: '壬', element: 'water', yinYang: 'yang', natureTitle: '도도하게 흐르는 큰 바다' },
  { index: 9, hangul: '계', hanja: '癸', element: 'water', yinYang: 'yin', natureTitle: '대지를 적시는 단비와 샘물' },
];

export const BRANCHES: readonly BranchInfo[] = [
  { index: 0, hangul: '자', hanja: '子', element: 'water', yinYang: 'yang', animal: '쥐', season: '겨울', hiddenStems: [8, 9] },
  { index: 1, hangul: '축', hanja: '丑', element: 'earth', yinYang: 'yin', animal: '소', season: '겨울', hiddenStems: [9, 7, 5] },
  { index: 2, hangul: '인', hanja: '寅', element: 'wood', yinYang: 'yang', animal: '호랑이', season: '봄', hiddenStems: [4, 2, 0] },
  { index: 3, hangul: '묘', hanja: '卯', element: 'wood', yinYang: 'yin', animal: '토끼', season: '봄', hiddenStems: [0, 1] },
  { index: 4, hangul: '진', hanja: '辰', element: 'earth', yinYang: 'yang', animal: '용', season: '봄', hiddenStems: [1, 9, 4] },
  { index: 5, hangul: '사', hanja: '巳', element: 'fire', yinYang: 'yin', animal: '뱀', season: '여름', hiddenStems: [4, 6, 2] },
  { index: 6, hangul: '오', hanja: '午', element: 'fire', yinYang: 'yang', animal: '말', season: '여름', hiddenStems: [2, 5, 3] },
  { index: 7, hangul: '미', hanja: '未', element: 'earth', yinYang: 'yin', animal: '양', season: '여름', hiddenStems: [3, 1, 5] },
  { index: 8, hangul: '신', hanja: '申', element: 'metal', yinYang: 'yang', animal: '원숭이', season: '가을', hiddenStems: [4, 8, 6] },
  { index: 9, hangul: '유', hanja: '酉', element: 'metal', yinYang: 'yin', animal: '닭', season: '가을', hiddenStems: [6, 7] },
  { index: 10, hangul: '술', hanja: '戌', element: 'earth', yinYang: 'yang', animal: '개', season: '가을', hiddenStems: [7, 3, 4] },
  { index: 11, hangul: '해', hanja: '亥', element: 'water', yinYang: 'yin', animal: '돼지', season: '겨울', hiddenStems: [4, 0, 8] },
];

const SOLAR_TERM_NAMES = [
  '입춘(立春)', '우수(雨水)', '경칩(驚蟄)', '춘분(春分)',
  '청명(淸明)', '곡우(穀雨)', '입하(立夏)', '소만(小滿)',
  '망종(芒種)', '하지(夏至)', '소서(小暑)', '대서(大暑)',
  '입추(立秋)', '처서(處暑)', '백로(白露)', '추분(秋分)',
  '한로(寒露)', '상강(霜降)', '입동(立冬)', '소설(小雪)',
  '대설(大雪)', '동지(冬至)', '소한(小寒)', '대한(大寒)',
];

const LIFE_STAGES: readonly LifeStage12[] = [
  '장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양',
];

// 각 일간별 장생(長生) 시작 지지 인덱스 (정통 음양 순역 기준)
const JANGSAENG_START: readonly number[] = [
  11, // 갑(甲): 해(亥) 장생, 순행
  6,  // 을(乙): 오(午) 장생, 역행
  2,  // 병(丙): 인(寅) 장생, 순행
  9,  // 정(丁): 유(酉) 장생, 역행
  2,  // 무(戊): 인(寅) 장생, 순행
  9,  // 기(己): 유(酉) 장생, 역행
  5,  // 경(庚): 사(巳) 장생, 순행
  0,  // 신(辛): 자(子) 장생, 역행
  8,  // 임(壬): 신(申) 장생, 순행
  3,  // 계(癸): 묘(卯) 장생, 역행
];

// 상생 관계: wood -> fire -> earth -> metal -> water -> wood
export function generates(e: ElementType): ElementType {
  const idx = ELEMENT_ORDER.indexOf(e);
  return ELEMENT_ORDER[(idx + 1) % 5];
}

export function generatedBy(e: ElementType): ElementType {
  const idx = ELEMENT_ORDER.indexOf(e);
  return ELEMENT_ORDER[(idx + 4) % 5];
}

// 상극 관계: wood -> earth -> water -> fire -> metal -> wood
export function controls(e: ElementType): ElementType {
  const idx = ELEMENT_ORDER.indexOf(e);
  return ELEMENT_ORDER[(idx + 2) % 5];
}

export function controlledBy(e: ElementType): ElementType {
  const idx = ELEMENT_ORDER.indexOf(e);
  return ELEMENT_ORDER[(idx + 3) % 5];
}

export function getTenGod(dayMaster: StemInfo, target: StemInfo): TenGod {
  const samePolarity = dayMaster.yinYang === target.yinYang;
  const dmEl = dayMaster.element;
  const tEl = target.element;

  if (dmEl === tEl) return samePolarity ? '비견' : '겁재';
  if (generates(dmEl) === tEl) return samePolarity ? '식신' : '상관';
  if (controls(dmEl) === tEl) return samePolarity ? '편재' : '정재';
  if (controlledBy(dmEl) === tEl) return samePolarity ? '편관' : '정관';
  return samePolarity ? '편인' : '정인';
}

export function getTenGodGroup(tenGod: TenGod): TenGodGroup {
  switch (tenGod) {
    case '비견':
    case '겁재':
    case '일간(본원)':
      return '비겁';
    case '식신':
    case '상관':
      return '식상';
    case '편재':
    case '정재':
      return '재성';
    case '편관':
    case '정관':
      return '관성';
    case '편인':
    case '정인':
      return '인성';
  }
}

export function getLifeStage(dayMaster: StemInfo, branchIndex: number): LifeStage12 {
  const start = JANGSAENG_START[dayMaster.index];
  const isYang = dayMaster.yinYang === 'yang';
  const offset = isYang
    ? (branchIndex - start + 12) % 12
    : (start - branchIndex + 12) % 12;
  return LIFE_STAGES[offset];
}

/**
 * 태양 시황경(Apparent Solar Ecliptic Longitude) 계산 (Jean Meeus 알고리즘)
 * 1900~2100년 범위에서 24절기 절입 시각을 ~1분 이내 정밀도로 판별
 */
function getSunApparentLongitude(utcMs: number): number {
  const jd = utcMs / 86_400_000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  const deg2rad = Math.PI / 180;

  let L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  if (L0 < 0) L0 += 360;

  let M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  if (M < 0) M += 360;
  const Mr = M * deg2rad;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);

  const trueLon = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  let apparent = trueLon - 0.00569 - 0.00478 * Math.sin(omega * deg2rad);
  apparent = ((apparent % 360) + 360) % 360;
  return apparent;
}

/**
 * 율리우스 적일(JDN) 기반 일주 60갑자 인덱스 산출
 * 검증: 2000-01-01 = JDN 2451545 -> (2451545 + 49) % 60 = 54 (무오 戊午)
 */
function getJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function buildPillar(
  position: Pillar['position'],
  label: string,
  stemIndex: number,
  branchIndex: number,
  dayMaster: StemInfo,
  isKnown = true
): Pillar {
  const stem = STEMS[((stemIndex % 10) + 10) % 10];
  const branch = BRANCHES[((branchIndex % 12) + 12) % 12];
  const mainHiddenStemIdx = branch.hiddenStems[branch.hiddenStems.length - 1];
  const mainHiddenStem = STEMS[mainHiddenStemIdx];

  const hiddenStems = branch.hiddenStems.map((hsIdx, i) => {
    const hs = STEMS[hsIdx];
    const role: '여기' | '중기' | '정기' =
      i === branch.hiddenStems.length - 1
        ? '정기'
        : i === 0
          ? '여기'
          : '중기';
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
    isKnown,
  };
}

function detectInteractions(pillarsList: Pillar[]): InteractionItem[] {
  const results: InteractionItem[] = [];
  const seen = new Set<string>();

  // 1. 천간합
  const stemPairs: [number, number, string, string][] = [
    [0, 5, '갑기합(甲己合 · 토화)', '중정지합으로 신뢰와 실리를 중시하며 안정적인 결속력을 만듭니다.'],
    [1, 6, '을경합(乙庚合 · 금화)', '인의지합으로 결단력과 유연함이 만나 실행력과 추진력을 발휘합니다.'],
    [2, 7, '병신합(丙辛合 · 수화)', '위엄지합으로 세련된 매력과 지혜가 조화를 이루며 대인 흡인력이 생깁니다.'],
    [3, 8, '정임합(丁壬合 · 목화)', '인수지합으로 감수성과 통찰이 결합해 예술적·인간적 깊이를 더합니다.'],
    [4, 9, '무계합(戊癸合 · 화화)', '무정지합으로 현실 감각과 기지가 어우러져 유연한 처세 능력을 보입니다.'],
  ];

  for (let i = 0; i < pillarsList.length; i++) {
    for (let j = i + 1; j < pillarsList.length; j++) {
      const a = pillarsList[i];
      const b = pillarsList[j];
      for (const [s1, s2, name, detail] of stemPairs) {
        if (
          (a.stem.index === s1 && b.stem.index === s2) ||
          (a.stem.index === s2 && b.stem.index === s1)
        ) {
          const key = `stem-${Math.min(s1, s2)}-${Math.max(s1, s2)}-${a.position}-${b.position}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              id: key,
              type: '천간합',
              name,
              pillarsInvolved: `${a.label} · ${b.label}`,
              summary: '두 천간의 기운이 화합하여 새로운 결속을 형성',
              detail,
            });
          }
        }
      }
    }
  }

  // 2. 지지 육합
  const branchSixCombines: [number, number, string, string][] = [
    [0, 1, '자축합(子丑合)', '차분한 결속력과 내실 있는 계획성을 만들어 냅니다.'],
    [2, 11, '인해합(寅亥合)', '생기 있는 확장성과 배움·성장의 조화를 이룹니다.'],
    [3, 10, '묘술합(卯戌合)', '따뜻한 열정과 실무적 추진력이 하나로 모입니다.'],
    [4, 9, '진유합(辰酉合)', '정교한 완성도와 실리적 결실을 이끌어 냅니다.'],
    [5, 8, '사신합(巳申合)', '빠른 기지와 상황 대처 능력이 돋보이는 다이나믹한 합입니다.'],
    [6, 7, '오미합(午未合)', '밝은 에너지가 안정된 기반 위에서 따뜻하게 발현됩니다.'],
  ];

  // 3. 지지 육충
  const branchClashes: [number, number, string, string][] = [
    [0, 6, '자오충(子午沖)', '물과 불의 대비로 내적 역동성과 변화 욕구가 강하며, 삶의 전환점이 뚜렷합니다.'],
    [1, 7, '축미충(丑未沖)', '고집과 고집이 부딪혀 기존 틀을 깨고 새롭게 개척하는 추진력으로 작용합니다.'],
    [2, 8, '인신충(寅申沖)', '역마의 충돌로 이동·변화·해외·출장이 잦으며, 활동적인 환경에서 기량이 살아납니다.'],
    [3, 9, '묘유충(卯酉沖)', '예민한 감각과 완벽주의적 기질이 발현되어 정밀한 전문 분야에서 강점을 보입니다.'],
    [4, 10, '진술충(辰戌沖)', '넓은 시야와 개혁 성향으로 정체된 환경을 스스로 쇄신하는 힘이 있습니다.'],
    [5, 11, '사해충(巳亥沖)', '생각과 이동이 활발해 다방면의 호기심이 깊고, 빠른 판단으로 기회를 포착합니다.'],
  ];

  for (let i = 0; i < pillarsList.length; i++) {
    for (let j = i + 1; j < pillarsList.length; j++) {
      const a = pillarsList[i];
      const b = pillarsList[j];

      for (const [b1, b2, name, detail] of branchSixCombines) {
        if (
          (a.branch.index === b1 && b.branch.index === b2) ||
          (a.branch.index === b2 && b.branch.index === b1)
        ) {
          const key = `yukhap-${b1}-${b2}-${a.position}-${b.position}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              id: key,
              type: '지지육합',
              name,
              pillarsInvolved: `${a.label} · ${b.label}`,
              summary: '서로 다른 지지가 친밀하게 결속하는 조화',
              detail,
            });
          }
        }
      }

      for (const [b1, b2, name, detail] of branchClashes) {
        if (
          (a.branch.index === b1 && b.branch.index === b2) ||
          (a.branch.index === b2 && b.branch.index === b1)
        ) {
          const key = `chung-${b1}-${b2}-${a.position}-${b.position}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              id: key,
              type: '지지충',
              name,
              pillarsInvolved: `${a.label} · ${b.label}`,
              summary: '상반된 기운이 만나 변화를 촉발하는 역동성',
              detail,
            });
          }
        }
      }
    }
  }

  // 4. 지지 삼합 / 반합
  const branchIndices = new Set(pillarsList.map((p) => p.branch.index));
  const samhapList: { trio: [number, number, number]; name: string; elLabel: string }[] = [
    { trio: [2, 6, 10], name: '인오술(寅午戌) 화국', elLabel: '화(火)' },
    { trio: [5, 9, 1], name: '사유축(巳酉丑) 금국', elLabel: '금(金)' },
    { trio: [8, 0, 4], name: '신자진(申子辰) 수국', elLabel: '수(水)' },
    { trio: [11, 3, 7], name: '해묘미(亥卯未) 목국', elLabel: '목(木)' },
  ];

  for (const s of samhapList) {
    const present = s.trio.filter((idx) => branchIndices.has(idx));
    if (present.length === 3) {
      results.push({
        id: `samhap-${s.trio.join('-')}`,
        type: '지지삼합',
        name: `${s.name} 삼합`,
        pillarsInvolved: '원국 지지 전체',
        summary: `세 지지가 하나의 목적을 향해 ${s.elLabel} 기운으로 크게 결집`,
        detail: `${s.name}이 온전히 이루어져 사회적 결속력과 스케일이 크며, 목표가 정해지면 강한 집중력을 발휘합니다.`,
      });
    } else if (present.length === 2 && branchIndices.has(s.trio[1])) {
      results.push({
        id: `banhap-${s.trio.join('-')}`,
        type: '지지반합',
        name: `${s.name} 반합`,
        pillarsInvolved: '원국 지지',
        summary: `왕지(중심 글자)를 축으로 ${s.elLabel} 기운이 자연스레 모이는 구조`,
        detail: `삼합의 핵심 글자가 포함되어 있어 평소에도 ${s.elLabel}의 성향이 뚜렷하게 작동하며, 운에서 나머지 글자가 올 때 큰 성취로 이어집니다.`,
      });
    }
  }

  return results;
}

function detectSinsal(
  dayMaster: StemInfo,
  dayPillar: Pillar,
  yearPillar: Pillar,
  allPillars: Pillar[]
): SinsalItem[] {
  const results: SinsalItem[] = [];
  const allBranches = allPillars.map((p) => ({ idx: p.branch.index, label: p.label }));

  // 1. 천을귀인 (일간 기준)
  const cheoneulMap: Record<number, number[]> = {
    0: [1, 7], 4: [1, 7], 6: [1, 7], // 갑무경 -> 축미
    1: [0, 8], 5: [0, 8],            // 을기 -> 자신
    2: [11, 9], 3: [11, 9],          // 병정 -> 해유
    7: [2, 6],                       // 신 -> 인오
    8: [3, 5], 9: [3, 5],            // 임계 -> 묘사
  };
  const ceMatches = allBranches.filter((b) => cheoneulMap[dayMaster.index].includes(b.idx));
  if (ceMatches.length > 0) {
    results.push({
      id: 'cheoneul',
      name: '천을귀인',
      hanja: '天乙貴人',
      location: ceMatches.map((m) => m.label).join(' · '),
      summary: '결정적인 순간에 조력자와 귀한 인연을 만나는 대표 길신',
      detail: '어려움이 찾아와도 주변의 도움이나 뜻밖의 해법으로 위기를 부드럽게 넘기는 복덕이 있으며, 품위와 인덕을 겸비하는 경향이 있습니다.',
    });
  }

  // 2. 문창귀인 (일간 기준)
  const munchangMap: Record<number, number> = {
    0: 5, 1: 6, 2: 8, 3: 9, 4: 8, 5: 9, 6: 11, 7: 0, 8: 2, 9: 3,
  };
  const mcMatches = allBranches.filter((b) => b.idx === munchangMap[dayMaster.index]);
  if (mcMatches.length > 0) {
    results.push({
      id: 'munchang',
      name: '문창귀인',
      hanja: '文昌貴人',
      location: mcMatches.map((m) => m.label).join(' · '),
      summary: '문장력·학습력·기획력이 빛나는 지성의 길신',
      detail: '정보를 구조화하고 글이나 말로 설득력 있게 표현하는 재능이 뛰어나 학문, 기획, 콘텐츠, 전문 자격 분야에서 빛을 발합니다.',
    });
  }

  // 삼합 그룹 기준 (일지 및 연지)
  const getGroupTarget = (branchIdx: number) => {
    if ([2, 6, 10].includes(branchIdx)) return { dohwa: 3, yeokma: 8, hwagae: 10 }; // 인오술
    if ([5, 9, 1].includes(branchIdx)) return { dohwa: 6, yeokma: 11, hwagae: 1 }; // 사유축
    if ([8, 0, 4].includes(branchIdx)) return { dohwa: 9, yeokma: 2, hwagae: 4 };  // 신자진
    return { dohwa: 0, yeokma: 5, hwagae: 7 };                                      // 해묘미
  };

  const dayTargets = getGroupTarget(dayPillar.branch.index);
  const yearTargets = getGroupTarget(yearPillar.branch.index);

  // 3. 도화살 (현대적 해석: 매력·시선 집중·예술성)
  const dohwaMatches = allBranches.filter(
    (b) => b.idx === dayTargets.dohwa || b.idx === yearTargets.dohwa
  );
  if (dohwaMatches.length > 0) {
    results.push({
      id: 'dohwa',
      name: '도화살',
      hanja: '桃花殺',
      location: dohwaMatches.map((m) => m.label).join(' · '),
      summary: '사람들의 시선을 끄는 자연스러운 매력과 감각적 표현력',
      detail: '현대 사회에서는 대중적 인기, 브랜딩 감각, 미적 센스, 커뮤니케이션 매력으로 발현되어 사람 앞에 서거나 취향을 제안하는 일에 유리합니다.',
    });
  }

  // 4. 역마살 (현대적 해석: 기동력·글로벌·변화 적응력)
  const yeokmaMatches = allBranches.filter(
    (b) => b.idx === dayTargets.yeokma || b.idx === yearTargets.yeokma
  );
  if (yeokmaMatches.length > 0) {
    results.push({
      id: 'yeokma',
      name: '역마살',
      hanja: '驛馬殺',
      location: yeokmaMatches.map((m) => m.label).join(' · '),
      summary: '넓은 무대를 누비며 변화 속에서 기회를 찾는 기동성',
      detail: '한 자리에 머물기보다 출장, 이직, 해외 교류, 멀티 프로젝트 등 움직임이 많은 환경에서 에너지가 살아나고 성과가 커집니다.',
    });
  }

  // 5. 화개살 (예술·철학·깊은 사색)
  const hwagaeMatches = allBranches.filter(
    (b) => b.idx === dayTargets.hwagae || b.idx === yearTargets.hwagae
  );
  if (hwagaeMatches.length > 0) {
    results.push({
      id: 'hwagae',
      name: '화개살',
      hanja: '華蓋殺',
      location: hwagaeMatches.map((m) => m.label).join(' · '),
      summary: '깊은 사유와 독창적인 미감, 내면의 품격',
      detail: '유행을 좇기보다 자신만의 철학과 깊은 취향을 구축하며, 연구·예술·인문·설계 등 깊이 파고드는 영역에서 대체 불가능한 존재감을 보입니다.',
    });
  }

  // 6. 괴강살 (일주 기준: 경진, 경술, 임진, 임술, 무진, 무술)
  const goegangCodes = ['경진', '경술', '임진', '임술', '무진', '무술'];
  if (goegangCodes.includes(dayPillar.ganjiHangul)) {
    results.push({
      id: 'goegang',
      name: '괴강살',
      hanja: '魁罡殺',
      location: '일주',
      summary: '뚜렷한 주관과 난관을 돌파하는 강인한 리더십',
      detail: '결단력과 추진력이 남다르며 위기 상황에서 오히려 침착하게 판을 주도하는 힘이 있습니다. 원칙을 세우되 유연함을 곁들이면 큰 성취를 이룹니다.',
    });
  }

  return results;
}

export function calculateSajuChart(input: BirthInput): SajuChart {
  let solarYear = input.year;
  let solarMonth = input.month;
  let solarDay = input.day;

  if (input.calendarType === 'lunar') {
    const converted = lunarToSolar(input.year, input.month, input.day, input.isLeapMonth);
    if (!converted) {
      throw new Error('유효하지 않은 음력 날짜입니다. 연도와 월, 윤달 여부를 확인해 주세요.');
    }
    solarYear = converted.year;
    solarMonth = converted.month;
    solarDay = converted.day;
  } else {
    if (!isValidSolarDate(solarYear, solarMonth, solarDay)) {
      throw new Error('존재하지 않는 양력 날짜입니다. 월과 일을 다시 확인해 주세요.');
    }
  }

  const inputHour = input.unknownTime ? 12 : input.hour;
  const inputMinute = input.unknownTime ? 0 : input.minute;

  // 서울 진태양시 보정 (-30분)
  const kstDateMs = Date.UTC(solarYear, solarMonth - 1, solarDay, inputHour, inputMinute);
  const offsetMinutes = !input.unknownTime && input.useTrueSolarTime ? -30 : 0;
  const adjDate = new Date(kstDateMs + offsetMinutes * 60_000);

  const adjYear = adjDate.getUTCFullYear();
  const adjMonth = adjDate.getUTCMonth() + 1;
  const adjDay = adjDate.getUTCDate();
  const adjHour = adjDate.getUTCHours();
  const adjMinute = adjDate.getUTCMinutes();

  const shiftedDay =
    Date.UTC(adjYear, adjMonth - 1, adjDay) === Date.UTC(solarYear, solarMonth - 1, solarDay)
      ? 0
      : Date.UTC(adjYear, adjMonth - 1, adjDay) < Date.UTC(solarYear, solarMonth - 1, solarDay)
        ? -1
        : 1;

  // UTC 기준 태양 시황경 계산 (KST = UTC + 9시간)
  const utcMs = Date.UTC(solarYear, solarMonth - 1, solarDay, inputHour, inputMinute) - 9 * 3_600_000;
  const sunLon = getSunApparentLongitude(utcMs);

  // 24절기 이름 (입춘 315° = 0)
  const shiftedLon = (sunLon + 45) % 360;
  const solarTermIdx = Math.floor(shiftedLon / 15) % 24;
  const solarTermName = SOLAR_TERM_NAMES[solarTermIdx];

  // 월주 인덱스 (인월=0 .. 축월=11)
  const sajuMonthIdx = Math.floor(shiftedLon / 30) % 12;

  // 입춘(315°) 기준 연주 결정
  let sajuYear = solarYear;
  if (solarMonth === 1 || (solarMonth === 2 && sunLon >= 270 && sunLon < 315)) {
    sajuYear = solarYear - 1;
  }

  // 1. 연주 (1984년 = 갑자년, (year - 4) % 60)
  const yearStemIdx = ((sajuYear - 4) % 10 + 10) % 10;
  const yearBranchIdx = ((sajuYear - 4) % 12 + 12) % 12;

  // 2. 월주 (오호둔법)
  const monthStemIdx = ((yearStemIdx % 5) * 2 + 2 + sajuMonthIdx) % 10;
  const monthBranchIdx = (sajuMonthIdx + 2) % 12;

  // 3. 일주 (율리우스 적일 기반, 양력 출생일 기준)
  const jdn = getJulianDayNumber(solarYear, solarMonth, solarDay);
  const dayGanjiIdx = ((jdn + 49) % 60 + 60) % 60;
  const dayStemIdx = dayGanjiIdx % 10;
  const dayBranchIdx = dayGanjiIdx % 12;
  const dayMaster = STEMS[dayStemIdx];

  // 4. 시주 (오서둔법, 진태양시 보정 시각 기준)
  let hourPillar: Pillar | null = null;
  if (!input.unknownTime) {
    const hourBranchIdx = Math.floor(((adjHour + 1) % 24) / 2);
    const hourStemIdx = ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;
    hourPillar = buildPillar('hour', '시주', hourStemIdx, hourBranchIdx, dayMaster, true);
  }

  const dayPillar = buildPillar('day', '일주', dayStemIdx, dayBranchIdx, dayMaster, true);
  const monthPillar = buildPillar('month', '월주', monthStemIdx, monthBranchIdx, dayMaster, true);
  const yearPillar = buildPillar('year', '연주', yearStemIdx, yearBranchIdx, dayMaster, true);

  const activePillars = [yearPillar, monthPillar, dayPillar, ...(hourPillar ? [hourPillar] : [])];

  // 오행 분포 계산 (단순 개수 + 월지/일지 가중치 반영)
  const rawCounts: Record<ElementType, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const weighted: Record<ElementType, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  for (const p of activePillars) {
    rawCounts[p.stem.element] += 1;
    rawCounts[p.branch.element] += 1;

    const stemWeight = p.position === 'day' ? 1.15 : 1.0;
    const branchWeight =
      p.position === 'month' ? 2.1 : p.position === 'day' ? 1.35 : 1.1;

    weighted[p.stem.element] += stemWeight;
    weighted[p.branch.element] += branchWeight;

    // 지장간 여기·중기의 미세한 영향 반영
    p.hiddenStems.forEach((hs) => {
      if (hs.role === '여기') weighted[hs.stem.element] += 0.15;
      if (hs.role === '중기') weighted[hs.stem.element] += 0.25;
    });
  }

  const totalWeight = ELEMENT_ORDER.reduce((sum, el) => sum + weighted[el], 0);
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

  // 음양 비율
  let yangCount = 0;
  let yinCount = 0;
  for (const p of activePillars) {
    if (p.stem.yinYang === 'yang') yangCount++;
    else yinCount++;
    if (p.branch.yinYang === 'yang') yangCount++;
    else yinCount++;
  }
  const totalChars = yangCount + yinCount;
  const yangPercent = Math.round((yangCount / totalChars) * 100);

  // 십성 그룹 비율 (일간 제외)
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
  const tgMeta: Record<TenGodGroup, { hanja: string; meaning: string }> = {
    비겁: { hanja: '比劫', meaning: '주체성·자립심·경쟁력' },
    식상: { hanja: '食傷', meaning: '표현력·창의성·실행력' },
    재성: { hanja: '財星', meaning: '현실감각·결과·자원관리' },
    관성: { hanja: '官星', meaning: '책임감·규율·사회적 성취' },
    인성: { hanja: '印星', meaning: '사고력·학문·수용과 통찰' },
  };
  const tenGodGroups: TenGodGroupScore[] = (['비겁', '식상', '재성', '관성', '인성'] as TenGodGroup[]).map(
    (g) => ({
      group: g,
      hanja: tgMeta[g].hanja,
      score: Number(groupWeights[g].toFixed(2)),
      percentage: Math.round((groupWeights[g] / totalTG) * 100),
      meaning: tgMeta[g].meaning,
    })
  );

  // 신강 / 신약 산출 (득령 · 득지 · 득세)
  const supportEl1 = dayMaster.element;
  const supportEl2 = generatedBy(dayMaster.element);
  const deukryeong =
    monthPillar.branch.element === supportEl1 || monthPillar.branch.element === supportEl2;
  const deukji =
    dayPillar.branch.element === supportEl1 || dayPillar.branch.element === supportEl2;

  const supportWeight = groupWeights['비겁'] + groupWeights['인성'];
  const supportRatio = supportWeight / totalTG;
  const deukse = supportRatio >= 0.45;
  const strengthScore = Math.min(95, Math.max(8, Math.round(supportRatio * 100)));

  let grade: StrengthGrade = '중화';
  if (strengthScore >= 72) grade = '극왕';
  else if (strengthScore >= 56) grade = '신강';
  else if (strengthScore >= 43) grade = '중화';
  else if (strengthScore >= 28) grade = '신약';
  else grade = '극약';

  const strengthExplanations: Record<StrengthGrade, string> = {
    극왕: '일간을 돕는 기운이 매우 강하게 뭉쳐 있어 독립심과 추진력이 압도적입니다. 에너지를 바깥으로 생산적으로 풀어내는 출구가 중요합니다.',
    신강: '자기 중심과 주관이 뚜렷하며, 외부 환경에 쉽게 흔들리지 않고 스스로 판을 주도할 힘이 충분한 명식입니다.',
    중화: '일간을 돕는 기운과 설기·통제하는 기운이 비교적 고르게 균형을 이루어 상황 적응력과 안정감이 뛰어납니다.',
    신약: '섬세하고 유연한 감수성을 지니며 주변 환경과 협력할 때 시너지가 커집니다. 내면의 기반과 체력을 꾸준히 다져두는 것이 유리합니다.',
    극약: '자아를 강하게 앞세우기보다 흐름을 읽고 뛰어난 파트너·시스템과 결합할 때 오히려 큰 성취를 이루는 유연한 구조입니다.',
  };

  // 용신(억부용신) 및 조후 참고 산출
  const drainCandidates: ElementType[] = [
    generates(dayMaster.element), // 식상
    controls(dayMaster.element),  // 재성
    controlledBy(dayMaster.element), // 관성
  ];
  const boostCandidates: ElementType[] = [
    generatedBy(dayMaster.element), // 인성
    dayMaster.element,              // 비겁
  ];

  let primaryYongsin: ElementType;
  let secondaryYongsin: ElementType;
  let yongsinReason: string;

  if (grade === '신강' || grade === '극왕') {
    // 신강이면 식상·재성·관성 중 원국에서 보완이 필요한(약하거나 조화로운) 오행 우선
    const sorted = [...drainCandidates].sort((a, b) => weighted[a] - weighted[b]);
    primaryYongsin = sorted[0];
    secondaryYongsin = sorted[1];
    yongsinReason = `일간의 기운이 강한 ${grade} 명식이므로, 축적된 에너지를 세련되게 발산하고 결실로 연결해 주는 ${ELEMENT_META[primaryYongsin].hangul}(${ELEMENT_META[primaryYongsin].hanja})과 ${ELEMENT_META[secondaryYongsin].hangul}(${ELEMENT_META[secondaryYongsin].hanja}) 기운이 균형을 잡아줍니다.`;
  } else if (grade === '신약' || grade === '극약') {
    const sorted = [...boostCandidates].sort((a, b) => weighted[a] - weighted[b]);
    primaryYongsin = sorted[0];
    secondaryYongsin = sorted[1];
    yongsinReason = `일간의 힘을 북돋아 주어야 하는 ${grade} 명식이므로, 내면의 뿌리와 회복력을 채워주는 ${ELEMENT_META[primaryYongsin].hangul}(${ELEMENT_META[primaryYongsin].hanja})과 ${ELEMENT_META[secondaryYongsin].hangul}(${ELEMENT_META[secondaryYongsin].hanja}) 기운이 든든한 버팀목이 됩니다.`;
  } else {
    // 중화면 가장 부족한 오행을 보완 용신으로 선택
    const sortedAll = [...ELEMENT_ORDER].sort((a, b) => weighted[a] - weighted[b]);
    primaryYongsin = sortedAll[0];
    secondaryYongsin = sortedAll[1];
    yongsinReason = `전체적으로 중화를 이룬 명식이므로, 상대적으로 비어 있는 ${ELEMENT_META[primaryYongsin].hangul}(${ELEMENT_META[primaryYongsin].hanja}) 기운을 일상에서 보완할 때 순환이 가장 매끄러워집니다.`;
  }

  let johuNote = '계절의 한난조습이 비교적 온화하여 극단적인 온도 편차 없이 안정적인 순환을 보입니다.';
  if (monthPillar.branch.season === '겨울') {
    johuNote =
      weighted.fire < 1.2
        ? '겨울철(한습)에 태어나 원국에 온기가 귀합니다. 화(火)의 따뜻함과 활력을 생활 속 리듬으로 채워주는 조후 보완이 큰 도움이 됩니다.'
        : '겨울철에 태어났으나 원국에 화(火)의 온기가 자리해 차가운 기운을 적절히 녹여주고 있습니다.';
  } else if (monthPillar.branch.season === '여름') {
    johuNote =
      weighted.water < 1.2
        ? '여름철(조열)에 태어나 열기가 앞서기 쉽습니다. 수(水)의 차분한 휴식과 냉정한 점검 습관이 균형을 지키는 열쇠입니다.'
        : '여름철의 왕성한 열기 속에 수(水)의 청량함이 균형을 잡아주어 열정과 이성이 조화를 이룹니다.';
  }

  // 격국 (월지 본기 십성 기준)
  const gyeokTenGod = monthPillar.branchTenGod;
  const gyeokGroup = getTenGodGroup(gyeokTenGod);
  const gyeokNameMap: Record<TenGod, string> = {
    '일간(본원)': '건록격',
    비견: '건록격(建祿格)',
    겁재: '양인격(羊刃格)',
    식신: '식신격(食神格)',
    상관: '상관격(傷官格)',
    편재: '편재격(偏財格)',
    정재: '정재격(正財格)',
    편관: '편관격(偏官格)',
    정관: '정관격(正官格)',
    편인: '편인격(偏印格)',
    정인: '정인격(正印格)',
  };

  const interactions = detectInteractions(activePillars);
  const sinsal = detectSinsal(dayMaster, dayPillar, yearPillar, activePillars);

  const lunarDate =
    input.calendarType === 'lunar'
      ? {
          year: input.year,
          month: input.month,
          day: input.day,
          isLeap: input.isLeapMonth,
        }
      : solarToLunar(solarYear, solarMonth, solarDay);

  return {
    input,
    solarDate: {
      year: solarYear,
      month: solarMonth,
      day: solarDay,
      hour: inputHour,
      minute: inputMinute,
    },
    adjustedDate: {
      year: adjYear,
      month: adjMonth,
      day: adjDay,
      hour: adjHour,
      minute: adjMinute,
      shiftedDay,
    },
    lunarDate,
    solarTermName,
    pillars: {
      hour: hourPillar,
      day: dayPillar,
      month: monthPillar,
      year: yearPillar,
    },
    dayMaster,
    dayPillarCode: dayPillar.ganjiHangul,
    gyeokguk: {
      tenGod: gyeokTenGod,
      group: gyeokGroup,
      name: gyeokNameMap[gyeokTenGod],
    },
    elementBalance,
    tenGodGroups,
    yinYangRatio: {
      yang: yangCount,
      yin: yinCount,
      yangPercent,
      yinPercent: 100 - yangPercent,
    },
    strength: {
      score: strengthScore,
      grade,
      deukryeong,
      deukji,
      deukse,
      explanation: strengthExplanations[grade],
    },
    yongsin: {
      primary: primaryYongsin,
      secondary: secondaryYongsin,
      johuNote,
      reason: yongsinReason,
    },
    interactions,
    sinsal,
  };
}
