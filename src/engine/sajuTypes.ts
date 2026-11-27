import type { AnnualReportBundle } from './annualFortune';
import type { AstrologyChart } from './astrology';

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
  hiddenStems: number[]; // [여기, 중기?, 정기(본기)] - last item is main hidden stem
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
  dayPillarCode: string; // e.g. '갑자'
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
    score: number; // 0 to 100 (50 is neutral)
    grade: StrengthGrade;
    deukryeong: boolean; // 월지 득령
    deukji: boolean; // 일지 득지
    deukse: boolean; // 세력 득세
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

export interface TermExplanation {
  title: string;
  subtitle: string;
  roleInChart: string;
  description: string;
}

export interface PresetProfile {
  id: string;
  label: string;
  caption: string;
  input: BirthInput;
}
