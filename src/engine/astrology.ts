import { ELEMENT_META } from './manseryeok';
import { SajuChart } from './sajuTypes';

export type WesternElement = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';
export type PlanetId = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'ascendant';

export interface ZodiacSignInfo {
  index: number;
  nameKo: string;
  nameEn: string;
  symbol: string;
  element: WesternElement;
  modality: Modality;
  rulerKo: string;
  keyword: string;
  sunTrait: string;
  moonTrait: string;
  venusTrait: string;
  marsTrait: string;
  risingTrait: string;
}

export interface PlanetPlacement {
  id: PlanetId;
  nameKo: string;
  symbol: string;
  domainKo: string;
  longitude: number; // 0..360
  sign: ZodiacSignInfo;
  degreeInSign: number; // 0..29.99
  degreeLabel: string; // e.g. "14° 22'"
  interpretation: string;
}

export interface AspectItem {
  id: string;
  planetA: PlanetId;
  planetB: PlanetId;
  labelKo: string;
  typeKo: '합(0°)' | '육분(60°)' | '사각(90°)' | '삼합(120°)' | '충(180°)';
  harmony: '조화' | '긴장' | '융합';
  orb: number;
  summary: string;
  detail: string;
}

export interface WesternElementBalance {
  element: WesternElement;
  nameKo: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ModalityBalance {
  modality: Modality;
  nameKo: string;
  count: number;
  percentage: number;
}

export interface CrossInsight {
  headline: string;
  sharedTheme: string;
  contrastNote: string;
  synthesisPoints: {
    label: string;
    content: string;
  }[];
  seoldamQuote: string;
  footnote: string;
}

export interface AstrologyChart {
  placements: PlanetPlacement[];
  sun: PlanetPlacement;
  moon: PlanetPlacement;
  ascendant: PlanetPlacement | null;
  mercury: PlanetPlacement;
  venus: PlanetPlacement;
  mars: PlanetPlacement;
  jupiter: PlanetPlacement;
  saturn: PlanetPlacement;
  elements: WesternElementBalance[];
  modalities: ModalityBalance[];
  dominantElement: WesternElementBalance;
  dominantModality: ModalityBalance;
  aspects: AspectItem[];
  crossInsight: CrossInsight;
}

export const WESTERN_ELEMENT_META: Record<
  WesternElement,
  { nameKo: string; color: string }
> = {
  fire: { nameKo: '불(Fire)', color: '#9A3412' },
  earth: { nameKo: '흙(Earth)', color: '#854D0E' },
  air: { nameKo: '공기(Air)', color: '#475569' },
  water: { nameKo: '물(Water)', color: '#1E3A8A' },
};

export const ZODIAC_SIGNS: readonly ZodiacSignInfo[] = [
  {
    index: 0,
    nameKo: '양자리',
    nameEn: 'Aries',
    symbol: '♈',
    element: 'fire',
    modality: 'cardinal',
    rulerKo: '화성',
    keyword: '개척 · 직진 · 순수한 용기',
    sunTrait: '망설이기보다 먼저 첫 발을 내디디며, 스스로 길을 개척하고 승부를 겨루는 과정에서 생동감을 얻습니다.',
    moonTrait: '감정이 솔직하고 즉각적입니다. 답답함을 오래 참기보다 몸을 움직이거나 명확히 표현할 때 마음이 빠르게 풀립니다.',
    venusTrait: '호감이 생기면 에둘러 말하지 않고 당당하게 다가가는 편이며, 생기 있고 주도적인 상대에게 매력을 느낍니다.',
    marsTrait: '추진력과 돌파력이 매우 빠릅니다. 단기 집중력이 뛰어나 새로운 프로젝트를 점화하는 데 강점이 있습니다.',
    risingTrait: '첫인상이 또렷하고 활기차며, 군더더기 없는 솔직함과 당당한 에너지를 풍깁니다.',
  },
  {
    index: 1,
    nameKo: '황소자리',
    nameEn: 'Taurus',
    symbol: '♉',
    element: 'earth',
    modality: 'fixed',
    rulerKo: '금성',
    keyword: '안정 · 감각 · 꾸준한 축적',
    sunTrait: '조급하게 흔들리지 않고 자신이 가치 있다고 믿는 대상을 묵묵히 가꾸어 실질적인 풍요와 안정으로 완성합니다.',
    moonTrait: '익숙한 공간, 맛있는 음식, 촉감과 질감이 좋은 물건 등 오감의 편안함이 채워질 때 정서적 안정감이 깊어집니다.',
    venusTrait: '진중하고 한결같은 애정을 선호합니다. 화려한 이벤트보다 변치 않는 배려와 감각적인 일상을 함께 나누길 원합니다.',
    marsTrait: '시작은 신중하지만 한번 방향을 잡으면 누구보다 오래 버티며 끝까지 완주하는 묵직한 지구력을 발휘합니다.',
    risingTrait: '차분하고 신뢰감 있는 인상을 주며, 말투와 태도에 여유와 단단한 중심이 묻어납니다.',
  },
  {
    index: 2,
    nameKo: '쌍둥이자리',
    nameEn: 'Gemini',
    symbol: '♊',
    element: 'air',
    modality: 'mutable',
    rulerKo: '수성',
    keyword: '호기심 · 언어 · 유연한 연결',
    sunTrait: '지적 호기심이 왕성하고 정보와 사람을 빠르게 연결합니다. 다채로운 관점을 넘나들며 재치 있게 해법을 찾아냅니다.',
    moonTrait: '감정을 말이나 글로 정리하고 신뢰하는 사람과 대화를 나눌 때 머리가 맑아지고 마음이 가벼워집니다.',
    venusTrait: '대화가 끊기지 않고 유머 코드가 맞는 지적인 교감에 깊이 끌리며, 가볍고 산뜻한 소통 속에서 애정이 자랍니다.',
    marsTrait: '멀티태스킹과 순발력이 뛰어납니다. 하나의 방식에 매이기보다 여러 아이디어를 실험하며 빠르게 전환하는 힘이 있습니다.',
    risingTrait: '눈빛이 영민하고 말솜씨가 자연스러워 처음 만난 자리에서도 분위기를 부드럽게 여는 인상을 줍니다.',
  },
  {
    index: 3,
    nameKo: '게자리',
    nameEn: 'Cancer',
    symbol: '♋',
    element: 'water',
    modality: 'cardinal',
    rulerKo: '달',
    keyword: '공감 · 보호 · 깊은 정서',
    sunTrait: '타인의 감정을 섬세하게 감지하고, 소중한 사람과 자신이 속한 터전을 따뜻하고 단단하게 지켜내는 힘이 큽니다.',
    moonTrait: '감수성과 기억력이 매우 풍부합니다. 안전한 울타리와 정서적 소속감을 느낄 때 내면의 창의력과 온기가 활짝 피어납니다.',
    venusTrait: '마음을 열기까지는 신중하지만 한번 내 사람이라 여기면 세심하고 헌신적으로 보살피는 깊은 사랑을 합니다.',
    marsTrait: '직접 공격하기보다 지킬 대상이 분명할 때 놀라운 저력과 방어·추진 에너지를 발휘하는 수호형 실행력을 지녔습니다.',
    risingTrait: '부드럽고 다정한 첫인상을 주며, 상대가 경계를 풀고 속마음을 털어놓게 만드는 편안한 분위기가 있습니다.',
  },
  {
    index: 4,
    nameKo: '사자자리',
    nameEn: 'Leo',
    symbol: '♌',
    element: 'fire',
    modality: 'fixed',
    rulerKo: '태양',
    keyword: '창조 · 품위 · 당당한 중심',
    sunTrait: '자기만의 색깔과 자부심이 뚜렷하며, 주변에 따뜻한 활력을 불어넣고 무대의 중심에서 창조적 존재감을 드러냅니다.',
    moonTrait: '진심으로 인정받고 존중받을 때 마음이 환하게 열립니다. 감정을 솔직하고 넉넉하게 표현하는 따뜻한 내면을 지녔습니다.',
    venusTrait: '낭만적이고 통 큰 애정 표현을 즐기며, 서로를 자랑스럽게 여기고 아낌없이 응원해 주는 드라마틱한 사랑을 원합니다.',
    marsTrait: '자존심과 열정이 강한 추진력으로 이어집니다. 목표를 향해 당당하게 밀어붙이며 완성도 있는 결과를 세상에 보여주려 합니다.',
    risingTrait: '자연스러운 카리스마와 또렷한 존재감이 있어 말없이 있어도 시선이 모이는 당당한 인상을 줍니다.',
  },
  {
    index: 5,
    nameKo: '처녀자리',
    nameEn: 'Virgo',
    symbol: '♍',
    element: 'earth',
    modality: 'mutable',
    rulerKo: '수성',
    keyword: '정교함 · 분석 · 실질적 완성',
    sunTrait: '복잡한 문제를 세밀하게 분석하고 개선해 실질적인 완성도를 끌어올립니다. 성실한 디테일과 단정한 실력이 핵심 매력입니다.',
    moonTrait: '주변 환경과 일정이 정돈되어 있을 때 마음이 가장 편안합니다. 누군가에게 실질적인 도움이 될 때 깊은 보람을 느낍니다.',
    venusTrait: '화려한 미사여구보다 작은 약속을 지키고 상대의 일상을 꼼꼼히 챙기는 섬세한 행동으로 진심을 표현합니다.',
    marsTrait: '에너지를 허투루 쓰지 않고 효율과 정확도를 높이는 데 집중합니다. 치밀한 계획 아래 완성도 높은 결과물을 뽑아냅니다.',
    risingTrait: '단정하고 지적인 첫인상을 주며, 관찰력이 뛰어나고 말과 행동이 정갈하게 정리되어 보입니다.',
  },
  {
    index: 6,
    nameKo: '천칭자리',
    nameEn: 'Libra',
    symbol: '♎',
    element: 'air',
    modality: 'cardinal',
    rulerKo: '금성',
    keyword: '조화 · 심미안 · 균형 잡힌 관계',
    sunTrait: '서로 다른 입장을 공정하게 조율하고, 관계와 공간에 세련된 균형과 아름다움을 불어넣는 탁월한 감각을 지녔습니다.',
    moonTrait: '거친 갈등보다 평화롭고 품위 있는 소통 속에서 안정을 느낍니다. 미적 취향과 세련된 분위기가 기분에 큰 영향을 줍니다.',
    venusTrait: '사랑과 파트너십을 삶의 중요한 가치로 여깁니다. 매너와 취향이 조화를 이루는 우아하고 대등한 관계를 지향합니다.',
    marsTrait: '무리한 충돌보다 설득·협상·전략적 합의를 통해 원하는 결과를 이끌어 내는 세련된 실행 스타일을 보입니다.',
    risingTrait: '호감 가는 매너와 세련된 균형미가 돋보여, 첫 만남에서도 편안하고 품격 있는 인상을 남깁니다.',
  },
  {
    index: 7,
    nameKo: '전갈자리',
    nameEn: 'Scorpio',
    symbol: '♏',
    element: 'water',
    modality: 'fixed',
    rulerKo: '명왕성·화성',
    keyword: '통찰 · 몰입 · 본질의 탐구',
    sunTrait: '표면에 머물지 않고 사물과 인간의 본질을 끝까지 파고듭니다. 위기에서 다시 일어서는 회복력과 깊은 집중력이 압도적입니다.',
    moonTrait: '감정의 수심이 깊고 진정성을 최우선으로 둡니다. 가벼운 관계보다 신뢰가 검증된 소수와 깊고 단단한 유대를 맺습니다.',
    venusTrait: '한번 마음을 주면 진심으로 깊이 몰입하며, 표면적인 친절보다 속마음까지 투명하게 나눌 수 있는 밀도 높은 사랑을 원합니다.',
    marsTrait: '겉으로 요란하게 드러내지 않지만 한번 겨눈 목표는 집요하고 전략적으로 끝까지 관철하는 강력한 의지력을 지녔습니다.',
    risingTrait: '차분하면서도 쉽게 꿰뚫어 볼 수 없는 깊은 눈빛과 묵직한 아우라가 첫인상에 강하게 남습니다.',
  },
  {
    index: 8,
    nameKo: '사수자리',
    nameEn: 'Sagittarius',
    symbol: '♐',
    element: 'fire',
    modality: 'mutable',
    rulerKo: '목성',
    keyword: '확장 · 자유 · 철학적 시야',
    sunTrait: '좁은 틀을 넘어 더 넓은 세상과 의미를 탐구합니다. 낙관적인 시야와 솔직한 태도로 배움과 모험을 즐깁니다.',
    moonTrait: '답답하게 통제받지 않고 자유롭게 생각하고 이동할 때 마음이 살아납니다. 유머와 긍정적 관점으로 위기를 넘기는 힘이 큽니다.',
    venusTrait: '서로의 자유를 존중하며 함께 새로운 경험과 지평을 넓혀 갈 수 있는 솔직하고 유쾌한 동반자에게 끌립니다.',
    marsTrait: '이상과 비전이 뚜렷할 때 폭발적인 실행력이 나옵니다. 먼 목표를 향해 과감하게 도전하는 스케일 큰 행동력을 보입니다.',
    risingTrait: '시원시원하고 개방적인 인상을 주며, 유쾌한 에너지와 넓은 시야가 자연스레 전해집니다.',
  },
  {
    index: 9,
    nameKo: '염소자리',
    nameEn: 'Capricorn',
    symbol: '♑',
    element: 'earth',
    modality: 'cardinal',
    rulerKo: '토성',
    keyword: '책임 · 구조 · 장기적 성취',
    sunTrait: '현실의 무게를 회피하지 않고 체계적인 계획과 끈기로 정상에 오릅니다. 시간이 흐를수록 신뢰와 권위가 깊어지는 대기만성형입니다.',
    moonTrait: '감정에 휩쓸리기보다 스스로 상황을 통제하고 책임을 다할 때 내면의 안정감을 얻습니다. 속정은 깊으나 표현은 담백합니다.',
    venusTrait: '가벼운 설렘보다 신뢰할 수 있고 함께 미래를 설계할 수 있는 성숙하고 성실한 파트너에게 깊은 애정을 느낍니다.',
    marsTrait: '감정적 과열 없이 냉철하고 지속적인 페이스 조절로 어려운 장기 과제를 끝내 성취해 내는 실무형 추진력을 갖췄습니다.',
    risingTrait: '차분하고 어른스러운 품격이 느껴지며, 맡은 일은 반드시 해낼 것 같은 묵직한 신뢰감을 줍니다.',
  },
  {
    index: 10,
    nameKo: '물병자리',
    nameEn: 'Aquarius',
    symbol: '♒',
    element: 'air',
    modality: 'fixed',
    rulerKo: '천왕성·토성',
    keyword: '독창성 · 객관 · 미래 지향',
    sunTrait: '관습에 매몰되지 않고 한 발 떨어진 객관적 시선으로 새로운 가능성을 설계합니다. 독립적인 사고와 독창적 관점이 빛납니다.',
    moonTrait: '감정에 과몰입하기보다 한 걸음 물러나 상황을 이해하려 합니다. 개인의 자유와 가치관이 존중받을 때 편안함을 느낍니다.',
    venusTrait: '지적 자극과 개성을 존중하는 쿨하고 우정 같은 사랑을 선호하며, 구속보다 신뢰 기반의 자유로운 연대를 중시합니다.',
    marsTrait: '남들과 똑같은 방식보다 독창적인 우회로와 시스템을 설계해 문제를 해결하는 혁신적 실행력을 발휘합니다.',
    risingTrait: '어딘가 독특하고 세련된 지성미가 감돌며, 틀에 박히지 않은 자유롭고 깔끔한 인상을 줍니다.',
  },
  {
    index: 11,
    nameKo: '물고기자리',
    nameEn: 'Pisces',
    symbol: '♓',
    element: 'water',
    modality: 'mutable',
    rulerKo: '해왕성·목성',
    keyword: '직관 · 상상력 · 경계 없는 공감',
    sunTrait: '풍부한 상상력과 깊은 공감 능력으로 눈에 보이지 않는 정서와 예술적 울림을 포착합니다. 유연하고 포용적인 영혼을 지녔습니다.',
    moonTrait: '주변의 분위기와 타인의 마음을 스펀지처럼 흡수합니다. 음악·산책·명상처럼 조용히 마음을 비우는 시간이 최고의 회복제입니다.',
    venusTrait: '낭만적이고 섬세하며 상대의 아픔까지 따뜻하게 감싸 안는 깊은 애정을 지녔습니다. 정서적 공명이 사랑의 핵심입니다.',
    marsTrait: '직선적 경쟁보다 직관과 영감이 가리키는 타이밍에 유연하게 움직여 뜻밖의 창조적 성과를 만들어 냅니다.',
    risingTrait: '온화하고 몽환적인 부드러움이 느껴지며, 경계심 없이 다가가기 편안한 따뜻한 인상을 줍니다.',
  },
];

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function norm360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

function solveKepler(Mdeg: number, e: number): number {
  const M = norm360(Mdeg) * DEG2RAD;
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let iter = 0; iter < 6; iter++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
  }
  return E;
}

function getJulianDayFromUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number {
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - 9 * 3_600_000;
  return utcMs / 86_400_000 + 2440587.5;
}

interface OrbitalElements {
  N: number;
  i: number;
  w: number;
  a: number;
  e: number;
  M: number;
}

function computeHeliocentric(el: OrbitalElements): { x: number; y: number; z: number } {
  const E = solveKepler(el.M, el.e);
  const xv = el.a * (Math.cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);

  const N = norm360(el.N) * DEG2RAD;
  const i = el.i * DEG2RAD;
  const vw = v + norm360(el.w) * DEG2RAD;

  const x = r * (Math.cos(N) * Math.cos(vw) - Math.sin(N) * Math.sin(vw) * Math.cos(i));
  const y = r * (Math.sin(N) * Math.cos(vw) + Math.cos(N) * Math.sin(vw) * Math.cos(i));
  const z = r * (Math.sin(vw) * Math.sin(i));
  return { x, y, z };
}

/**
 * Paul Schlyter / Jean Meeus 천문 궤도 공식 기반 행성 지심 황경(0~360°) 산출
 */
function calculatePlanetaryLongitudes(jd: number): {
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  ascendant: number;
} {
  const d = jd - 2451543.5;

  // 1. Sun (geocentric)
  const wSun = 282.9404 + 4.70935e-5 * d;
  const eSun = 0.016709 - 1.151e-9 * d;
  const MSun = norm360(356.047 + 0.9856002585 * d);
  const ESun = solveKepler(MSun, eSun);
  const xvSun = Math.cos(ESun) - eSun;
  const yvSun = Math.sqrt(1 - eSun * eSun) * Math.sin(ESun);
  const vSun = Math.atan2(yvSun, xvSun) * RAD2DEG;
  const rSun = Math.hypot(xvSun, yvSun);
  const sunLon = norm360(vSun + wSun);
  const xs = rSun * Math.cos(sunLon * DEG2RAD);
  const ys = rSun * Math.sin(sunLon * DEG2RAD);
  const Ls = norm360(MSun + wSun);

  // 2. Moon (with primary lunar perturbations)
  const NMoon = norm360(125.1228 - 0.0529538083 * d);
  const iMoon = 5.1454;
  const wMoon = norm360(318.0634 + 0.1643573223 * d);
  const aMoon = 60.2666;
  const eMoon = 0.0549;
  const MMoon = norm360(115.3654 + 13.0649929509 * d);
  const moonPos = computeHeliocentric({
    N: NMoon,
    i: iMoon,
    w: wMoon,
    a: aMoon,
    e: eMoon,
    M: MMoon,
  });
  let moonLon = norm360(Math.atan2(moonPos.y, moonPos.x) * RAD2DEG);

  const Lm = norm360(NMoon + wMoon + MMoon);
  const D = norm360(Lm - Ls);
  const F = norm360(Lm - NMoon);
  const moonPerturb =
    -1.274 * Math.sin((MMoon - 2 * D) * DEG2RAD) +
    0.658 * Math.sin(2 * D * DEG2RAD) -
    0.186 * Math.sin(MSun * DEG2RAD) -
    0.059 * Math.sin((2 * MMoon - 2 * D) * DEG2RAD) -
    0.057 * Math.sin((MMoon - 2 * D + MSun) * DEG2RAD) +
    0.053 * Math.sin((MMoon + 2 * D) * DEG2RAD) +
    0.046 * Math.sin((2 * D - MSun) * DEG2RAD) +
    0.041 * Math.sin((MMoon - MSun) * DEG2RAD) -
    0.035 * Math.sin(D * DEG2RAD) -
    0.031 * Math.sin((MMoon + MSun) * DEG2RAD) -
    0.015 * Math.sin((2 * F - 2 * D) * DEG2RAD) +
    0.011 * Math.sin((MMoon - 4 * D) * DEG2RAD);
  moonLon = norm360(moonLon + moonPerturb);

  // 3. Mercury
  const mercPos = computeHeliocentric({
    N: 48.3313 + 3.24587e-5 * d,
    i: 7.0047 + 5.0e-8 * d,
    w: 29.1241 + 1.01444e-5 * d,
    a: 0.387098,
    e: 0.205635 + 5.59e-10 * d,
    M: 168.6562 + 4.0923344368 * d,
  });
  const mercuryLon = norm360(Math.atan2(mercPos.y + ys, mercPos.x + xs) * RAD2DEG);

  // 4. Venus
  const venusPos = computeHeliocentric({
    N: 76.6799 + 2.4659e-5 * d,
    i: 3.3946 + 2.75e-8 * d,
    w: 54.891 + 1.38374e-5 * d,
    a: 0.72333,
    e: 0.006773 - 1.302e-9 * d,
    M: 48.0052 + 1.6021302244 * d,
  });
  const venusLon = norm360(Math.atan2(venusPos.y + ys, venusPos.x + xs) * RAD2DEG);

  // 5. Mars
  const marsPos = computeHeliocentric({
    N: 49.5574 + 2.11081e-5 * d,
    i: 1.8497 - 1.78e-8 * d,
    w: 286.5016 + 2.92961e-5 * d,
    a: 1.523688,
    e: 0.093405 + 2.516e-9 * d,
    M: 18.6021 + 0.5240207766 * d,
  });
  const marsLon = norm360(Math.atan2(marsPos.y + ys, marsPos.x + xs) * RAD2DEG);

  // 6. Jupiter + Great Inequality
  const Mj = norm360(19.895 + 0.0830853001 * d);
  const Ms = norm360(316.967 + 0.0334442282 * d);
  const jupPos = computeHeliocentric({
    N: 100.4542 + 2.76854e-5 * d,
    i: 1.303 - 1.557e-7 * d,
    w: 273.8777 + 1.64505e-5 * d,
    a: 5.20256,
    e: 0.048498 + 4.469e-9 * d,
    M: Mj,
  });
  const jupPert =
    -0.332 * Math.sin((2 * Mj - 5 * Ms - 67.6) * DEG2RAD) -
    0.056 * Math.sin((2 * Mj - 2 * Ms + 21) * DEG2RAD) +
    0.042 * Math.sin((3 * Mj - 5 * Ms + 21) * DEG2RAD) -
    0.036 * Math.sin((Mj - 2 * Ms) * DEG2RAD) +
    0.022 * Math.cos((Mj - Ms) * DEG2RAD);
  const jupiterLon = norm360(Math.atan2(jupPos.y + ys, jupPos.x + xs) * RAD2DEG + jupPert);

  // 7. Saturn + Great Inequality
  const satPos = computeHeliocentric({
    N: 113.6634 + 2.3898e-5 * d,
    i: 2.4886 - 1.081e-7 * d,
    w: 339.3939 + 2.97661e-5 * d,
    a: 9.55475,
    e: 0.055546 - 9.499e-9 * d,
    M: Ms,
  });
  const satPert =
    0.812 * Math.sin((2 * Mj - 5 * Ms - 67.6) * DEG2RAD) -
    0.229 * Math.cos((2 * Mj - 4 * Ms - 2) * DEG2RAD) +
    0.119 * Math.sin((Mj - 2 * Ms - 3) * DEG2RAD) +
    0.046 * Math.sin((2 * Mj - 6 * Ms - 69) * DEG2RAD);
  const saturnLon = norm360(Math.atan2(satPos.y + ys, satPos.x + xs) * RAD2DEG + satPert);

  // 8. Ascendant (Seoul 37.5665°N, 126.9780°E)
  const T = (jd - 2451545.0) / 36525.0;
  const gmst = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  const lstRad = norm360(gmst + 126.978) * DEG2RAD;
  const epsRad = (23.439291 - 0.0130042 * T) * DEG2RAD;
  const latRad = 37.5665 * DEG2RAD;
  const ascLon = norm360(
    Math.atan2(
      Math.cos(lstRad),
      -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))
    ) * RAD2DEG
  );

  return {
    sun: sunLon,
    moon: moonLon,
    mercury: mercuryLon,
    venus: venusLon,
    mars: marsLon,
    jupiter: jupiterLon,
    saturn: saturnLon,
    ascendant: ascLon,
  };
}

