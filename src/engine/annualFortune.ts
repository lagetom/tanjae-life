import { AstrologyChart, VEDIC_ELEMENT_META, VedicElement } from './astrology';
import {
  BRANCHES,
  ELEMENT_META,
  STEMS,
  getLifeStage,
  getTenGod,
  getTenGodGroup,
} from './manseryeok';
import {
  BranchInfo,
  ElementType,
  SajuChart,
  StemInfo,
  TenGod,
  TenGodGroup,
} from './sajuTypes';

export interface YearPillarSummary {
  year: number;
  ganjiHangul: string;
  ganjiHanja: string;
  nickname: string;
  stem: StemInfo;
  branch: BranchInfo;
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  lifeStage: string;
  isYongsinYear: boolean;
  isCheoneulYear: boolean;
  interactionsWithChart: string[];
}

export interface MonthlyReview2026 {
  month: number; // 1..12
  solarTermLabel: string;
  ganjiHangul: string;
  ganjiHanja: string;
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  grade: '빛난 달' | '다진 달' | '버틴 달';
  keyword: string;
  retrospect: string;
  reflectionQuestion: string;
  seoldamNote: string;
}

export interface YearEndReview2026 {
  pillar: YearPillarSummary;
  headline: string;
  summaryParagraphs: string[];
  retrospectItems: {
    label: string;
    content: string;
  }[];
  monthlyReviews: MonthlyReview2026[];
  brightMonths: number[];
  toughMonths: number[];
  astrologyRecap: string;
  seoldamNote: {
    tag: string;
    quote: string;
    footnote: string;
  };
}

export interface MonthlyFlow2027 {
  month: number; // 1..12
  solarTermLabel: string;
  ganjiHangul: string;
  ganjiHanja: string;
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  grade: '호조' | '안정' | '점검';
  keyword: string;
  advice: string;
  seoldamTip: string;
}

export interface NewYearForecast2027 {
  pillar: YearPillarSummary;
  headline: string;
  overviewParagraphs: string[];
  domainForecasts: {
    id: 'career' | 'wealth' | 'romance' | 'health';
    label: string;
    theme: string;
    detail: string;
  }[];
  monthlyFlows: MonthlyFlow2027[];
  peakMonths: number[];
  careMonths: number[];
  astrologyTransit2027: {
    headline: string;
    firstHalf: string;
    secondHalf: string;
  };
  seoldamNote: {
    tag: string;
    quote: string;
    footnote: string;
  };
}

export interface AnnualReportBundle {
  review2026: YearEndReview2026;
  forecast2027: NewYearForecast2027;
}

