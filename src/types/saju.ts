export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type YinYang = 'yang' | 'yin';
export type Gender = 'female' | 'male';
export type CalendarType = 'solar' | 'lunar';

export type TenGod =
  | '일간(본원)'
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인';

export type TenGodGroup = '비겁' | '식상' | '재성' | '관성' | '인성';

export type LifeStage12 =
  | '장생'
  | '목욕'
  | '관대'
  | '건록'
  | '제왕'
  | '쇠'
  | '병'
  | '사'
  | '묘'
  | '절'
  | '태'
  | '양';

export type StrengthGrade = '극왕' | '신강' | '중화' | '신약' | '극약';

export type ChapterId = 'personality' | 'career' | 'wealth' | 'romance' | 'health';

export type SeoldamMood = 'calm' | 'keen' | 'warm';

export interface BirthInput {
  name: string;
  gender: Gender;
  calendarType: CalendarType;
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  hour: number;
  minute: number;
  unknownTime: boolean;
  useTrueSolarTime: boolean;
}

export interface StemInfo {
  index: number;
  hangul: string;
  hanja: string;
  element: ElementType;
  yinYang: YinYang;
  natureTitle: string;
}

export interface BranchInfo {
  index: number;
  hangul: string;
  hanja: string;
  element: ElementType;
  yinYang: YinYang;
  animal: string;
  season: '봄' | '여름' | '가을' | '겨울' | '환절기';
  hiddenStems: number[];
}

export interface TermExplanation {
  title: string;
  subtitle: string;
  roleInChart: string;
  description: string;
}

export interface Pillar {
  position: 'hour' | 'day' | 'month' | 'year';
  label: string;
  stem: StemInfo;
  branch: BranchInfo;
  ganjiHangul: string;
  ganjiHanja: string;
  stemTenGod: TenGod;
  branchTenGod: TenGod;
  hiddenStems: {
    stem: StemInfo;
    tenGod: TenGod;
    role: '여기' | '중기' | '정기';
  }[];
  lifeStage: LifeStage12;
  isKnown: boolean;
  explanation?: TermExplanation;
}

export interface ElementBalanceItem {
  element: ElementType;
  hangul: string;
  hanja: string;
  rawCount: number;
  weightedScore: number;
  percentage: number;
  status: '과다' | '발달' | '적정' | '부족' | '결핍';
}

export interface TenGodGroupScore {
  group: TenGodGroup;
  hanja: string;
  score: number;
  percentage: number;
  meaning: string;
}

export interface InteractionItem {
  id: string;
  type: '천간합' | '지지육합' | '지지삼합' | '지지반합' | '지지충' | '지지형';
  name: string;
  pillarsInvolved: string;
  summary: string;
  detail: string;
}

export interface SinsalItem {
  id: string;
  name: string;
  hanja: string;
  location: string;
  summary: string;
  detail: string;
}

export interface SajuChart {
  input: BirthInput;
  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  adjustedDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    shiftedDay: number;
  };
  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeap: boolean;
  };
  solarTermName: string;
  pillars: {
    hour: Pillar | null;
    day: Pillar;
    month: Pillar;
    year: Pillar;
  };
  dayMaster: StemInfo;
  dayPillarCode: string;
  gyeokguk: {
    tenGod: TenGod;
    group: TenGodGroup;
    name: string;
  };
  elementBalance: ElementBalanceItem[];
  tenGodGroups: TenGodGroupScore[];
  yinYangRatio: {
    yang: number;
    yin: number;
    yangPercent: number;
    yinPercent: number;
  };
  strength: {
    score: number;
    grade: StrengthGrade;
    deukryeong: boolean;
    deukji: boolean;
    deukse: boolean;
    explanation: string;
  };
  yongsin: {
    primary: ElementType;
    secondary: ElementType;
    johuNote: string;
    reason: string;
  };
  interactions: InteractionItem[];
  sinsal: SinsalItem[];
}

// ---------- Indian Vedic Astrology (Jyotish) Types ----------

export type VedicElement = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';
export type GrahaId =
  | 'lagna'
  | 'moon'
  | 'sun'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn'
  | 'rahu'
  | 'ketu';

export interface RashiInfo {
  index: number;
  number: number;
  sanskritKo: string;
  nameKo: string;
  nameEn: string;
  symbol: string;
  element: VedicElement;
  modality: Modality;
  rulerKo: string;
  keyword: string;
  moonTrait: string;
  sunTrait: string;
  lagnaTrait: string;
  venusTrait: string;
  marsTrait: string;
}

export interface NakshatraInfo {
  index: number;
  nameKo: string;
  nameEn: string;
  rulerId: Exclude<GrahaId, 'lagna'>;
  rulerKo: string;
  symbolKo: string;
  gana: '데바(조화형)' | '마누샤(현실형)' | '락샤사(돌파형)';
  keyword: string;
  description: string;
}

export interface GrahaPlacement {
  id: GrahaId;
  nameKo: string;
  sanskritKo: string;
  shortLabel: string;
  symbol: string;
  domainKo: string;
  longitude: number;
  sign: RashiInfo;
  degreeInSign: number;
  degreeLabel: string;
  nakshatra: NakshatraInfo;
  pada: number;
  house: number;
  houseDomain: string;
  interpretation: string;
}

export interface DashaPeriod {
  lordId: Exclude<GrahaId, 'lagna'>;
  lordKo: string;
  sanskritKo: string;
  startYear: number;
  endYear: number;
  durationYears: number;
  isCurrent: boolean;
  theme: string;
}