function formatDegree(degInSign: number): string {
  const whole = Math.floor(degInSign);
  const mins = Math.floor((degInSign - whole) * 60);
  return `${String(whole).padStart(2, '0')}° ${String(mins).padStart(2, '0')}'`;
}

function buildPlacement(
  id: PlanetId,
  nameKo: string,
  symbol: string,
  domainKo: string,
  longitude: number
): PlanetPlacement {
  const signIdx = Math.floor(norm360(longitude) / 30) % 12;
  const sign = ZODIAC_SIGNS[signIdx];
  const degreeInSign = norm360(longitude) % 30;

  let interpretation = '';
  switch (id) {
    case 'sun':
      interpretation = sign.sunTrait;
      break;
    case 'moon':
      interpretation = sign.moonTrait;
      break;
    case 'ascendant':
      interpretation = sign.risingTrait;
      break;
    case 'venus':
      interpretation = sign.venusTrait;
      break;
    case 'mars':
      interpretation = sign.marsTrait;
      break;
    case 'mercury':
      interpretation = `수성이 ${sign.nameKo}(${WESTERN_ELEMENT_META[sign.element].nameKo})에 놓여 사고와 말투에 '${sign.keyword}'의 결이 배어납니다. 정보를 받아들이고 설득할 때 ${
        sign.element === 'air'
          ? '객관적 논리와 빠른 연상력'
          : sign.element === 'earth'
            ? '구체적 근거와 실용적 구조화'
            : sign.element === 'fire'
              ? '직관적 핵심 파악과 명쾌한 표현'
              : '깊은 맥락 이해와 정서적 공감'
      }이 두드러집니다.`;
      break;
    case 'jupiter':
      interpretation = `행운과 확장의 목성이 ${sign.nameKo}에 자리해, '${sign.keyword}'와 맞닿은 태도로 세상과 교류할 때 기회와 후원이 자연스럽게 넓어집니다.`;
      break;
    case 'saturn':
      interpretation = `성숙과 책임의 토성이 ${sign.nameKo}에 놓여 있습니다. 초반에는 '${sign.keyword}' 영역에서 스스로 기준이 엄격하게 느껴지지만, 꾸준히 연마할수록 중반 이후 가장 단단한 전문성과 권위로 돌아옵니다.`;
      break;
  }

  return {
    id,
    nameKo,
    symbol,
    domainKo,
    longitude: norm360(longitude),
    sign,
    degreeInSign,
    degreeLabel: formatDegree(degreeInSign),
    interpretation,
  };
}