// 천을귀인 지지 매핑 (일간 기준)
const CHEONEUL_BRANCHES: Record<number, number[]> = {
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

function detectYearInteractions(chart: SajuChart, yearStemIdx: number, yearBranchIdx: number): string[] {
  const pillars = [
    chart.pillars.year,
    chart.pillars.month,
    chart.pillars.day,
    ...(chart.pillars.hour ? [chart.pillars.hour] : []),
  ];
  const notes: string[] = [];
  const seen = new Set<string>();

  const stemCombinePairs: [number, number, string][] = [
    [0, 5, '갑기합(甲己合)'],
    [1, 6, '을경합(乙庚合)'],
    [2, 7, '병신합(丙辛合)'],
    [3, 8, '정임합(丁壬合)'],
    [4, 9, '무계합(戊癸合)'],
  ];

  const branchCombinePairs: [number, number, string][] = [
    [0, 1, '자축합(子丑合)'],
    [2, 11, '인해합(寅亥合)'],
    [3, 10, '묘술합(卯戌合)'],
    [4, 9, '진유합(辰酉合)'],
    [5, 8, '사신합(巳申合)'],
    [6, 7, '오미합(午未合)'],
  ];

  const branchClashPairs: [number, number, string][] = [
    [0, 6, '자오충(子午沖)'],
    [1, 7, '축미충(丑未沖)'],
    [2, 8, '인신충(寅申沖)'],
    [3, 9, '묘유충(卯酉沖)'],
    [4, 10, '진술충(辰戌沖)'],
    [5, 11, '사해충(巳亥沖)'],
  ];

  for (const p of pillars) {
    for (const [s1, s2, label] of stemCombinePairs) {
      if (
        (yearStemIdx === s1 && p.stem.index === s2) ||
        (yearStemIdx === s2 && p.stem.index === s1)
      ) {
        const key = `sc-${label}-${p.position}`;
        if (!seen.has(key)) {
          seen.add(key);
          notes.push(`${p.label} 천간과 ${label}`);
        }
      }
    }
    for (const [b1, b2, label] of branchCombinePairs) {
      if (
        (yearBranchIdx === b1 && p.branch.index === b2) ||
        (yearBranchIdx === b2 && p.branch.index === b1)
      ) {
        const key = `bc-${label}-${p.position}`;
        if (!seen.has(key)) {
          seen.add(key);
          notes.push(`${p.label} 지지와 ${label}`);
        }
      }
    }
    for (const [b1, b2, label] of branchClashPairs) {
      if (
        (yearBranchIdx === b1 && p.branch.index === b2) ||
        (yearBranchIdx === b2 && p.branch.index === b1)
      ) {
        const key = `ch-${label}-${p.position}`;
        if (!seen.has(key)) {
          seen.add(key);
          notes.push(`${p.label} 지지와 ${label}`);
        }
      }
    }
  }

  // 자형(오오자형) 체크
  if (yearBranchIdx === 6 && pillars.some((p) => p.branch.index === 6)) {
    notes.push('원국 오(午)와 오오자형(午午自刑)');
  }

  return notes.slice(0, 3);
}

function buildYearSummary(
  chart: SajuChart,
  year: number,
  stemIdx: number,
  branchIdx: number,
  nickname: string
): YearPillarSummary {
  const stem = STEMS[stemIdx];
  const branch = BRANCHES[branchIdx];
  const mainHidden = STEMS[branch.hiddenStems[branch.hiddenStems.length - 1]];
  const stemTenGod = getTenGod(chart.dayMaster, stem);
  const branchTenGod = getTenGod(chart.dayMaster, mainHidden);
  const lifeStage = getLifeStage(chart.dayMaster, branchIdx);

  const yong = chart.yongsin.primary;
  const secondary = chart.yongsin.secondary;
  const isYongsinYear =
    stem.element === yong ||
    branch.element === yong ||
    stem.element === secondary ||
    branch.element === secondary;

  const isCheoneulYear = CHEONEUL_BRANCHES[chart.dayMaster.index].includes(branchIdx);
  const interactionsWithChart = detectYearInteractions(chart, stemIdx, branchIdx);

  return {
    year,
    ganjiHangul: `${stem.hangul}${branch.hangul}`,
    ganjiHanja: `${stem.hanja}${branch.hanja}`,
    nickname,
    stem,
    branch,
    stemTenGod,
    branchTenGod,
    lifeStage,
    isYongsinYear,
    isCheoneulYear,
    interactionsWithChart,
  };
}

const TEN_GOD_YEAR_THEME_2026: Record<
  TenGodGroup,
  {
    headline: string;
    experience: string;
    gained: string;
    letGo: string;
  }
> = {
  비겁: {
    headline: '주체성과 경쟁심이 불타올라 스스로의 기준을 확인한 한 해',
    experience:
      '2026 병오년은 비겁(자아·동료·경쟁)의 기운이 강하게 들어와, 남의 흐름을 따르기보다 내 방식대로 밀어붙이고 싶은 욕구가 컸던 해입니다. 주변 사람들과의 비교나 독립에 대한 고민이 유독 잦았을 가능성이 높습니다.',
    gained: '외부 시선에 흔들리지 않고 스스로 버텨낼 수 있는 단단한 자존감과 내 편·남의 편을 구분하는 분별력',
    letGo: '모든 일을 혼자 짊어지려던 과도한 승부욕과, 내 기준에 맞추지 못하는 타인을 향한 조급함',
  },
  식상: {
    headline: '머릿속 구상을 바깥으로 쏟아내며 새로운 판을 넓힌 표현의 해',
    experience:
      '2026 병오년은 식상(표현·창의·실행)의 불꽃이 거세게 일어난 해였습니다. 가만히 안주하기 답답해 새로운 일을 벌이거나, 말·글·기획·이직 등 바깥으로 자신을 드러내는 시도가 활발했을 흐름입니다.',
    gained: '직접 부딪히며 얻은 실전 감각과 "나도 이런 걸 만들어 낼 수 있다"는 창조적 자신감',
    letGo: '흥미가 생길 때마다 벌려 놓은 미완성 계획들과, 에너지가 분산되어 쌓인 체력 과부하',
  },
  재성: {
    headline: '현실적인 성과와 재물, 일상의 확장을 향해 분주히 달린 한 해',
    experience:
      '2026 병오년은 재성(결과·재물·현실)의 기운이 강하게 작동해 실질적인 수익, 커리어 성과, 생활 반경 확장에 관심이 집중되었던 해입니다. 해야 할 일과 챙겨야 할 사람이 많아 숨 가쁘게 지나갔을 가능성이 큽니다.',
    gained: '돈과 시간의 가치를 냉정하게 가늠하는 현실 감각과 손에 잡히는 실무 경험',
    letGo: '성과 숫자에만 매달리느라 놓쳐버린 마음의 여유와 과도한 일정 욕심',
  },
  관성: {
    headline: '책임과 역할의 무게를 견디며 사회적 그릇을 키운 단련의 해',
    experience:
      '2026 병오년은 관성(책임·명예·규율)의 뜨거운 압력이 들어와 맡은 역할이 커지거나, 직장·학업·관계에서 평가와 기준이 한층 엄격하게 느껴졌던 해입니다. 부담은 컸지만 그만큼 내공이 빠르게 압축되었습니다.',
    gained: '어려운 과제도 끝내 수습해 낸 신뢰도와 한 단계 성숙해진 사회적 평판',
    letGo: '완벽해야 한다는 강박과 타인의 평가에 지나치게 긴장하던 마음의 갑옷',
  },
  인성: {
    headline: '생각을 가다듬고 다음 도약을 위한 배움과 명분을 쌓은 한 해',
    experience:
      '2026 병오년은 인성(학습·통찰·후원)의 온기가 들어와 자격·공부·문서·전략 구상에 마음이 향하고, 주변의 조언이나 뜻밖의 도움을 통해 방향을 재정비했을 가능성이 높은 해입니다.',
    gained: '흔들리지 않는 지식·자격의 기반과 나를 진심으로 지지해 주는 귀한 조력자',
    letGo: '충분히 준비되었음에도 실행을 미루게 만들던 지나친 신중함과 머릿속 고민',
  },
};

const TEN_GOD_YEAR_THEME_2027: Record<
  TenGodGroup,
  {
    headline: string;
    overview: string;
    career: string;
    wealth: string;
    romance: string;
    health: string;
  }
> = {
  비겁: {
    headline: '자립의 기틀을 다지고 나만의 영역을 선명히 세우는 해',
    overview:
      '정미년의 은은한 불(丁)과 단단한 흙(未)이 주체성의 기운을 정돈해 줍니다. 2026년의 거친 추진력이 2027년에는 실속 있는 독립과 협업의 균형으로 성숙합니다.',
    career: '자기 이름을 내건 프로젝트나 독립적 권한이 있는 직무에서 존재감이 커집니다. 다만 동료와의 역할 분담을 초기에 명확히 문서화하는 것이 핵심입니다.',
    wealth: '수입을 늘리는 것만큼 지인 거래·충동 지출을 막는 방어가 중요합니다. 자동 저축과 장기 고정 자산으로 현금을 묶어 두면 연말에 든든한 결실이 남습니다.',
    romance: '서로의 개인 시간을 존중해 주는 대등한 관계에서 편안함이 커집니다. 새로운 인연은 취향·관심사가 겹치는 모임이나 커뮤니티에서 자연스레 열립니다.',
    health: '어깨·목의 긴장과 과로 누적을 풀기 위해 주 2~3회 규칙적인 유산소와 스트레칭 루틴을 고정해 두는 것이 좋습니다.',
  },
  식상: {
    headline: '갈고닦은 재능이 실질적인 성과와 수익으로 익어가는 해',
    overview:
      '2026년에 쏘아 올린 아이디어와 시도가 2027년 정미년의 미토(未土) 위에서 차분히 형태를 갖추고 결실을 맺습니다. 표현력에 현실 감각이 더해지는 시기입니다.',
    career: '기획·콘텐츠·브랜딩·전문 기술 등 내 결과물을 외부에 공개할수록 기회가 따라옵니다. 하반기로 갈수록 실력이 평판으로 굳어집니다.',
    wealth: '본업 외 부수입, 프로젝트 성과급, 재능 기반 수익 파이프라인이 열리기 좋은 흐름입니다. 단기 유행보다 지속 가능한 수익 구조를 선택하세요.',
    romance: '다정한 표현력과 유쾌한 대화가 매력을 높여 줍니다. 기존 연인과는 함께 새로운 취미나 여행을 즐기면 관계에 신선한 온기가 돌아옵니다.',
    health: '에너지 출력이 활발한 해이므로 수면 시간 확보와 소화기·위장 리듬 관리가 컨디션을 지키는 핵심입니다.',
  },
  재성: {
    headline: '흩어졌던 노력이 눈에 보이는 자산과 안정으로 모이는 결실의 해',
    overview:
      '정미년은 흙(未)의 창고 기운이 더해져 재물과 실무 성과를 차곡차곡 담아내기에 매우 유리한 구조입니다. 막연한 계획이 현실의 숫자로 증명되는 해입니다.',
    career: '성과 지표가 분명한 비즈니스, 영업, 운영, 재무, 사업 확장 영역에서 두각을 나타냅니다. 실리적인 협상력과 마감 준수가 승진·보상으로 직결됩니다.',
    wealth: '현금 흐름이 원활해지고 자산 구조를 재정비할 좋은 타이밍입니다. 분산 투자와 중장기 자산 축적에 집중하면 향후 몇 년의 든든한 발판이 됩니다.',
    romance: '신뢰할 수 있고 생활 감각이 잘 맞는 현실적인 인연과의 결속이 깊어집니다. 관계의 진전이나 미래 계획을 구체적으로 논의하기 좋은 해입니다.',
    health: '일정이 빡빡해지기 쉬워 식사 불규칙과 만성 피로를 경계해야 합니다. 분기마다 짧은 완전 휴식일을 미리 달력에 비워 두세요.',
  },
  관성: {
    headline: '신뢰와 품격이 직위·합격·인정으로 보답받는 도약의 해',
    overview:
      '2026년의 강렬한 압박을 지나, 2027년 정미년에는 정돈된 질서와 안정된 평가가 따릅니다. 묵묵히 쌓아 온 실력이 공식적인 타이틀이나 역할 상승으로 이어집니다.',
    career: '승진, 이직 합격, 전문 자격 취득, 팀 리딩 등 사회적 위상이 한 계단 올라가는 흐름입니다. 원칙과 마감을 지키는 정공법이 가장 빛을 발합니다.',
    wealth: '투기적 변동보다 안정적인 연봉 상승, 고정 수입 확대, 신용 기반의 건전한 자산 관리가 가장 큰 수익을 안겨 줍니다.',
    romance: '진지하고 책임감 있는 인연이 찾아오거나, 기존 관계가 한층 단단한 신뢰 단계로 자리 잡습니다. 솔직하고 예의 있는 대화가 오해를 막아 줍니다.',
    health: '책임감으로 인한 신경성 피로와 수면 질 저하를 주의하세요. 저녁 시간의 디지털 디톡스와 따뜻한 반신욕이 회복에 효과적입니다.',
  },
  인성: {
    headline: '지혜와 문서·귀인의 복이 모여 다음 10년의 기반을 다지는 해',
    overview:
      '정미년의 온화한 기운이 내면의 통찰과 배움을 깊게 숙성시켜 줍니다. 조급히 달리기보다 방향을 정교하게 설계하고 귀한 조력자와 계약·문서 운을 챙기는 해입니다.',
    career: '학위·자격·연구·전략 기획·교육 분야에서 성과가 뚜렷하며, 윗사람이나 멘토의 추천으로 좋은 무대에 오를 가능성이 높습니다.',
    wealth: '계약서·부동산·지적자산·장기 우량 투자 등 문서와 시간이 가치를 키워 주는 영역에서 안정적인 재물운이 열립니다.',
    romance: '마음이 편안하고 대화가 깊게 통하는 정서적 안식처 같은 인연에 끌립니다. 서두르지 않고 천천히 신뢰를 쌓을수록 오래가는 관계가 됩니다.',
    health: '생각이 많아 활동량이 줄어들기 쉬운 해입니다. 매일 20~30분 가볍게 햇볕을 쬐며 걷는 습관이 몸과 머리를 동시에 맑게 해 줍니다.',
  },
};

const DAY_BRANCH_COMBINE_MAP: Record<number, number> = {
  0: 1,
  1: 0,
  2: 11,
  11: 2,
  3: 10,
  10: 3,
  4: 9,
  9: 4,
  5: 8,
  8: 5,
  6: 7,
  7: 6,
};

function getMonthlyReview2026(
  chart: SajuChart,
  month: number
): MonthlyReview2026 {
  // 2026년 1월(소한): 을사년 기축월(己丑), 2월(입춘)~12월(대설): 병오년 경인(庚寅)~경자(庚子)
  const monthGanjiTable: {
    month: number;
    term: string;
    stemIdx: number;
    branchIdx: number;
  }[] = [
    { month: 1, term: '소한 · 을사 마무리', stemIdx: 5, branchIdx: 1 },   // 기축
    { month: 2, term: '입춘 · 병오 시작', stemIdx: 6, branchIdx: 2 },     // 경인
    { month: 3, term: '경칩 · 봄의 기지개', stemIdx: 7, branchIdx: 3 },   // 신묘
    { month: 4, term: '청명 · 흐름 정비', stemIdx: 8, branchIdx: 4 },     // 임진
    { month: 5, term: '입하 · 열기 상승', stemIdx: 9, branchIdx: 5 },     // 계사
    { month: 6, term: '망종 · 병오 본기', stemIdx: 0, branchIdx: 6 },     // 갑오
    { month: 7, term: '소서 · 한여름 결실', stemIdx: 1, branchIdx: 7 },   // 을미
    { month: 8, term: '입추 · 국면 전환', stemIdx: 2, branchIdx: 8 },     // 병신
    { month: 9, term: '백로 · 성과 수확', stemIdx: 3, branchIdx: 9 },     // 정유
    { month: 10, term: '한로 · 추수 정리', stemIdx: 4, branchIdx: 10 },   // 무술
    { month: 11, term: '입동 · 숨 고르기', stemIdx: 5, branchIdx: 11 },   // 기해
    { month: 12, term: '대설 · 연말 결산', stemIdx: 6, branchIdx: 0 },    // 경자
  ];

  const entry = monthGanjiTable[month - 1];
  const stem = STEMS[entry.stemIdx];
  const branch = BRANCHES[entry.branchIdx];
  const mainHidden = STEMS[branch.hiddenStems[branch.hiddenStems.length - 1]];
  const stemTenGod = getTenGod(chart.dayMaster, stem);
  const branchTenGod = getTenGod(chart.dayMaster, mainHidden);

  const yong1 = chart.yongsin.primary;
  const yong2 = chart.yongsin.secondary;
  const dayBranchIdx = chart.pillars.day.branch.index;
  const isDayClash = (entry.branchIdx + 6) % 12 === dayBranchIdx;
  const isDayCombine = DAY_BRANCH_COMBINE_MAP[dayBranchIdx] === entry.branchIdx;
  const isCheoneul = CHEONEUL_BRANCHES[chart.dayMaster.index].includes(entry.branchIdx);

  let score = 0;
  if (stem.element === yong1) score += 2;
  if (branch.element === yong1) score += 3;
  if (stem.element === yong2) score += 1;
  if (branch.element === yong2) score += 2;
  if (isCheoneul) score += 2;
  if (isDayCombine) score += 1;
  if (isDayClash) score -= 2;

  const grade: MonthlyReview2026['grade'] =
    score >= 3 ? '빛난 달' : score <= -1 ? '버틴 달' : '다진 달';

  const group = getTenGodGroup(branchTenGod);
  const groupKeywordMap: Record<TenGodGroup, string> = {
    비겁: '주도·자립',
    식상: '표현·도전',
    재성: '실속·확장',
    관성: '책임·평가',
    인성: '배움·재정비',
  };

  const keyword = isCheoneul
    ? `${groupKeywordMap[group]} · 귀인`
    : isDayClash
      ? `${groupKeywordMap[group]} · 전환`
      : isDayCombine
        ? `${groupKeywordMap[group]} · 합심`
        : groupKeywordMap[group];

  const groupPastFlow: Record<TenGodGroup, string> = {
    비겁: `${branchTenGod}(비겁)의 기운이 들어와 스스로 중심을 세우고 내 기준대로 밀고 나갔던 시기였습니다. 주변과의 비교 속에서도 나만의 보폭을 확인했을 가능성이 큽니다.`,
    식상: `${branchTenGod}(식상)의 기운이 활발해 머릿속 생각을 바깥으로 꺼내 보거나 새로운 시도·표현에 마음이 움직였던 시기였습니다. 직접 부딪히며 손에 익힌 감각이 남았습니다.`,
    재성: `${branchTenGod}(재성)의 현실 감각이 또렷해져 일의 결과, 재정 흐름, 챙겨야 할 약속과 인간관계로 분주히 움직였던 시기였습니다. 현실적인 판단력이 한층 자랐습니다.`,
    관성: `${branchTenGod}(관성)의 무게가 실리며 맡은 역할이나 마감, 주변의 기대에 부응하느라 긴장감이 높았던 시기였습니다. 끝까지 책임져 낸 만큼 신뢰의 기반이 두꺼워졌습니다.`,
    인성: `${branchTenGod}(인성)의 기운이 머물며 한 걸음 물러나 생각을 정리하거나 배움·문서·조언을 통해 다음 방향을 가다듬었던 시기였습니다. 조용한 내면의 축적이 이루어졌습니다.`,
  };

  const gradeReflectionTail: Record<MonthlyReview2026['grade'], string> = {
    '빛난 달': isCheoneul
      ? `여기에 천을귀인과 ${ELEMENT_META[yong1].hangul}(${ELEMENT_META[yong1].hanja}) 흐름까지 보태져, 막히던 일에 숨통이 트이거나 고마운 사람의 도움으로 뜻밖의 돌파구가 열렸을 가능성이 높습니다.`
      : `명식의 균형을 돕는 ${ELEMENT_META[yong1].hangul}(${ELEMENT_META[yong1].hanja}) 기운이 맞물려 애쓴 만큼 호응이 돌아오고, 스스로도 '해냈다'는 효능감을 맛보셨을 달입니다.`,
    '다진 달': isDayCombine
      ? `일지와 부드럽게 합(合)을 이루며 무리한 파동 없이 일상의 호흡과 주변 관계를 차분히 다져 간 안정적인 한 달이었습니다.`
      : `크게 요동치기보다 천간 ${stemTenGod}의 과제를 묵묵히 소화하며 다음 계절을 버틸 실력과 생활 리듬을 쌓아 둔 단단한 달이었습니다.`,
    '버틴 달': isDayClash
      ? `일지와의 충(沖) 기운이 스치며 예상치 못한 일정 변동이나 관계의 마찰, 마음의 흔들림이 있었을 수 있습니다. 그 파도를 넘기며 불필요한 인연과 습관을 덜어낸 전환점이 되었습니다.`
      : `에너지 소모가 크거나 원하는 속도로 일이 풀리지 않아 유독 길게 느껴졌을 수 있는 달입니다. 그럼에도 포기하지 않고 건너오신 것 자체가 값진 맷집으로 남았습니다.`,
  };

  const reflectionQuestionByGroup: Record<TenGodGroup, string> = {
    비겁: `${month}월에 남의 시선보다 내 소신을 지켜내어 스스로 뿌듯했던 순간은 언제였나요?`,
    식상: `${month}월에 시도해 본 표현·도전 가운데 내년에도 이어 가고 싶은 불씨는 무엇인가요?`,
    재성: `${month}월에 들인 시간과 비용 중 가장 값진 보람으로 돌아온 선택은 무엇이었나요?`,
    관성: `${month}월에 무거웠던 책임이나 과제를 끝내 마쳐낸 스스로에게 어떤 칭찬을 해 주고 싶나요?`,
    인성: `${month}월에 얻은 깨달음이나 고마웠던 조언 중 연말에도 기억하고 싶은 문장은 무엇인가요?`,
  };

  const seoldamNoteByGrade: Record<MonthlyReview2026['grade'], string> = {
    '빛난 달': `${month}월은 순풍이 고맙게 불어 주었던 달이군요. 그때 손에 쥐신 좋은 감각과 인연은 2027년으로 그대로 가져가셔도 좋겠습니다.`,
    '다진 달': `${month}월은 겉으로 화려하지 않았더라도 밑바탕을 야무지게 다지신 시기입니다. 조용히 쌓아 두신 루틴이 연말에 든든한 버팀목이 되었군요.`,
    '버틴 달': `${month}월은 유독 바람이 세어 마음고생이 적지 않으셨을 것입니다. 그때 남아 있던 잔열과 고단함은 이제 제가 재로 태워 보내드릴 테니 가볍게 털어내세요.`,
  };

  return {
    month,
    solarTermLabel: entry.term,
    ganjiHangul: `${stem.hangul}${branch.hangul}`,
    ganjiHanja: `${stem.hanja}${branch.hanja}`,
    stemTenGod,
    branchTenGod,
    grade,
    keyword,
    retrospect: `${groupPastFlow[group]} ${gradeReflectionTail[grade]}`,
    reflectionQuestion: reflectionQuestionByGroup[group],
    seoldamNote: seoldamNoteByGrade[grade],
  };
}

function getMonthlyInfo2027(
  chart: SajuChart,
  month: number
): MonthlyFlow2027 {
  // 2027년 1월(소한): 병오년 신축월(辛丑), 2월(입춘)~12월(대설): 정미년 임인(壬寅)~임자(壬子)
  const monthGanjiTable: {
    month: number;
    term: string;
    stemIdx: number;
    branchIdx: number;
  }[] = [
    { month: 1, term: '소한 · 병오 마무리', stemIdx: 7, branchIdx: 1 },  // 신축
    { month: 2, term: '입춘 · 정미 시작', stemIdx: 8, branchIdx: 2 },   // 임인
    { month: 3, term: '경칩 · 봄의 확장', stemIdx: 9, branchIdx: 3 },   // 계묘
    { month: 4, term: '청명 · 기반 정비', stemIdx: 0, branchIdx: 4 },   // 갑진
    { month: 5, term: '입하 · 활력 상승', stemIdx: 1, branchIdx: 5 },   // 을사
    { month: 6, term: '망종 · 열정 정점', stemIdx: 2, branchIdx: 6 },   // 병오
    { month: 7, term: '소서 · 정미 본기', stemIdx: 3, branchIdx: 7 },   // 정미
    { month: 8, term: '입추 · 실속 전환', stemIdx: 4, branchIdx: 8 },   // 무신
    { month: 9, term: '백로 · 결실 수확', stemIdx: 5, branchIdx: 9 },   // 기유
    { month: 10, term: '한로 · 안정 정리', stemIdx: 6, branchIdx: 10 }, // 경술
    { month: 11, term: '입동 · 내면 충전', stemIdx: 7, branchIdx: 11 }, // 신해
    { month: 12, term: '대설 · 한 해 갈무리', stemIdx: 8, branchIdx: 0 }, // 임자
  ];

  const entry = monthGanjiTable[month - 1];
  const stem = STEMS[entry.stemIdx];
  const branch = BRANCHES[entry.branchIdx];
  const mainHidden = STEMS[branch.hiddenStems[branch.hiddenStems.length - 1]];
  const stemTenGod = getTenGod(chart.dayMaster, stem);
  const branchTenGod = getTenGod(chart.dayMaster, mainHidden);

  const yong1 = chart.yongsin.primary;
  const yong2 = chart.yongsin.secondary;
  const dayBranchIdx = chart.pillars.day.branch.index;
  const isDayClash = (entry.branchIdx + 6) % 12 === dayBranchIdx;
  const isCheoneul = CHEONEUL_BRANCHES[chart.dayMaster.index].includes(entry.branchIdx);

  let score = 0;
  if (stem.element === yong1) score += 2;
  if (branch.element === yong1) score += 3;
  if (stem.element === yong2) score += 1;
  if (branch.element === yong2) score += 2;
  if (isCheoneul) score += 2;
  if (isDayClash) score -= 2;

  const grade: MonthlyFlow2027['grade'] =
    score >= 3 ? '호조' : score <= -1 ? '점검' : '안정';

  const group = getTenGodGroup(branchTenGod);
  const groupKeywordMap: Record<TenGodGroup, string> = {
    비겁: '주도·자립',
    식상: '표현·실행',
    재성: '결실·실속',
    관성: '인정·책임',
    인성: '기획·충전',
  };

  const keyword = isCheoneul
    ? `${groupKeywordMap[group]} · 귀인`
    : isDayClash
      ? `${groupKeywordMap[group]} · 전환`
      : groupKeywordMap[group];

  const adviceByGrade: Record<MonthlyFlow2027['grade'], string> = {
    호조: `${ELEMENT_META[yong1].hangul}(${ELEMENT_META[yong1].hanja}) 흐름과 맞물려 막혀 있던 일이 부드럽게 열리는 달입니다. 중요한 제안, 계약, 도전을 이 시기에 배치하면 기대 이상의 호응을 얻기 좋습니다.`,
    안정: `${branchTenGod}(${group})의 결이 차분히 작동하는 달입니다. 무리하게 판을 흔들기보다 지금 진행 중인 핵심 과제의 완성도를 높이고 루틴을 지킬수록 내실이 쌓입니다.`,
    점검: `일지와의 변화 기운이나 에너지 편차가 감지되는 달입니다. 큰 결정·충동 지출·감정적 대응을 하루만 미루고 계약서와 컨디션을 꼼꼼히 점검하면 오히려 좋은 전환점이 됩니다.`,
  };

  const seoldamTipByGrade: Record<MonthlyFlow2027['grade'], string> = {
    호조: `${month}월은 순풍이 등 뒤에서 밀어 주는 달입니다. 망설이던 계획이 있다면 이때 차분하고 깔끔하게 추진해 보세요.`,
    안정: `${month}월은 무리하지 않고 본인의 보폭을 지키실수록 알차게 쌓이는 시기입니다. 기본기를 다지는 데 집중해 보세요.`,
    점검: `${month}월에는 속도보다 점검이 우선입니다. 급한 결정만 하루쯤 미루어 두시면 작은 액운도 무사히 지나갈 것입니다.`,
  };

  return {
    month,
    solarTermLabel: entry.term,
    ganjiHangul: `${stem.hangul}${branch.hangul}`,
    ganjiHanja: `${stem.hanja}${branch.hanja}`,
    stemTenGod,
    branchTenGod,
    grade,
    keyword,
    advice: adviceByGrade[grade],
    seoldamTip: seoldamTipByGrade[grade],
  };
}

function buildAstrologyAnnualTransit(astrology: AstrologyChart): {
  recap2026: string;
  transit2027: {
    headline: string;
    firstHalf: string;
    secondHalf: string;
  };
} {
  const moonEl: VedicElement = astrology.moon.sign.element;
  const moonSignIdx = astrology.moon.sign.index;
  const moonLabel = `${astrology.moon.sign.sanskritKo}(${astrology.moon.sign.nameKo})`;
  const maha = astrology.dashas.currentMahadasha;

  // 라히리 항성황도(Sidereal) 기준 2026~2027 주요 고차라(Gochar):
  // - 샤니(토성): 2025.03 ~ 2027.06 미나(물고기자리 · 물 원소) 통과
  // - 구루(목성): 2026 하반기 카르카(게자리 · 고조/물 원소) ↔ 2027 하반기 심하(사자자리 · 불 원소)
  // 사데 사티(Sade Sati) 체크: 샤니가 미나(11)에 있을 때 출생 달이 물병(10)·물고기(11)·양(0)이면 사데 사티 구간
  const inSadeSati = moonSignIdx === 10 || moonSignIdx === 11 || moonSignIdx === 0;
  const waterFriendly = moonEl === 'water' || moonEl === 'earth';
  const fireFriendly = moonEl === 'fire' || moonEl === 'air';

  const recap2026 = inSadeSati
    ? `인도 베딕 고차라 흐름에서도 2026년 샤니(토성)가 미나(물고기자리)를 지나며 찬드라 ${moonLabel}의 사데 사티(내면 단련) 구간과 맞물렸습니다. 책임과 감정 정리가 무거웠던 만큼, 구루(목성)가 카르카(게자리)에서 고조되며 꼭 필요한 순간에 숨통과 깨달음을 열어 준 하반기였습니다.`
    : waterFriendly
      ? `인도 베딕 고차라 흐름에서 2026년 하반기 구루(목성)가 카르카(게자리)에서 고조되고 샤니(토성)가 미나(물고기자리)를 지나며, 찬드라 ${moonLabel}(${VEDIC_ELEMENT_META[moonEl].nameKo})의 정서적 뿌리와 직관을 깊게 북돋워 주었습니다. 내실을 다지며 소중한 인연과 배움을 쌓은 연말입니다.`
      : `인도 베딕 고차라 흐름에서 2026년 하반기 구루(카르카)와 샤니(미나)의 깊은 물 원소 배치는 찬드라 ${moonLabel}(${VEDIC_ELEMENT_META[moonEl].nameKo})에게 속도를 잠시 늦추고 내면의 기준을 재정비하라는 신호로 작용했습니다. ${maha.lordKo}(${maha.sanskritKo}) 대운 속에서 방향을 다듬은 하반기였습니다.`;

  const transit2027 = {
    headline: fireFriendly
      ? `2027년 상반기 카르카(게자리)의 내면 정비를 지나, 하반기 구루 심하(사자자리) 진입과 함께 본격적인 무대 확장이 열리는 흐름`
      : `2027년 상반기 고조된 구루(카르카)의 정서적 풍요를 누리고, 하반기 심하(사자자리)에서 실력을 세상에 드러내는 흐름`,
    firstHalf: waterFriendly
      ? `상반기에는 구루(목성)가 카르카(게자리)의 고조 기운을 유지하며 찬드라 ${moonLabel}과 부드럽게 공명합니다. 가족·주거·학습·신뢰 관계에서 마음이 편안해지고, ${maha.lordKo} 마하다샤의 긍정적인 기운이 차분히 스며드는 시기입니다.`
      : `상반기에는 샤니(토성)가 미나(물고기자리) 구간을 마무리하며 내면의 군더더기를 정리해 줍니다. 조급히 확장하기보다 '${astrology.janmaNakshatra.info.nameKo}' 나크샤트라의 본연의 강점을 갈고닦아 하반기 도약을 준비하기 좋습니다.`,
    secondHalf: fireFriendly
      ? `하반기에는 구루(목성)가 불 원소인 심하(사자자리)로 옮겨가며 찬드라 ${moonLabel}에 당당한 존재감과 추진력을 불어넣습니다. 상반기에 다져 둔 기획·브랜딩·대외 활동을 자신 있게 바깥으로 펼치기 좋은 타이밍입니다.`
      : `하반기에는 구루(목성)가 심하(사자자리)로 이동하고 샤니의 무게가 한결 정돈되며 시야가 바깥으로 열립니다. 내면에 쌓아 둔 실력을 구체적인 직무 성과와 당당한 자기표현으로 연결할수록 보상이 커집니다.`,
  };

  return { recap2026, transit2027 };
}

export function generateAnnualReport(
  chart: SajuChart,
  astrology: AstrologyChart
): AnnualReportBundle {
  // 2026 병오년 (丙=2, 午=6)
  const p2026 = buildYearSummary(chart, 2026, 2, 6, '붉은 말의 해');
  // 2027 정미년 (丁=3, 未=7)
  const p2027 = buildYearSummary(chart, 2027, 3, 7, '붉은 양의 해');

  const group2026 = getTenGodGroup(p2026.stemTenGod);
  const theme2026 = TEN_GOD_YEAR_THEME_2026[group2026];

  const group2027 = getTenGodGroup(p2027.branchTenGod);
  const theme2027 = TEN_GOD_YEAR_THEME_2027[group2027];

  const astroAnnual = buildAstrologyAnnualTransit(astrology);

  const interactionText2026 =
    p2026.interactionsWithChart.length > 0
      ? `특히 올해 병오(丙午)의 기운이 원국의 ${p2026.interactionsWithChart.join(', ')}으로 직접 맞물리며, 일상이나 관계에서 체감되는 변화와 감정적 파동이 여느 해보다 선명했을 흐름입니다.`
      : `원국과의 극단적인 충돌보다는 천간 ${p2026.stemTenGod}·지지 ${p2026.branchTenGod}의 본연의 과제가 담백하게 펼쳐지며 한 해의 밀도를 채웠습니다.`;

  const yongsinText2026 = p2026.isYongsinYear
    ? `2026년의 화(火) 기운이 명식의 균형을 돕는 용신·희신 축과 닿아 있어, 바쁘고 뜨거웠던 만큼 의미 있는 기회나 성장의 발판을 건졌을 가능성이 높습니다.`
    : `화(火) 기운이 매우 강한 병오년의 특성상 명식에 열기나 속도 부담이 다소 컸을 수 있습니다. 그럼에도 여기까지 완주한 것 자체가 다음 해를 버틸 큰 체력이 되었습니다.`;

  const monthlyReviews2026 = Array.from({ length: 12 }, (_, idx) =>
    getMonthlyReview2026(chart, idx + 1)
  );
  const rawBright2026 = monthlyReviews2026
    .filter((m) => m.grade === '빛난 달')
    .map((m) => m.month);
  const brightMonths2026 = (rawBright2026.length > 0 ? rawBright2026 : [6, 9]).slice(0, 4);
  const brightSet2026 = new Set(brightMonths2026);

  const rawTough2026 = monthlyReviews2026
    .filter((m) => m.grade === '버틴 달' && !brightSet2026.has(m.month))
    .map((m) => m.month);
  const toughMonths2026 =
    rawTough2026.length > 0
      ? rawTough2026.slice(0, 3)
      : monthlyReviews2026
          .filter((m) => !brightSet2026.has(m.month))
          .slice(-2)
          .map((m) => m.month);

  const review2026: YearEndReview2026 = {
    pillar: p2026,
    headline: theme2026.headline,
    summaryParagraphs: [
      theme2026.experience,
      `${interactionText2026} ${yongsinText2026}`,
    ],
    retrospectItems: [
      {
        label: '2026년 핵심 십성 키워드',
        content: `천간 ${p2026.stemTenGod} · 지지 ${p2026.branchTenGod} · 12운성 '${p2026.lifeStage}'`,
      },
      {
        label: '올해 손에 쥔 가장 큰 자산',
        content: theme2026.gained,
      },
      {
        label: '12월 안에 내려놓고 갈 짐',
        content: theme2026.letGo,
      },
      {
        label: '2026 하반기 베딕 고차라 흐름',
        content: astroAnnual.recap2026,
      },
    ],
    monthlyReviews: monthlyReviews2026,
    brightMonths: brightMonths2026,
    toughMonths: toughMonths2026,
    astrologyRecap: astroAnnual.recap2026,
    seoldamNote: {
      tag: '재(災)의 연말 결산 노트 · 2026',
      quote: p2026.isYongsinYear
        ? `병오년 한 해 동안 참 부지런히 잘 건너오셨군요. 뜨거웠던 바람을 잘 타신 편이니, 연말에는 잘 해내신 일 세 가지만 종이에 적어 스스로를 다독여 보세요.`
        : `병오년의 불기운이 거세어 중간중간 숨이 차셨을 것입니다. 남은 액운과 무거운 짐은 제가 조용히 태워 보내드릴 테니, 12월 문턱에 내려놓고 가볍게 새해를 맞이하시길 바랍니다.`,
      footnote: `2026 병오년(丙午 · 양화) × ${chart.dayMaster.hangul}(${chart.dayMaster.hanja}) 일간 기준 세운·월운 회고`,
    },
  };

  // 2027 정미년 신년사주
  const monthlyFlows = Array.from({ length: 12 }, (_, idx) =>
    getMonthlyInfo2027(chart, idx + 1)
  );
  const rawPeaks = monthlyFlows.filter((m) => m.grade === '호조').map((m) => m.month);
  const peakMonths = (rawPeaks.length > 0 ? rawPeaks : [4, 9]).slice(0, 4);
  const peakSet = new Set(peakMonths);

  const rawCares = monthlyFlows
    .filter((m) => m.grade === '점검' && !peakSet.has(m.month))
    .map((m) => m.month);
  const careMonths =
    rawCares.length > 0
      ? rawCares.slice(0, 3)
      : monthlyFlows
          .filter((m) => !peakSet.has(m.month))
          .slice(-2)
          .map((m) => m.month);

  const interactionText2027 =
    p2027.interactionsWithChart.length > 0
      ? `세운 정미(丁未)가 원국의 ${p2027.interactionsWithChart.join(', ')}과 만나며, 정체되었던 영역에 뚜렷한 전환과 새로운 인연의 물꼬를 틉니다.`
      : `원국과 무리한 충돌 없이 정화(丁火)의 은은한 집중력과 미토(未土)의 안정된 저장 기운이 차분하게 스며드는 한 해입니다.`;

  const cheoneulSentence = p2027.isCheoneulYear
    ? `무엇보다 ${chart.dayMaster.hangul}(${chart.dayMaster.hanja}) 일간에게 2027년 미(未)는 최고의 길신인 '천을귀인(天乙貴人)'이 직접 들어오는 귀한 해입니다. 결정적인 순간에 뜻밖의 조력자나 좋은 제안이 길을 열어 줄 가능성이 매우 높습니다.`
    : p2027.isYongsinYear
      ? `또한 정미년의 화(火)·토(土) 기운이 명식의 용신·희신과 맞물려 있어, 2026년에 뿌려 둔 노력들이 2027년에는 한층 수월하게 결실로 연결되는 순풍이 붑니다.`
      : `2027년에는 과도하게 일을 벌이기보다 명식의 균형 용신인 ${ELEMENT_META[chart.yongsin.primary].hangul}(${ELEMENT_META[chart.yongsin.primary].hanja})의 리듬을 지키며 핵심 2~3가지 목표에 선택과 집중을 할 때 만족도가 가장 높습니다.`;

  const forecast2027: NewYearForecast2027 = {
    pillar: p2027,
    headline: theme2027.headline,
    overviewParagraphs: [
      `2027년 정미년(丁未年)은 2026년 병오년의 거센 열기가 은은한 등불(丁)과 비옥한 대지(未)로 가라앉으며 '확장에서 결실로' 무게중심이 옮겨가는 해입니다. ${chart.dayMaster.hangul}(${chart.dayMaster.hanja}) 일간에게는 천간 '${p2027.stemTenGod}', 지지 '${p2027.branchTenGod}'의 흐름이 중심을 잡습니다. ${theme2027.overview}`,
      `${interactionText2027} ${cheoneulSentence}`,
    ],
    domainForecasts: [
      {
        id: 'career',
        label: '2027 직업 · 학업운',
        theme: `${p2027.stemTenGod}·${p2027.branchTenGod} 중심의 실무 도약`,
        detail: theme2027.career,
      },
      {
        id: 'wealth',
        label: '2027 재물 · 자산운',
        theme: '미토(未土) 창고의 실속 축적',
        detail: theme2027.wealth,
      },
      {
        id: 'romance',
        label: '2027 연애 · 대인운',
        theme: '깊이와 신뢰를 다지는 관계',
        detail: theme2027.romance,
      },
      {
        id: 'health',
        label: '2027 건강 · 컨디션',
        theme: '열기 조절과 소화·수면 리듬',
        detail: theme2027.health,
      },
    ],
    monthlyFlows,
    peakMonths,
    careMonths,
    astrologyTransit2027: astroAnnual.transit2027,
    seoldamNote: {
      tag: '재(災)의 신년 처방 노트 · 2027',
      quote: p2027.isCheoneulYear
        ? `갓을 고쳐 쓰고 다시 살펴보았습니다. 2027년 정미년은 원국에 천을귀인이 직접 걸어 들어오는 귀한 해이군요. 혼자 끙끙대지 마시고 주변에 손을 내밀어 보시면 생각보다 훨씬 수월하게 문이 열릴 것입니다.`
        : `2026년이 불꽃처럼 뜨겁게 치달은 해였다면, 2027년 정미년은 은근한 찻불에 진하게 우려내는 해입니다. 서두르지 마시고 본인의 몫을 차분히 챙겨 담아 보세요.`,
      footnote: `2027 정미년(丁未 · 음화/음토) 세운 · ${
        peakMonths.length > 0 ? `상승 월운 ${peakMonths.slice(0, 4).join('·')}월` : '안정 순환형 월운'
      } 기준`,
    },
  };

  return {
    review2026,
    forecast2027,
  };
}