export interface VedicElementBalance {
  element: VedicElement;
  nameKo: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RahuKetuAxis {
  rahuSign: RashiInfo;
  ketuSign: RashiInfo;
  rahuHouse: number;
  ketuHouse: number;
  headline: string;
  rahuGuidance: string;
  ketuGuidance: string;
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
  ayanamsaDeg: number;
  ayanamsaLabel: string;
  chartBase: 'lagna' | 'chandra';
  baseRashiIndex: number;
  placements: GrahaPlacement[];
  lagna: GrahaPlacement | null;
  moon: GrahaPlacement;
  sun: GrahaPlacement;
  mars: GrahaPlacement;
  mercury: GrahaPlacement;
  jupiter: GrahaPlacement;
  venus: GrahaPlacement;
  saturn: GrahaPlacement;
  rahu: GrahaPlacement;
  ketu: GrahaPlacement;
  janmaNakshatra: {
    info: NakshatraInfo;
    pada: number;
    padaFocus: string;
  };
  dashas: {
    currentMahadasha: DashaPeriod;
    currentAntardasha: {
      lordKo: string;
      sanskritKo: string;
      endYearMonth: string;
      theme: string;
    };
    timeline: DashaPeriod[];
  };
  rahuKetuAxis: RahuKetuAxis;
  elements: VedicElementBalance[];
  dominantElement: VedicElementBalance;
  crossInsight: CrossInsight;
}

// ---------- Annual Fortune (2026 Review & 2027 Forecast) Types ----------

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
  month: number;
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
  month: number;
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

// ---------- Reading Report & Preset Types ----------

export interface ReportChapter {
  id: ChapterId;
  index: string;
  title: string;
  subtitle: string;
  evidenceLine: string;
  headline: string;
  paragraphs: string[];
  keyPoints: {
    label: string;
    content: string;
  }[];
  seoldamNote: {
    mood: SeoldamMood;
    tag: string;
    quote: string;
    footnote: string;
  };
}

export interface ReadingReport {
  chart: SajuChart;
  astrology: AstrologyChart;
  annual: AnnualReportBundle;
  coverTitle: string;
  dayPillarSymbol: string;
  openingGreeting: string;
  executiveSummary: string;
  chapters: ReportChapter[];
  closingPrescription: {
    oneLiner: string;
    yongsinElement: string;
    favorableSeason: string;
    favorableDirection: string;
    favorableColor: string;
    dailyRitual: string;
  };
}

export interface PresetProfile {
  id: string;
  label: string;
  caption: string;
  input: BirthInput;
}

export interface ChartLedgerSummary {
  cleanName: string;
  shorthand: string;
  dayPillarCode: string;
  dayPillarHanja: string;
  dayElement: ElementType;
  caption: string;
}

// ---------- Relationship Studio Types ----------

export type PillarOrderMode = 'hour-first' | 'year-first';

export interface MemberSeed {
  id: string;
  name: string;
  shorthand: string;
  source?: 'manual' | 'birth' | 'my-report';
  isSample?: boolean;
}

export interface RelationMember {
  id: string;
  name: string;
  source: 'manual' | 'birth' | 'my-report';
  isSample?: boolean;
  shorthand: string;
  pillars: {
    hour: Pillar | null;
    day: Pillar;
    month: Pillar;
    year: Pillar;
  };
  dayMaster: StemInfo;
  dayPillarCode: string;
  dayPillarTitle: string;
  elementBalance: ElementBalanceItem[];
  dominantElement: ElementType;
  weakestElement: ElementType;
  strengthGrade: StrengthGrade;
  strengthScore: number;
  yongsinPrimary: ElementType;
  yongsinSecondary: ElementType;
}

export interface PairSignal {
  id: string;
  category: '천간' | '일지' | '지지' | '귀인' | '오행';
  polarity: 'harmony' | 'tension' | 'neutral';
  label: string;
  detail: string;
}

export interface PairCompatibility {
  pairKey: string;
  a: RelationMember;
  b: RelationMember;
  score: number;
  relationTier: '천생 호흡' | '상호 보완' | '티키타카 자극' | '조율 필요';
  relationTitle: string;
  shortKeyword: string;
  aToB: {
    tenGod: TenGod;
    group: TenGodGroup;
    roleLabel: string;
    description: string;
  };
  bToA: {
    tenGod: TenGod;
    group: TenGodGroup;
    roleLabel: string;
    description: string;
  };
  signals: PairSignal[];
  harmonyPoints: string[];
  cautionPoints: string[];
  elementComplementSummary: string;
  year2027JointNote: string;
  seoldamNote: {
    mood: SeoldamMood;
    quote: string;
    tip: string;
  };
}

export interface GroupSamhapMatch {
  id: string;
  type: '삼합' | '방합';
  name: string;
  element: ElementType;
  contributors: { memberName: string; branchHangul: string; branchHanja: string }[];
  meaning: string;
}

export interface GroupChemistryReport {
  members: RelationMember[];
  pairs: PairCompatibility[];
  pairMap: Record<string, PairCompatibility>;
  collectiveElements: ElementBalanceItem[];
  strongestGroupElement: ElementType;
  weakestGroupElement: ElementType;
  groupTemperamentTitle: string;
  groupTemperamentSummary: string;
  bestPair: PairCompatibility | null;
  tensionPair: PairCompatibility | null;
  mediator: { member: RelationMember; avgScore: number; reason: string } | null;
  balancer: { member: RelationMember; element: ElementType; reason: string } | null;
  groupSamhaps: GroupSamhapMatch[];
  seoldamGroupSummary: string;
}