function detectAspects(placements: PlanetPlacement[]): AspectItem[] {
  const definitions: {
    angle: number;
    orb: number;
    typeKo: AspectItem['typeKo'];
    harmony: AspectItem['harmony'];
    meaning: string;
  }[] = [
    {
      angle: 0,
      orb: 7,
      typeKo: '합(0°)',
      harmony: '융합',
      meaning: '두 행성의 에너지가 한 지점에 강하게 결합하여 성격의 뚜렷한 핵심 축을 형성합니다.',
    },
    {
      angle: 120,
      orb: 6,
      typeKo: '삼합(120°)',
      harmony: '조화',
      meaning: '같은 원소끼리 자연스럽게 호응하여 큰 힘을 들이지 않아도 재능이 매끄럽게 발현됩니다.',
    },
    {
      angle: 60,
      orb: 5,
      typeKo: '육분(60°)',
      harmony: '조화',
      meaning: '서로 다른 기질이 생산적인 기회를 만들어 내며, 의식적으로 활용할수록 시너지가 커집니다.',
    },
    {
      angle: 90,
      orb: 6,
      typeKo: '사각(90°)',
      harmony: '긴장',
      meaning: '내적 긴장과 갈등을 통해 돌파력을 키우는 각도로, 조율을 배우는 순간 큰 성취의 원동력이 됩니다.',
    },
    {
      angle: 180,
      orb: 7,
      typeKo: '충(180°)',
      harmony: '긴장',
      meaning: '상반된 두 욕구가 마주 보며 균형을 요구합니다. 양극단 사이에서 중용을 잡을 때 시야가 크게 넓어집니다.',
    },
  ];

  const found: AspectItem[] = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i];
      const b = placements[j];
      // Exclude Jupiter-Saturn slow generational pair if minor; keep all personal-involved pairs
      const isSlowPair =
        (a.id === 'jupiter' && b.id === 'saturn') || (a.id === 'saturn' && b.id === 'jupiter');
      if (isSlowPair) continue;

      let diff = Math.abs(a.longitude - b.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const def of definitions) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          found.push({
            id: `${a.id}-${b.id}-${def.angle}`,
            planetA: a.id,
            planetB: b.id,
            labelKo: `${a.nameKo} ${def.typeKo} ${b.nameKo}`,
            typeKo: def.typeKo,
            harmony: def.harmony,
            orb: Number(orb.toFixed(1)),
            summary: `${a.nameKo}(${a.domainKo})와 ${b.nameKo}(${b.domainKo})의 ${def.harmony} 각도 (오차 ${orb.toFixed(1)}°)`,
            detail: `${a.sign.nameKo}의 ${a.nameKo}과 ${b.sign.nameKo}의 ${b.nameKo}이 ${def.typeKo}을 이룹니다. ${def.meaning}`,
          });
          break;
        }
      }
    }
  }

  return found.sort((a, b) => a.orb - b.orb).slice(0, 5);
}

function buildCrossInsight(
  saju: SajuChart,
  sun: PlanetPlacement,
  moon: PlanetPlacement,
  venus: PlanetPlacement,
  dominantWest: WesternElementBalance
): CrossInsight {
  const strongestSaju = [...saju.elementBalance].sort(
    (a, b) => b.weightedScore - a.weightedScore
  )[0];

  const sajuActive = strongestSaju.element === 'wood' || strongestSaju.element === 'fire';
  const westActive = dominantWest.element === 'fire' || dominantWest.element === 'air';

  const sajuGrounded = strongestSaju.element === 'earth' || strongestSaju.element === 'metal';
  const westGrounded = dominantWest.element === 'earth';

  const sajuDeep = strongestSaju.element === 'water';
  const westDeep = dominantWest.element === 'water';

  let headline = '';
  let sharedTheme = '';
  let contrastNote = '';

  if (
    (sajuActive && westActive) ||
    (sajuGrounded && westGrounded) ||
    (sajuDeep && westDeep)
  ) {
    headline = `동양의 ${strongestSaju.hangul}(${strongestSaju.hanja}) 기운과 서양의 ${dominantWest.nameKo} 원소가 한 방향을 가리키는 일관된 명식`;
    sharedTheme = `사주 원국에서 ${strongestSaju.hangul}(${strongestSaju.hanja})이 ${strongestSaju.percentage}%로 주도권을 쥐고 있는 동시에, 네이탈 차트에서도 ${dominantWest.nameKo} 원소가 ${dominantWest.percentage}%로 가장 강하게 배치되어 있습니다. 겉으로 드러나는 사회적 태도와 내면의 별자리 기질이 같은 방향을 보고 있어, 스스로 납득한 목표에 몰입할 때 에너지 손실이 적고 추진력이 선명합니다.`;
    contrastNote = `다만 같은 결의 기운이 동서양 양쪽에서 증폭되므로, 사주 용신인 ${ELEMENT_META[saju.yongsin.primary].hangul}(${ELEMENT_META[saju.yongsin.primary].hanja})의 보완 습관을 의식적으로 챙길 때 치우침 없이 균형이 완성됩니다.`;
  } else {
    const sunMoonLabel =
      sun.sign.index === moon.sign.index
        ? `${sun.sign.nameKo}(태양·달 합일)`
        : `${sun.sign.nameKo}·${moon.sign.nameKo}`;
    headline = `사주의 '${saju.pillars.day.ganjiHangul}' 결 위에 '${sunMoonLabel}'의 입체적 반전이 겹치는 명식`;
    sharedTheme = `동양 만세력에서는 ${saju.dayMaster.hangul}(${saju.dayMaster.hanja}) 일간과 ${saju.gyeokguk.name}을 중심으로 ${strongestSaju.hangul}(${strongestSaju.hanja})의 색채가 두드러지지만, 서양 천궁도에서는 ${
      sun.sign.index === moon.sign.index
        ? `태양과 달이 나란히 ${sun.sign.nameKo}에 모여`
        : `태양 ${sun.sign.nameKo}·달 ${moon.sign.nameKo}을 축으로`
    } ${dominantWest.nameKo} 원소(${dominantWest.percentage}%)가 작동합니다.`;
    contrastNote = `두 체계가 서로 다른 결을 보여준다는 것은 '모순'이 아니라 상황에 따라 꺼내 쓸 수 있는 무기가 두 겹이라는 뜻입니다. 공적인 자리에서는 사주 격국(${saju.gyeokguk.name})의 방식이, 개인적인 감정과 취향에서는 달 ${moon.sign.nameKo}의 감수성이 자연스럽게 앞장섭니다.`;
  }

  return {
    headline,
    sharedTheme,
    contrastNote,
    synthesisPoints: [
      {
        label: '자아의 두 얼굴 (일간 × 태양)',
        content: `사주 일간 '${saju.dayMaster.hangul}(${saju.dayMaster.hanja}) · ${saju.dayMaster.natureTitle}'의 본성에 태양 '${sun.sign.nameKo}(${sun.sign.keyword})'의 삶의 방향성이 더해져 자기 정체성을 완성합니다.`,
      },
      {
        label: '속마음과 휴식 (일지 × 달)',
        content: `사주 일지 '${saju.pillars.day.branchTenGod}'의 생활 감각과 달 '${moon.sign.nameKo}'의 정서 패턴이 맞물려, 지칠 때 나를 회복시키는 가장 정확한 휴식법을 알려줍니다.`,
      },
      {
        label: '애정과 취향 (인연성 × 금성)',
        content: `사주의 관계 구조에 금성 '${venus.sign.nameKo}'의 사랑 방식이 겹쳐져, ${venus.sign.venusTrait}`,
      },
    ],
    seoldamQuote: `동쪽의 만세력과 서쪽의 별자리를 책상 위에 나란히 펼쳐 보니 참 흥미롭군요. 사주로는 ${saju.pillars.day.ganjiHangul}일주의 뼈대가, 별자리로는 ${sun.sign.nameKo} 태양과 ${moon.sign.nameKo} 달의 온도가 겹쳐 보입니다. 어느 한쪽만 보지 마시고 두 지도를 함께 쥐고 걸어가 보세요.`,
    footnote: `동양 24절기 원국(${saju.pillars.day.ganjiHanja}) × 서양 열대 황도대(태양 ${sun.sign.symbol} ${sun.degreeLabel} · 달 ${moon.sign.symbol} ${moon.degreeLabel}) 교차 분석`,
  };
}

export function calculateAstrologyChart(saju: SajuChart): AstrologyChart {
  const { year, month, day, hour, minute } = saju.solarDate;
  const jd = getJulianDayFromUtc(year, month, day, hour, minute);
  const lons = calculatePlanetaryLongitudes(jd);

  const sun = buildPlacement('sun', '태양', '☉', '자아 · 삶의 방향', lons.sun);
  const moon = buildPlacement('moon', '달', '☽', '감정 · 내면 안정', lons.moon);
  const mercury = buildPlacement('mercury', '수성', '☿', '사고 · 소통 방식', lons.mercury);
  const venus = buildPlacement('venus', '금성', '♀', '애정 · 미적 취향', lons.venus);
  const mars = buildPlacement('mars', '화성', '♂', '추진력 · 실행 에너지', lons.mars);
  const jupiter = buildPlacement('jupiter', '목성', '♃', '확장 · 행운의 통로', lons.jupiter);
  const saturn = buildPlacement('saturn', '토성', '♄', '책임 · 장기 성숙', lons.saturn);

  const ascendant = saju.input.unknownTime
    ? null
    : buildPlacement('ascendant', '상승궁', 'ASC', '첫인상 · 사회적 페르소나', lons.ascendant);

  const placements: PlanetPlacement[] = [
    sun,
    moon,
    ...(ascendant ? [ascendant] : []),
    mercury,
    venus,
    mars,
    jupiter,
    saturn,
  ];

  // 4-Element & 3-Modality count (Sun & Moon weighted 1.5x, others 1x)
  const elCounts: Record<WesternElement, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const elWeights: Record<WesternElement, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modCounts: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  const modWeights: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };

  for (const p of placements) {
    const w = p.id === 'sun' || p.id === 'moon' ? 1.5 : 1.0;
    elCounts[p.sign.element] += 1;
    elWeights[p.sign.element] += w;
    modCounts[p.sign.modality] += 1;
    modWeights[p.sign.modality] += w;
  }

  const totalElW = Object.values(elWeights).reduce((a, b) => a + b, 0) || 1;
  const elements: WesternElementBalance[] = (['fire', 'earth', 'air', 'water'] as WesternElement[]).map(
    (el) => ({
      element: el,
      nameKo: WESTERN_ELEMENT_META[el].nameKo,
      count: elCounts[el],
      percentage: Math.round((elWeights[el] / totalElW) * 100),
      color: WESTERN_ELEMENT_META[el].color,
    })
  );

  const modLabels: Record<Modality, string> = {
    cardinal: '활동궁(Cardinal · 시작)',
    fixed: '고정궁(Fixed · 지속)',
    mutable: '변통궁(Mutable · 유연)',
  };
  const totalModW = Object.values(modWeights).reduce((a, b) => a + b, 0) || 1;
  const modalities: ModalityBalance[] = (['cardinal', 'fixed', 'mutable'] as Modality[]).map(
    (m) => ({
      modality: m,
      nameKo: modLabels[m],
      count: modCounts[m],
      percentage: Math.round((modWeights[m] / totalModW) * 100),
    })
  );

  const dominantElement = [...elements].sort((a, b) => b.percentage - a.percentage)[0];
  const dominantModality = [...modalities].sort((a, b) => b.percentage - a.percentage)[0];
  const aspects = detectAspects(placements);
  const crossInsight = buildCrossInsight(saju, sun, moon, venus, dominantElement);

  return {
    placements,
    sun,
    moon,
    ascendant,
    mercury,
    venus,
    mars,
    jupiter,
    saturn,
    elements,
    modalities,
    dominantElement,
    dominantModality,
    aspects,
    crossInsight,
  };
}
