import { ELEMENT_META } from './manseryeok';
import { SajuChart } from './sajuTypes';

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
  index: number; // 0..11
  number: number; // 1..12 (traditional Vedic Rashi number)
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
  index: number; // 0..26
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
  shortLabel: string; // For North Indian Kundali diagram
  symbol: string;
  domainKo: string;
  longitude: number; // 0..360 Sidereal (Lahiri)
  sign: RashiInfo;
  degreeInSign: number; // 0..29.99
  degreeLabel: string;
  nakshatra: NakshatraInfo;
  pada: number; // 1..4
  house: number; // 1..12 (Whole Sign from Lagna, or Chandra if time unknown)
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
  baseRashiIndex: number; // 0..11 sign placed in House 1
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

export const VEDIC_ELEMENT_META: Record<
  VedicElement,
  { nameKo: string; sanskrit: string; color: string }
> = {
  fire: { nameKo: '불(Agni)', sanskrit: '아그니', color: '#9A3412' },
  earth: { nameKo: '흙(Prithvi)', sanskrit: '프리트비', color: '#854D0E' },
  air: { nameKo: '바람(Vayu)', sanskrit: '바유', color: '#475569' },
  water: { nameKo: '물(Jala)', sanskrit: '잘라', color: '#1E3A8A' },
};

export const HOUSE_DOMAINS: readonly string[] = [
  '1하우스 · 자아와 체질',
  '2하우스 · 재물과 말씨',
  '3하우스 · 용기와 소통',
  '4하우스 · 가정과 내면 안식',
  '5하우스 · 창조와 지혜',
  '6하우스 · 실무와 건강 관리',
  '7하우스 · 인연과 파트너십',
  '8하우스 · 변화와 깊은 통찰',
  '9하우스 · 배움과 귀인·행운',
  '10하우스 · 천직과 사회적 성취',
  '11하우스 · 결실과 네트워크',
  '12하우스 · 휴식과 영적 확장',
];

export const VEDIC_RASHIS: readonly RashiInfo[] = [
  {
    index: 0,
    number: 1,
    sanskritKo: '메샤',
    nameKo: '양자리',
    nameEn: 'Mesha',
    symbol: '♈',
    element: 'fire',
    modality: 'cardinal',
    rulerKo: '화성(망갈라)',
    keyword: '개척 · 직진 · 순수한 용기',
    moonTrait: '마음이 뜨겁고 솔직하여 답답한 정체를 견디기 어려워합니다. 직접 첫 발을 내디디며 몸을 움직일 때 감정이 가장 맑게 순환합니다.',
    sunTrait: '스스로 길을 열고 주도권을 쥘 때 본연의 빛이 살아납니다. 명확한 목표와 정정당당한 승부에서 생명력을 얻습니다.',
    lagnaTrait: '또렷하고 생기 있는 첫인상을 주며, 군더더기 없는 솔직함과 당당한 추진력이 자연스레 드러납니다.',
    venusTrait: '호감이 생기면 에둘러 말하지 않고 솔직하게 다가가며, 주체적이고 생동감 넘치는 인연에게 깊이 끌립니다.',
    marsTrait: '자신의 본궁(Swakshetra)에 자리해 돌파력과 실행력이 매우 선명합니다. 새 판을 점화하는 추진력이 탁월합니다.',
  },
  {
    index: 1,
    number: 2,
    sanskritKo: '브리샤바',
    nameKo: '황소자리',
    nameEn: 'Vrishabha',
    symbol: '♉',
    element: 'earth',
    modality: 'fixed',
    rulerKo: '금성(슈크라)',
    keyword: '안정 · 감각 · 꾸준한 축적',
    moonTrait: '달이 고조(Exalted)되는 가장 편안한 자리입니다. 정서적 뿌리가 깊고, 좋은 공간과 오감의 여유 속에서 놀라운 회복력과 인내심을 발휘합니다.',
    sunTrait: '조급하게 흔들리지 않고 가치 있는 것을 묵묵히 가꾸어 실질적인 자산과 신뢰로 완성해 갑니다.',
    lagnaTrait: '차분하고 묵직한 신뢰감을 풍기며, 말투와 분위기에서 단정한 여유와 심미안이 느껴집니다.',
    venusTrait: '금성의 본궁에 놓여 애정과 미적 감각이 매우 풍성합니다. 변치 않는 성실함과 따뜻한 일상을 함께 나누는 사랑을 지향합니다.',
    marsTrait: '시작은 신중하지만 한번 방향을 정하면 끝까지 밀어붙여 손에 잡히는 결과로 만들어 내는 지구력을 지녔습니다.',
  },
  {
    index: 2,
    number: 3,
    sanskritKo: '미투나',
    nameKo: '쌍둥이자리',
    nameEn: 'Mithuna',
    symbol: '♊',
    element: 'air',
    modality: 'mutable',
    rulerKo: '수성(부다)',
    keyword: '호기심 · 언어 · 유연한 연결',
    moonTrait: '생각이 빠르고 호기심이 풍부합니다. 감정을 혼자 묻어 두기보다 말이나 글로 정리하고 대화로 나눌 때 마음이 환하게 풀립니다.',
    sunTrait: '사람과 정보를 재치 있게 연결하며, 다양한 시선으로 문제를 풀어내는 지적 유연성이 돋보입니다.',
    lagnaTrait: '눈빛이 영민하고 말솜씨가 자연스러워 처음 만난 자리에서도 공기를 가볍고 유연하게 엽니다.',
    venusTrait: '지적 대화와 유머 코드가 통하는 산뜻한 교감에서 애정이 자라며, 친구처럼 편하고 생동감 있는 관계를 선호합니다.',
    marsTrait: '순발력과 전략적 응용력이 뛰어납니다. 하나의 길에 갇히지 않고 여러 해법을 동시에 실험하며 돌파구를 찾습니다.',
  },
  {
    index: 3,
    number: 4,
    sanskritKo: '카르카',
    nameKo: '게자리',
    nameEn: 'Karka',
    symbol: '♋',
    element: 'water',
    modality: 'cardinal',
    rulerKo: '달(찬드라)',
    keyword: '공감 · 수호 · 깊은 정서',
    moonTrait: '달의 본궁(Swakshetra)에 머물러 감수성과 직관, 기억력이 매우 풍부합니다. 내 사람과 안식처를 지킬 때 깊은 온기와 저력이 피어납니다.',
    sunTrait: '타인의 마음을 세심히 헤아리고, 공동체나 가족·팀의 정서적 중심을 따뜻하게 지탱하는 리더십을 발휘합니다.',
    lagnaTrait: '부드럽고 포근한 첫인상을 주며, 상대가 경계를 풀고 진심을 털어놓게 만드는 편안한 기운이 감돕니다.',
    venusTrait: '마음을 열기까지는 신중하지만 한번 내 편이라 여기면 세심하고 헌신적으로 보살피는 깊은 애정을 보입니다.',
    marsTrait: '평소에는 온화하지만 지켜야 할 사람이나 가치가 생기면 누구보다 끈질긴 수호 본능과 실행력을 발휘합니다.',
  },
  {
    index: 4,
    number: 5,
    sanskritKo: '심하',
    nameKo: '사자자리',
    nameEn: 'Simha',
    symbol: '♌',
    element: 'fire',
    modality: 'fixed',
    rulerKo: '태양(수리야)',
    keyword: '창조 · 품위 · 당당한 중심',
    moonTrait: '자존감과 마음이 넓으며, 진심으로 존중받고 인정받을 때 넉넉한 온기를 베풉니다. 숨김없이 솔직한 품위가 매력입니다.',
    sunTrait: '태양의 본궁에 자리해 고유한 존재감과 자기 확신이 뚜렷합니다. 무대의 중심에서 창조적 영감을 펼치는 힘이 큽니다.',
    lagnaTrait: '자연스러운 기품과 또렷한 아우라가 있어 말없이 자리해도 시선을 모으는 당당한 인상을 남깁니다.',
    venusTrait: '통 크고 따뜻한 애정 표현을 즐기며, 서로를 빛내 주고 자부심을 나눌 수 있는 당당한 사랑을 원합니다.',
    marsTrait: '자존심과 열정이 곧장 실행력으로 연결되어, 규모 있는 목표를 정면으로 밀어붙여 완성하려는 기개가 강합니다.',
  },
  {
    index: 5,
    number: 6,
    sanskritKo: '칸야',
    nameKo: '처녀자리',
    nameEn: 'Kanya',
    symbol: '♍',
    element: 'earth',
    modality: 'mutable',
    rulerKo: '수성(부다)',
    keyword: '정교함 · 분석 · 실질적 완성',
    moonTrait: '관찰력이 예리하고 주변과 일정이 단정하게 정돈되어 있을 때 마음이 가장 편안합니다. 실용적인 도움을 줄 때 깊은 보람을 느낍니다.',
    sunTrait: '복잡한 과제를 세밀하게 분해해 완성도를 끌어올리는 실무 장인 기질이 빛납니다.',
    lagnaTrait: '단정하고 지적인 첫인상을 주며, 말과 행동이 정갈하게 정리되어 있어 신뢰를 얻기 쉽습니다.',
    venusTrait: '화려한 말보다 작은 약속을 지키고 상대의 일상을 꼼꼼히 챙기는 섬세한 행동으로 진심을 전합니다.',
    marsTrait: '에너지를 허투루 쓰지 않고 정확도와 효율을 높이는 데 집중해 치밀한 결과물을 뽑아냅니다.',
  },
  {
    index: 6,
    number: 7,
    sanskritKo: '툴라',
    nameKo: '천칭자리',
    nameEn: 'Tula',
    symbol: '♎',
    element: 'air',
    modality: 'cardinal',
    rulerKo: '금성(슈크라)',
    keyword: '조화 · 심미안 · 공정한 균형',
    moonTrait: '거친 대립보다 품위 있는 대화와 균형 속에서 안정을 느낍니다. 세련된 공간과 아름다운 취향이 마음을 맑게 가꿔 줍니다.',
    sunTrait: '서로 다른 입장을 공정하게 조율하고, 관계와 협업 속에서 조화로운 해법을 설계하는 감각이 뛰어납니다.',
    lagnaTrait: '호감 가는 매너와 균형 잡힌 인상이 돋보여 처음 만난 사람과도 매끄럽게 호흡을 맞춥니다.',
    venusTrait: '금성의 본궁에 놓여 관계 감각과 심미안이 탁월합니다. 서로의 품격을 존중하는 우아하고 대등한 인연을 추구합니다.',
    marsTrait: '정면 충돌보다 협상과 전략적 조율을 통해 원하는 바를 세련되게 이끌어 내는 실행 스타일을 보입니다.',
  },
  {
    index: 7,
    number: 8,
    sanskritKo: '브리쉬치카',
    nameKo: '전갈자리',
    nameEn: 'Vrishchika',
    symbol: '♏',
    element: 'water',
    modality: 'fixed',
    rulerKo: '화성(망갈라)',
    keyword: '통찰 · 몰입 · 본질의 탐구',
    moonTrait: '감정의 수심이 깊고 사람과 상황의 이면을 직관적으로 꿰뚫어 봅니다. 얕은 관계보다 진심이 통하는 깊은 신뢰를 최우선으로 둡니다.',
    sunTrait: '표면에 머물지 않고 본질을 파고들며, 위기를 지나며 더 단단하게 거듭나는 회복 탄력성이 압도적입니다.',
    lagnaTrait: '차분하면서도 쉽게 속을 읽기 어려운 깊은 눈빛과 묵직한 아우라가 첫인상에 오래 남습니다.',
    venusTrait: '한번 마음을 주면 진심으로 깊이 몰입하며, 겉치레 없이 속마음까지 투명하게 나눌 수 있는 밀도 높은 사랑을 원합니다.',
    marsTrait: '화성의 본궁에 자리해 겉으로는 조용하되 한번 겨눈 목표는 집요하고 전략적으로 관철하는 저력이 대단합니다.',
  },
  {
    index: 8,
    number: 9,
    sanskritKo: '다누',
    nameKo: '사수자리',
    nameEn: 'Dhanu',
    symbol: '♐',
    element: 'fire',
    modality: 'mutable',
    rulerKo: '목성(구루)',
    keyword: '확장 · 지혜 · 철학적 시야',
    moonTrait: '답답하게 갇혀 있기보다 더 넓은 의미와 배움을 향해 시야를 열 때 마음이 살아납니다. 솔직함과 낙관으로 위기를 넘깁니다.',
    sunTrait: '원칙과 이상을 중시하며, 좁은 이해관계를 넘어 큰 그림과 지혜를 나누는 과정에서 존재감이 커집니다.',
    lagnaTrait: '시원시원하고 개방적인 인상을 주며, 유쾌한 에너지와 정직한 태도가 자연스레 전해집니다.',
    venusTrait: '서로의 자유와 성장을 응원하며, 함께 배우고 여행하듯 시야를 넓혀 갈 수 있는 솔직한 동반자에게 끌립니다.',
    marsTrait: '명분과 비전이 분명할 때 폭발적인 추진력이 살아나며, 먼 목표를 향해 과감히 도전하는 스케일이 큽니다.',
  },
  {
    index: 9,
    number: 10,
    sanskritKo: '마카라',
    nameKo: '염소자리',
    nameEn: 'Makara',
    symbol: '♑',
    element: 'earth',
    modality: 'cardinal',
    rulerKo: '토성(샤니)',
    keyword: '책임 · 구조 · 장기적 성취',
    moonTrait: '감정에 휩쓸리기보다 스스로 질서를 잡고 맡은 바를 해낼 때 마음이 단단해집니다. 겉표현은 담백해도 속정이 깊습니다.',
    sunTrait: '현실의 무게를 피하지 않고 체계적인 인내로 정상에 오릅니다. 시간이 쌓일수록 권위와 신뢰가 깊어집니다.',
    lagnaTrait: '차분하고 어른스러운 품격이 느껴지며, 맡긴 일은 끝내 완성해 낼 것 같은 묵직한 신뢰감을 줍니다.',
    venusTrait: '가벼운 설렘보다 신뢰할 수 있고 함께 미래를 설계할 수 있는 성실하고 단단한 파트너에게 깊은 애정을 느낍니다.',
    marsTrait: '화성이 고조(Exalted)되는 최고의 실무 자리입니다. 감정적 과열 없이 냉철하고 지속적인 추진력으로 큰 성과를 완수합니다.',
  },
  {
    index: 10,
    number: 11,
    sanskritKo: '쿰바',
    nameKo: '물병자리',
    nameEn: 'Kumbha',
    symbol: '♒',
    element: 'air',
    modality: 'fixed',
    rulerKo: '토성(샤니)',
    keyword: '독창성 · 객관 · 미래 지향',
    moonTrait: '한 걸음 물러나 객관적으로 상황을 이해하려 하며, 개인의 자유와 고유한 가치관이 존중받을 때 가장 편안합니다.',
    sunTrait: '관습에 묶이지 않고 독창적인 관점과 시스템으로 새로운 해법을 설계하는 데 강점이 있습니다.',
    lagnaTrait: '어딘가 독특하고 세련된 지성미가 감돌며, 틀에 박히지 않은 자유롭고 담백한 인상을 줍니다.',
    venusTrait: '지적 교감과 개성을 존중하는 쿨하고 깊은 우정 같은 사랑을 선호하며, 구속 없는 신뢰를 중시합니다.',
    marsTrait: '남들과 똑같은 방식보다 독창적인 우회로와 구조를 설계해 문제를 해결하는 혁신적 실행력을 발휘합니다.',
  },
  {
    index: 11,
    number: 12,
    sanskritKo: '미나',
    nameKo: '물고기자리',
    nameEn: 'Meena',
    symbol: '♓',
    element: 'water',
    modality: 'mutable',
    rulerKo: '목성(구루)',
    keyword: '직관 · 포용 · 영적 감수성',
    moonTrait: '타인의 마음과 공간의 기운을 섬세하게 읽어냅니다. 음악·산책·명상처럼 마음을 비우는 조용한 시간이 최고의 충전이 됩니다.',
    sunTrait: '풍부한 상상력과 포용력으로 경계 너머의 의미를 포착하며, 예술·치유·인문적 영역에서 깊은 울림을 만듭니다.',
    lagnaTrait: '온화하고 부드러운 분위기가 감돌아 처음 만난 이도 마음을 편히 내려놓게 만드는 따뜻한 인상을 줍니다.',
    venusTrait: '금성이 고조(Exalted)되는 자리로, 조건 없는 따뜻함과 낭만, 깊은 정서적 공명이 어우러진 풍요로운 사랑을 품고 있습니다.',
    marsTrait: '직선적 경쟁보다 직관이 가리키는 타이밍에 유연하게 움직여 뜻밖의 창조적 성취를 만들어 냅니다.',
  },
];

export const NAKSHATRAS: readonly NakshatraInfo[] = [
  { index: 0, nameKo: '아슈비니', nameEn: 'Ashwini', rulerId: 'ketu', rulerKo: '케투', symbolKo: '말의 머리', gana: '데바(조화형)', keyword: '신속한 시작 · 치유 · 개척', description: '새로운 길을 누구보다 빠르게 여는 선구자의 별자리입니다. 직관이 민첩하고 막힌 흐름을 단숨에 되살리는 회복 에너지를 지녔습니다.' },
  { index: 1, nameKo: '바라니', nameEn: 'Bharani', rulerId: 'venus', rulerKo: '금성(슈크라)', symbolKo: '생명의 그릇', gana: '마누샤(현실형)', keyword: '인내 · 창조적 변혁 · 책임', description: '무거운 과제를 품어 끝내 새 생명으로 빚어내는 저력이 큽니다. 극단을 경험할수록 내면의 기준과 예술적 깊이가 단단해집니다.' },
  { index: 2, nameKo: '크리티카', nameEn: 'Krittika', rulerId: 'sun', rulerKo: '태양(수리야)', symbolKo: '불꽃과 칼날', gana: '락샤사(돌파형)', keyword: '명쾌한 분별 · 정화 · 당당함', description: '군더더기를 깔끔히 도려내고 본질만 남기는 맑은 불꽃의 성정입니다. 겉은 단호해 보여도 내 사람은 뜨겁게 보살피는 의리가 있습니다.' },
  { index: 3, nameKo: '로히니', nameEn: 'Rohini', rulerId: 'moon', rulerKo: '달(찬드라)', symbolKo: '수레와 반얀나무', gana: '마누샤(현실형)', keyword: '풍요 · 매력 · 감각적 창조', description: '달이 가장 사랑하는 풍요의 별자리입니다. 사람을 끌어당기는 온화한 매력과 일상을 아름답고 넉넉하게 가꾸는 재능이 뛰어납니다.' },
  { index: 4, nameKo: '므리가시라', nameEn: 'Mrigashira', rulerId: 'mars', rulerKo: '화성(망갈라)', symbolKo: '사슴의 머리', gana: '데바(조화형)', keyword: '탐구 · 섬세한 호기심 · 여행', description: '더 나은 답과 새로운 경험을 찾아 가볍게 발걸음을 옮기는 탐험가의 결을 지녔습니다. 부드러운 인상에 날카로운 관찰력이 공존합니다.' },
  { index: 5, nameKo: '아르드라', nameEn: 'Ardra', rulerId: 'rahu', rulerKo: '라후', symbolKo: '눈물방울과 다이아몬드', gana: '마누샤(현실형)', keyword: '폭풍 뒤의 맑음 · 깊은 지성', description: '거센 비바람 뒤에 하늘이 가장 투명해지듯, 고민과 변화를 통과할 때마다 압도적인 통찰과 선명한 지성을 얻는 별자리입니다.' },
  { index: 6, nameKo: '푸나르바수', nameEn: 'Punarvasu', rulerId: 'jupiter', rulerKo: '목성(구루)', symbolKo: '화살통', gana: '데바(조화형)', keyword: '회복 · 귀환 · 지혜로운 낙관', description: '어디서 흔들려도 다시 중심과 빛으로 돌아오는 놀라운 복원력을 지녔습니다. 너그러운 시야와 가르침·나눔의 복이 따릅니다.' },
  { index: 7, nameKo: '푸샤', nameEn: 'Pushya', rulerId: 'saturn', rulerKo: '토성(샤니)', symbolKo: '연꽃과 젖소', gana: '데바(조화형)', keyword: '양육 · 신뢰 · 꾸준한 번영', description: '베딕 점성술에서 가장 길한 별자리 중 하나로 꼽힙니다. 성실하게 타인과 조직을 돌보며 시간이 갈수록 두터운 신뢰와 복을 쌓습니다.' },
  { index: 8, nameKo: '아슐레샤', nameEn: 'Ashlesha', rulerId: 'mercury', rulerKo: '수성(부다)', symbolKo: '똬리 튼 뱀', gana: '락샤사(돌파형)', keyword: '심리 통찰 · 전략 · 깊은 몰입', description: '상대의 속마음과 상황의 숨은 동기를 한눈에 읽어내는 예리한 직관이 돋보입니다. 고도의 집중력과 전략적 감각이 강점입니다.' },
  { index: 9, nameKo: '마가', nameEn: 'Magha', rulerId: 'ketu', rulerKo: '케투', symbolKo: '왕좌', gana: '락샤사(돌파형)', keyword: '품격 · 전통 · 당당한 리더십', description: '스스로의 뿌리와 자부심을 소중히 여기는 왕좌의 별자리입니다. 책임 있는 자리에 설수록 기품과 카리스마가 자연스레 빛납니다.' },
  { index: 10, nameKo: '푸르바 팔구니', nameEn: 'Purva Phalguni', rulerId: 'venus', rulerKo: '금성(슈크라)', symbolKo: '해먹(휴식침대)', gana: '마누샤(현실형)', keyword: '낭만 · 예술 · 삶의 향유', description: '일상의 아름다움과 사랑, 예술적 즐거움을 풍성하게 누릴 줄 아는 별자리입니다. 따뜻하고 유쾌한 매력으로 주변을 환하게 만듭니다.' },
  { index: 11, nameKo: '우타라 팔구니', nameEn: 'Uttara Phalguni', rulerId: 'sun', rulerKo: '태양(수리야)', symbolKo: '침대의 뒷다리', gana: '마누샤(현실형)', keyword: '신의 · 계약 · 든든한 후원', description: '한번 맺은 약속과 인연을 끝까지 책임지는 신의의 별자리입니다. 공정한 태도와 성실한 실행력으로 오랜 동반자와 성과를 얻습니다.' },
  { index: 12, nameKo: '하스타', nameEn: 'Hasta', rulerId: 'moon', rulerKo: '달(찬드라)', symbolKo: '열린 손바닥', gana: '데바(조화형)', keyword: '손재주 · 실용 · 민첩한 완성', description: '머릿속 구상을 실제 손끝으로 정교하게 빚어내는 재능이 뛰어납니다. 위트 있는 소통과 야무진 생활 감각으로 기회를 잡습니다.' },
  { index: 13, nameKo: '치트라', nameEn: 'Chitra', rulerId: 'mars', rulerKo: '화성(망갈라)', symbolKo: '빛나는 보석', gana: '락샤사(돌파형)', keyword: '심미안 · 설계 · 독보적 감각', description: '보석을 세공하듯 일과 공간, 자기만의 스타일을 정교하게 디자인하는 장인의 별자리입니다. 어디서나 눈에 띄는 세련된 감각을 지녔습니다.' },
  { index: 14, nameKo: '스와티', nameEn: 'Swati', rulerId: 'rahu', rulerKo: '라후', symbolKo: '바람에 흔들리는 새싹', gana: '데바(조화형)', keyword: '독립 · 유연성 · 세련된 외교', description: '바람에 꺾이지 않고 부드럽게 휘어지며 뿌리를 지키는 독립적인 영혼입니다. 구속을 싫어하되 사람들과 세련되게 조화를 이룹니다.' },
  { index: 15, nameKo: '비샤카', nameEn: 'Vishakha', rulerId: 'jupiter', rulerKo: '목성(구루)', symbolKo: '승리의 개선문', gana: '락샤사(돌파형)', keyword: '집념 · 목표 달성 · 도약', description: '한번 마음먹은 목표는 시간이 걸려도 끝내 도달하고야 마는 강한 의지의 별자리입니다. 중반 이후 큰 결실로 보답받는 흐름이 뚜렷합니다.' },
  { index: 16, nameKo: '아누라다', nameEn: 'Anuradha', rulerId: 'saturn', rulerKo: '토성(샤니)', symbolKo: '진흙 속 연꽃', gana: '데바(조화형)', keyword: '우정 · 헌신 · 묵묵한 성취', description: '어려운 환경에서도 맑게 피어나는 연꽃처럼 끈기와 충성심이 깊습니다. 사람과 사람을 잇는 따뜻한 유대 속에서 큰 행운이 열립니다.' },
  { index: 17, nameKo: '제슈타', nameEn: 'Jyeshtha', rulerId: 'mercury', rulerKo: '수성(부다)', symbolKo: '부적과 우산', gana: '락샤사(돌파형)', keyword: '수호 · 원숙함 · 위기 돌파', description: '어려운 순간에 앞장서 주변을 지키는 맏이 같은 책임감과 뛰어난 기지를 지녔습니다. 경험을 쌓을수록 깊은 통찰과 권위가 빛납니다.' },
  { index: 18, nameKo: '물라', nameEn: 'Mula', rulerId: 'ketu', rulerKo: '케투', symbolKo: '묶인 뿌리 다발', gana: '락샤사(돌파형)', keyword: '근원 탐구 · 진실 · 과감한 전환', description: '겉껍질에 만족하지 않고 문제의 뿌리까지 파고드는 진실 탐구자입니다. 낡은 틀을 과감히 정리하고 새 토대를 세우는 힘이 강합니다.' },
  { index: 19, nameKo: '푸르바 아샤다', nameEn: 'Purva Ashadha', rulerId: 'venus', rulerKo: '금성(슈크라)', symbolKo: '부채와 키(곡식)', gana: '마누샤(현실형)', keyword: '설득력 · 불굴의 자신감 · 정화', description: '꺾이지 않는 긍정과 설득력 있는 언변으로 사람들의 마음을 움직입니다. 옳다고 믿는 방향에 당당히 깃발을 세우는 활력이 넘칩니다.' },
  { index: 20, nameKo: '우타라 아샤다', nameEn: 'Uttara Ashadha', rulerId: 'sun', rulerKo: '태양(수리야)', symbolKo: '코끼리 상아', gana: '마누샤(현실형)', keyword: '최후의 승리 · 정직 · 오래가는 성취', description: '초반에 서두르기보다 정공법으로 끝까지 버텨 최종 승리를 거두는 별자리입니다. 정직한 평판과 장기적인 결실이 가장 큰 무기입니다.' },
  { index: 21, nameKo: '슈라바나', nameEn: 'Shravana', rulerId: 'moon', rulerKo: '달(찬드라)', symbolKo: '귀와 세 발자국', gana: '데바(조화형)', keyword: '경청 · 학습 · 지혜의 전달', description: '남의 말과 시대의 흐름을 귀 기울여 듣고 핵심을 정확히 흡수하는 지혜의 별자리입니다. 배움과 연결을 통해 명성이 자연스레 퍼집니다.' },
  { index: 22, nameKo: '다니슈타', nameEn: 'Dhanishta', rulerId: 'mars', rulerKo: '화성(망갈라)', symbolKo: '북(드럼)', gana: '락샤사(돌파형)', keyword: '리듬 · 풍요 · 추진력', description: '세상의 박자를 정확히 맞추어 움직이는 리듬감과 현실적 추진력이 뛰어납니다. 음악·감각·조직 운영에서 풍요로운 결실을 맺습니다.' },
  { index: 23, nameKo: '샤타비샤', nameEn: 'Shatabhisha', rulerId: 'rahu', rulerKo: '라후', symbolKo: '빈 원(백 명의 치유사)', gana: '락샤사(돌파형)', keyword: '독립적 통찰 · 치유 · 비밀의 해독', description: '남들이 보지 못하는 숨은 원리를 꿰뚫어 보는 독창적인 연구자·치유사의 별자리입니다. 혼자만의 고요한 공간에서 가장 깊은 영감이 떠오릅니다.' },
  { index: 24, nameKo: '푸르바 바드라파다', nameEn: 'Purva Bhadrapada', rulerId: 'jupiter', rulerKo: '목성(구루)', symbolKo: '두 얼굴과 검', gana: '마누샤(현실형)', keyword: '이상주의 · 변혁 · 깊은 열정', description: '높은 이상과 현실 사이를 치열하게 탐구하며 삶의 의미를 끌어올리는 별자리입니다. 강한 내면의 불꽃으로 주변에 깊은 영감을 줍니다.' },
  { index: 25, nameKo: '우타라 바드라파다', nameEn: 'Uttara Bhadrapada', rulerId: 'saturn', rulerKo: '토성(샤니)', symbolKo: '깊은 물속의 쌍둥이', gana: '마누샤(현실형)', keyword: '깊은 평온 · 지혜 · 자제력', description: '잔잔한 심해처럼 쉽게 요동치지 않는 내면의 깊이와 어른스러운 지혜를 지녔습니다. 인내와 배려가 결국 든든한 풍요로 돌아옵니다.' },
  { index: 26, nameKo: '레바티', nameEn: 'Revati', rulerId: 'mercury', rulerKo: '수성(부다)', symbolKo: '한 쌍의 물고기와 북', gana: '데바(조화형)', keyword: '따뜻한 배웅 · 상상력 · 여정의 완성', description: '27수의 마지막을 지키는 온화하고 풍요로운 수호자의 별자리입니다. 섬세한 공감력과 예술적 감수성으로 긴 여정을 아름답게 매듭짓습니다.' },
];

const VIMSHOTTARI_SEQUENCE: {
  lordId: Exclude<GrahaId, 'lagna'>;
  lordKo: string;
  sanskritKo: string;
  years: number;
  theme: string;
}[] = [
  { lordId: 'ketu', lordKo: '케투', sanskritKo: 'Ketu', years: 7, theme: '불필요한 집착을 덜어내고 내면의 본질과 직관을 다듬는 정화의 시기' },
  { lordId: 'venus', lordKo: '금성', sanskritKo: 'Shukra', years: 20, theme: '관계·심미안·풍요·일상의 즐거움이 넓어지고 감각적 결실이 익어가는 시기' },
  { lordId: 'sun', lordKo: '태양', sanskritKo: 'Surya', years: 6, theme: '자기 정체성과 리더십이 선명해지며 사회적 존재감을 세우는 도약의 시기' },
  { lordId: 'moon', lordKo: '달', sanskritKo: 'Chandra', years: 10, theme: '마음의 안정, 인간적 유대, 감수성과 대중적 호응이 부드럽게 열리는 시기' },
  { lordId: 'mars', lordKo: '화성', sanskritKo: 'Mangala', years: 7, theme: '과감한 실행력과 추진력으로 막혀 있던 판을 정면 돌파하는 행동의 시기' },
  { lordId: 'rahu', lordKo: '라후', sanskritKo: 'Rahu', years: 18, theme: '익숙한 경계를 넘어 새로운 무대·기술·야망을 실험하며 크게 확장하는 시기' },
  { lordId: 'jupiter', lordKo: '목성', sanskritKo: 'Guru', years: 16, theme: '배움·지혜·귀인의 후원과 함께 삶의 그릇과 장기적 복이 넓어지는 시기' },
  { lordId: 'saturn', lordKo: '토성', sanskritKo: 'Shani', years: 19, theme: '꾸준한 규율과 실력으로 흔들리지 않는 전문성과 사회적 기반을 굳히는 시기' },
  { lordId: 'mercury', lordKo: '수성', sanskritKo: 'Budha', years: 17, theme: '지적 소통, 기획·문서·사업 감각, 다채로운 연결이 성과로 이어지는 시기' },
];

const PADA_FOCUS: Record<number, string> = {
  1: '1파다 (다르마 · 시작과 소명): 본연의 의지와 정체성을 당당히 세우는 데 힘이 실립니다.',
  2: '2파다 (아르타 · 현실과 자원): 구체적인 실력과 물질적 기반을 차곡차곡 쌓는 감각이 강합니다.',
  3: '3파다 (카마 · 소통과 확장): 사람과의 교감, 호기심, 다채로운 경험 속에서 재능이 빛납니다.',
  4: '4파다 (목샤 · 통찰과 완성): 깊은 정서적 성찰과 내면의 완성도를 추구하는 성향이 짙습니다.',
};

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

function computeLahiriAyanamsa(jd: number): number {
  // Lahiri Chitrapaksha Ayanamsa: 23° 51' 11" at J2000.0 + 50.290966"/yr precession
  const yearsFromJ2000 = (jd - 2451545.0) / 365.25;
  return 23.8530556 + 0.0139697128 * yearsFromJ2000;
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
 * Paul Schlyter / Jean Meeus 천문 궤도 공식 + 라히리 아야남사 기반 항성황도(Sidereal) 산출
 */
function calculateSiderealLongitudes(jd: number): {
  ayanamsa: number;
  sun: number;
  moon: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  rahu: number;
  ketu: number;
  lagna: number;
} {
  const d = jd - 2451543.5;
  const ayanamsa = computeLahiriAyanamsa(jd);

  // 1. Sun
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

  // 2. Moon & Mean North Node (Rahu)
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

  // 6. Jupiter
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

  // 7. Saturn
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

  // 8. Lagna (Seoul 37.5665°N, 126.9780°E)
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

  // Convert all tropical longitudes to Sidereal (Lahiri)
  const rahuSid = norm360(NMoon - ayanamsa);
  const ketuSid = norm360(rahuSid + 180);

  return {
    ayanamsa,
    sun: norm360(sunLon - ayanamsa),
    moon: norm360(moonLon - ayanamsa),
    mercury: norm360(mercuryLon - ayanamsa),
    venus: norm360(venusLon - ayanamsa),
    mars: norm360(marsLon - ayanamsa),
    jupiter: norm360(jupiterLon - ayanamsa),
    saturn: norm360(saturnLon - ayanamsa),
    rahu: rahuSid,
    ketu: ketuSid,
    lagna: norm360(ascLon - ayanamsa),
  };
}

function formatDegree(degInSign: number): string {
  const whole = Math.floor(degInSign);
  const mins = Math.floor((degInSign - whole) * 60);
  return `${String(whole).padStart(2, '0')}° ${String(mins).padStart(2, '0')}'`;
}

function getNakshatraFromLongitude(siderealLon: number): {
  info: NakshatraInfo;
  pada: number;
  fractionElapsed: number;
} {
  const span = 360 / 27; // 13.3333...°
  const lon = norm360(siderealLon);
  const index = Math.floor(lon / span) % 27;
  const offset = lon - index * span;
  const fractionElapsed = offset / span;
  const pada = Math.min(4, Math.floor(fractionElapsed * 4) + 1);
  return {
    info: NAKSHATRAS[index],
    pada,
    fractionElapsed,
  };
}

function buildGrahaPlacement(
  id: GrahaId,
  nameKo: string,
  sanskritKo: string,
  shortLabel: string,
  symbol: string,
  domainKo: string,
  longitude: number,
  baseRashiIndex: number
): GrahaPlacement {
  const lon = norm360(longitude);
  const signIdx = Math.floor(lon / 30) % 12;
  const sign = VEDIC_RASHIS[signIdx];
  const degreeInSign = lon % 30;
  const nak = getNakshatraFromLongitude(lon);
  const house = ((signIdx - baseRashiIndex + 12) % 12) + 1;
  const houseDomain = HOUSE_DOMAINS[house - 1];

  let interpretation = '';
  switch (id) {
    case 'moon':
      interpretation = `${sign.moonTrait} 출생 달 나크샤트라 '${nak.info.nameKo}'(${nak.pada}파다)의 결이 더해져, ${nak.info.description}`;
      break;
    case 'sun':
      interpretation = `${sign.sunTrait} ${houseDomain} 영역에서 스스로의 명분과 존재감을 세우려는 의지가 또렷하게 작동합니다.`;
      break;
    case 'lagna':
      interpretation = `${sign.lagnaTrait} 라그나 나크샤트라 '${nak.info.nameKo}'의 분위기가 첫인상과 삶의 기본 리듬에 자연스레 스며듭니다.`;
      break;
    case 'venus':
      interpretation = `${sign.venusTrait} ${houseDomain} 영역을 통해 일상의 미감, 인연의 기쁨, 풍요의 감각이 피어납니다.`;
      break;
    case 'mars':
      interpretation = `${sign.marsTrait} ${houseDomain} 영역에서 승부욕과 실행력이 집중적으로 발휘됩니다.`;
      break;
    case 'mercury':
      interpretation = `부다(수성)가 ${sign.sanskritKo}(${sign.nameKo}) · ${houseDomain}에 놓여 사고와 말씨에 '${sign.keyword}'의 결이 배어납니다. 정보를 분석하고 사람과 거래·소통할 때 명쾌한 실무 감각이 빛납니다.`;
      break;
    case 'jupiter':
      interpretation = `지혜와 확장의 구루(목성)가 ${sign.sanskritKo}(${sign.nameKo}) · ${houseDomain}에 자리했습니다. '${sign.keyword}'와 맞닿은 태도로 세상과 나눌수록 귀인과 배움의 복이 커집니다.`;
      break;
    case 'saturn':
      interpretation = `업보와 성숙의 샤니(토성)가 ${sign.sanskritKo}(${sign.nameKo}) · ${houseDomain}에 놓여 있습니다. 초반에는 이 영역에서 기준이 엄격하게 느껴지지만, 묵묵히 단련할수록 중반 이후 가장 단단한 전문성과 권위로 보답받습니다.`;
      break;
    case 'rahu':
      interpretation = `이번 생의 확장과 열망을 가리키는 라후(북교점)가 ${sign.sanskritKo}(${sign.nameKo}) · ${houseDomain}에 머물러 있습니다. 익숙하지 않은 새 영역을 과감히 탐험하고 욕망을 건설적 성취로 바꿀 때 큰 도약이 일어납니다.`;
      break;
    case 'ketu':
      interpretation = `타고난 내공과 비움의 지혜를 뜻하는 케투(남교점)가 ${sign.sanskritKo}(${sign.nameKo}) · ${houseDomain}에 놓였습니다. 이미 익숙하고 잘하는 영역이므로 과도한 집착을 내려놓을수록 오히려 맑은 직관과 완성도가 드러납니다.`;
      break;
  }

  return {
    id,
    nameKo,
    sanskritKo,
    shortLabel,
    symbol,
    domainKo,
    longitude: lon,
    sign,
    degreeInSign,
    degreeLabel: formatDegree(degreeInSign),
    nakshatra: nak.info,
    pada: nak.pada,
    house,
    houseDomain,
    interpretation,
  };
}

function calculateVimshottariDashas(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  moonLon: number
): AstrologyChart['dashas'] {
  const birthDecimalYear = birthYear + (birthMonth - 1) / 12 + (birthDay - 1) / 365.25;
  const referenceYear = 2026.9; // 2026년 11월 말 기준 (2026 결산 ~ 2027 신년)

  const nak = getNakshatraFromLongitude(moonLon);
  const startSeqIdx = nak.info.index % 9;
  const firstEntry = VIMSHOTTARI_SEQUENCE[startSeqIdx];
  const remainingFraction = 1 - nak.fractionElapsed;
  const firstDuration = firstEntry.years * remainingFraction;

  // Build full 120+ year Mahadasha sequence
  const allPeriods: (DashaPeriod & { exactStart: number; exactEnd: number; seqIdx: number })[] = [];
  let cursor = birthDecimalYear;

  for (let step = 0; step < 12; step++) {
    const seqIdx = (startSeqIdx + step) % 9;
    const item = VIMSHOTTARI_SEQUENCE[seqIdx];
    const dur = step === 0 ? firstDuration : item.years;
    const exactStart = cursor;
    const exactEnd = cursor + dur;
    const isCurrent = referenceYear >= exactStart && referenceYear < exactEnd;

    allPeriods.push({
      lordId: item.lordId,
      lordKo: item.lordKo,
      sanskritKo: item.sanskritKo,
      startYear: Math.floor(exactStart),
      endYear: Math.floor(exactEnd),
      durationYears: Number(dur.toFixed(1)),
      isCurrent,
      theme: item.theme,
      exactStart,
      exactEnd,
      seqIdx,
    });
    cursor = exactEnd;
  }

  let currentIdx = allPeriods.findIndex((p) => p.isCurrent);
  if (currentIdx === -1) {
    currentIdx = referenceYear < birthDecimalYear ? 0 : Math.min(allPeriods.length - 1, 5);
    allPeriods[currentIdx].isCurrent = true;
  }

  const currentMaha = allPeriods[currentIdx];

  // Calculate Antardasha (Bhukti) inside current Mahadasha
  // Standard formula: Antardasha years = (MahaFullYears * AntarFullYears) / 120
  const mahaFullYears = VIMSHOTTARI_SEQUENCE[currentMaha.seqIdx].years;
  // If current is the birth partial dasha, align from virtual start of the full mahadasha
  const mahaVirtualStart = currentMaha.exactEnd - mahaFullYears;
  let antarCursor = mahaVirtualStart;
  let activeAntar = VIMSHOTTARI_SEQUENCE[currentMaha.seqIdx];
  let activeAntarEnd = currentMaha.exactEnd;

  for (let k = 0; k < 9; k++) {
    const aIdx = (currentMaha.seqIdx + k) % 9;
    const aItem = VIMSHOTTARI_SEQUENCE[aIdx];
    const aDur = (mahaFullYears * aItem.years) / 120;
    const aEnd = antarCursor + aDur;
    if (referenceYear >= antarCursor && referenceYear < aEnd) {
      activeAntar = aItem;
      activeAntarEnd = aEnd;
      break;
    }
    antarCursor = aEnd;
  }

  const endYearInt = Math.floor(activeAntarEnd);
  const endMonthInt = Math.max(1, Math.min(12, Math.round((activeAntarEnd - endYearInt) * 12) + 1));

  // Return 5-window timeline centered around current Mahadasha
  const windowStart = Math.max(0, Math.min(currentIdx - 1, allPeriods.length - 5));
  const timeline: DashaPeriod[] = allPeriods
    .slice(windowStart, windowStart + 5)
    .map(({ exactStart: _s, exactEnd: _e, seqIdx: _i, ...rest }) => rest);

  const { exactStart: _cs, exactEnd: _ce, seqIdx: _ci, ...cleanCurrent } = currentMaha;

  return {
    currentMahadasha: cleanCurrent,
    currentAntardasha: {
      lordKo: activeAntar.lordKo,
      sanskritKo: activeAntar.sanskritKo,
      endYearMonth: `${endYearInt}년 ${endMonthInt}월경까지`,
      theme: activeAntar.theme,
    },
    timeline,
  };
}

function buildCrossInsight(
  saju: SajuChart,
  moon: GrahaPlacement,
  sun: GrahaPlacement,
  lagna: GrahaPlacement | null,
  rahu: GrahaPlacement,
  ketu: GrahaPlacement,
  dominantTattva: VedicElementBalance,
  currentMaha: DashaPeriod
): CrossInsight {
  const strongestSaju = [...saju.elementBalance].sort(
    (a, b) => b.weightedScore - a.weightedScore
  )[0];

  const sajuActive = strongestSaju.element === 'wood' || strongestSaju.element === 'fire';
  const vedicActive = dominantTattva.element === 'fire' || dominantTattva.element === 'air';

  const sajuGrounded = strongestSaju.element === 'earth' || strongestSaju.element === 'metal';
  const vedicGrounded = dominantTattva.element === 'earth';

  const sajuDeep = strongestSaju.element === 'water';
  const vedicDeep = dominantTattva.element === 'water';

  let headline = '';
  let sharedTheme = '';
  let contrastNote = '';

  if (
    (sajuActive && vedicActive) ||
    (sajuGrounded && vedicGrounded) ||
    (sajuDeep && vedicDeep)
  ) {
    headline = `명리의 ${strongestSaju.hangul}(${strongestSaju.hanja}) 기운과 베딕의 ${dominantTattva.nameKo} 원소가 한 결로 맞물리는 선명한 명식`;
    sharedTheme = `사주 원국에서 ${strongestSaju.hangul}(${strongestSaju.hanja})이 ${strongestSaju.percentage}%로 주도권을 쥐고 있으며, 항성황도 베딕 쿤달리에서도 ${dominantTattva.nameKo} 원소가 ${dominantTattva.percentage}%로 가장 강하게 작동합니다. 출생 달 나크샤트라 '${moon.nakshatra.nameKo}'(${moon.pada}파다)의 기질까지 같은 방향을 가리켜, 스스로 납득한 목표에 집중할 때 에너지 누수가 적습니다.`;
    contrastNote = `두 체계 모두 같은 결을 증폭시키고 있으므로, 사주 균형 용신인 ${ELEMENT_META[saju.yongsin.primary].hangul}(${ELEMENT_META[saju.yongsin.primary].hanja})과 라후(${rahu.sign.sanskritKo} · ${rahu.house}하우스)가 가리키는 새로운 시도를 곁들일 때 치우침 없는 입체감이 완성됩니다.`;
  } else {
    headline = `사주 '${saju.pillars.day.ganjiHangul}일주'의 뼈대 위에 찬드라 '${moon.sign.sanskritKo}(${moon.sign.nameKo}) · ${moon.nakshatra.nameKo}'의 깊이가 겹치는 입체 명식`;
    sharedTheme = `동양 만세력에서는 ${saju.dayMaster.hangul}(${saju.dayMaster.hanja}) 일간과 ${saju.gyeokguk.name}을 중심으로 ${strongestSaju.hangul}(${strongestSaju.hanja})의 색채가 두드러지는 반면, 인도 베딕 점성술에서는 마음의 중심인 찬드라(달)가 ${moon.sign.sanskritKo}(${moon.sign.nameKo})의 '${moon.nakshatra.nameKo}' 나크샤트라에 놓여 ${dominantTattva.nameKo} 원소(${dominantTattva.percentage}%)가 작동합니다.`;
    contrastNote = `사주와 베딕이 서로 다른 결을 보여 준다는 것은 상황에 따라 꺼내 쓸 수 있는 내면의 도구가 두 겹이라는 뜻입니다. 사회적 역할에서는 사주 격국(${saju.gyeokguk.name})의 방식이, 마음의 휴식과 직관에서는 '${moon.nakshatra.nameKo}' 나크샤트라의 감각이 자연스럽게 길잡이가 됩니다.`;
  }

  return {
    headline,
    sharedTheme,
    contrastNote,
    synthesisPoints: [
      {
        label: '본성과 마음의 별 (일간 × 찬드라·나크샤트라)',
        content: `사주 일간 '${saju.dayMaster.hangul}(${saju.dayMaster.hanja}) · ${saju.dayMaster.natureTitle}'의 본성에 베딕 출생 달 '${moon.sign.sanskritKo}(${moon.sign.nameKo}) · ${moon.nakshatra.nameKo}(${moon.nakshatra.keyword})'의 정서 리듬이 포개져 고유한 내면을 이룹니다.`,
      },
      {
        label: '드러나는 태도 (격국 × 라그나·태양)',
        content: lagna
          ? `사주 '${saju.gyeokguk.name}'의 사회적 역할에 상승궁 라그나 '${lagna.sign.sanskritKo}(${lagna.sign.nameKo})'의 첫인상과 수리야(태양) '${sun.sign.sanskritKo}'의 의지가 더해져 세상과 만나는 방식을 만듭니다.`
          : `사주 '${saju.gyeokguk.name}'의 사회적 역할에 수리야(태양) '${sun.sign.sanskritKo}(${sun.sign.nameKo})'의 의지가 더해져 대외적 존재감을 세웁니다.`,
      },
      {
        label: '이번 생의 성장축 (용신 × 라후·케투)',
        content: `명식의 균형을 여는 용신 ${ELEMENT_META[saju.yongsin.primary].hangul}(${ELEMENT_META[saju.yongsin.primary].hanja})과 함께, 베딕 라후(${rahu.house}하우스 · ${rahu.sign.sanskritKo})가 도전할 무대를, 케투(${ketu.house}하우스 · ${ketu.sign.sanskritKo})가 내려놓을 집착을 짚어 줍니다.`,
      },
    ],
    seoldamQuote: `동양의 만세력과 인도의 항성 쿤달리를 나란히 펼쳐 보니 결이 참 깊군요. 사주로는 ${saju.pillars.day.ganjiHangul}일주의 뼈대가, 베딕으로는 ‘${moon.nakshatra.nameKo}’ 달과 현재 흐르는 ${currentMaha.lordKo}(${currentMaha.sanskritKo}) 마하다샤의 박자가 겹쳐 보입니다. 두 지도를 함께 살피며 본인의 속도를 믿어 보시길 바랍니다.`,
    footnote: `24절기 원국(${saju.pillars.day.ganjiHanja}) × 라히리 항성황도(찬드라 ${moon.sign.sanskritKo} · ${moon.nakshatra.nameKo} ${moon.pada}파다 · ${currentMaha.lordKo} 대운)`,
  };
}

export function calculateAstrologyChart(saju: SajuChart): AstrologyChart {
  const { year, month, day, hour, minute } = saju.solarDate;
  const jd = getJulianDayFromUtc(year, month, day, hour, minute);
  const lons = calculateSiderealLongitudes(jd);

  const moonSignIdx = Math.floor(norm360(lons.moon) / 30) % 12;
  const lagnaSignIdx = Math.floor(norm360(lons.lagna) / 30) % 12;
  const chartBase: 'lagna' | 'chandra' = saju.input.unknownTime ? 'chandra' : 'lagna';
  const baseRashiIndex = chartBase === 'lagna' ? lagnaSignIdx : moonSignIdx;

  const lagna = saju.input.unknownTime
    ? null
    : buildGrahaPlacement(
        'lagna',
        '라그나(상승궁)',
        'Lagna',
        '라그나',
        'ASC',
        '삶의 출발점 · 첫인상',
        lons.lagna,
        baseRashiIndex
      );

  const moon = buildGrahaPlacement(
    'moon',
    '달',
    'Chandra · 찬드라',
    '달',
    '☽',
    '마음 · 정서 · 출생 나크샤트라',
    lons.moon,
    baseRashiIndex
  );
  const sun = buildGrahaPlacement(
    'sun',
    '태양',
    'Surya · 수리야',
    '태양',
    '☉',
    '영혼 · 자존감 · 명분',
    lons.sun,
    baseRashiIndex
  );
  const mars = buildGrahaPlacement(
    'mars',
    '화성',
    'Mangala · 망갈라',
    '화성',
    '♂',
    '용기 · 실행 에너지',
    lons.mars,
    baseRashiIndex
  );
  const mercury = buildGrahaPlacement(
    'mercury',
    '수성',
    'Budha · 부다',
    '수성',
    '☿',
    '지성 · 언어 · 실무 감각',
    lons.mercury,
    baseRashiIndex
  );
  const jupiter = buildGrahaPlacement(
    'jupiter',
    '목성',
    'Guru · 구루',
    '목성',
    '♃',
    '지혜 · 확장 · 귀인의 복',
    lons.jupiter,
    baseRashiIndex
  );
  const venus = buildGrahaPlacement(
    'venus',
    '금성',
    'Shukra · 슈크라',
    '금성',
    '♀',
    '사랑 · 심미안 · 풍요',
    lons.venus,
    baseRashiIndex
  );
  const saturn = buildGrahaPlacement(
    'saturn',
    '토성',
    'Shani · 샤니',
    '토성',
    '♄',
    '책임 · 규율 · 장기 성취',
    lons.saturn,
    baseRashiIndex
  );
  const rahu = buildGrahaPlacement(
    'rahu',
    '라후',
    'Rahu · 북교점',
    '라후',
    '☊',
    '이번 생의 확장 · 열망축',
    lons.rahu,
    baseRashiIndex
  );
  const ketu = buildGrahaPlacement(
    'ketu',
    '케투',
    'Ketu · 남교점',
    '케투',
    '☋',
    '타고난 내공 · 비움의 지혜',
    lons.ketu,
    baseRashiIndex
  );

  const placements: GrahaPlacement[] = [
    ...(lagna ? [lagna] : []),
    moon,
    sun,
    mars,
    mercury,
    jupiter,
    venus,
    saturn,
    rahu,
    ketu,
  ];

  // Vedic 4 Tattva Element distribution (Moon & Lagna weighted 1.5x, Rahu/Ketu 0.75x)
  const elCounts: Record<VedicElement, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const elWeights: Record<VedicElement, number> = { fire: 0, earth: 0, air: 0, water: 0 };

  for (const p of placements) {
    const w =
      p.id === 'moon' || p.id === 'lagna'
        ? 1.5
        : p.id === 'rahu' || p.id === 'ketu'
          ? 0.75
          : 1.0;
    elCounts[p.sign.element] += 1;
    elWeights[p.sign.element] += w;
  }

  const totalElW = Object.values(elWeights).reduce((a, b) => a + b, 0) || 1;
  const elements: VedicElementBalance[] = (['fire', 'earth', 'air', 'water'] as VedicElement[]).map(
    (el) => ({
      element: el,
      nameKo: VEDIC_ELEMENT_META[el].nameKo,
      count: elCounts[el],
      percentage: Math.round((elWeights[el] / totalElW) * 100),
      color: VEDIC_ELEMENT_META[el].color,
    })
  );

  const dominantElement = [...elements].sort((a, b) => b.percentage - a.percentage)[0];
  const dashas = calculateVimshottariDashas(year, month, day, lons.moon);

  const rahuKetuAxis: RahuKetuAxis = {
    rahuSign: rahu.sign,
    ketuSign: ketu.sign,
    rahuHouse: rahu.house,
    ketuHouse: ketu.house,
    headline: `라후 ${rahu.sign.sanskritKo}(${rahu.house}하우스) ↔ 케투 ${ketu.sign.sanskritKo}(${ketu.house}하우스) 카르마 축`,
    rahuGuidance: `이번 생에서 새롭게 넓혀 가야 할 무대는 '${rahu.houseDomain}'과 ${rahu.sign.sanskritKo}(${rahu.sign.nameKo})의 '${rahu.sign.keyword}'입니다. 다소 낯설고 욕심이 생기는 영역이지만 정면으로 배워 나갈 때 가장 큰 성장이 열립니다.`,
    ketuGuidance: `반대편 '${ketu.houseDomain}'과 ${ketu.sign.sanskritKo}(${ketu.sign.nameKo})는 이미 내공이 축적된 자리입니다. 지나친 집착이나 완벽주의를 내려놓고 담백하게 활용할수록 본연의 직관이 맑게 빛납니다.`,
  };

  const crossInsight = buildCrossInsight(
    saju,
    moon,
    sun,
    lagna,
    rahu,
    ketu,
    dominantElement,
    dashas.currentMahadasha
  );

  return {
    ayanamsaDeg: Number(lons.ayanamsa.toFixed(2)),
    ayanamsaLabel: `라히리 아야남사 ${formatDegree(lons.ayanamsa)}`,
    chartBase,
    baseRashiIndex,
    placements,
    lagna,
    moon,
    sun,
    mars,
    mercury,
    jupiter,
    venus,
    saturn,
    rahu,
    ketu,
    janmaNakshatra: {
      info: moon.nakshatra,
      pada: moon.pada,
      padaFocus: PADA_FOCUS[moon.pada] ?? PADA_FOCUS[1],
    },
    dashas,
    rahuKetuAxis,
    elements,
    dominantElement,
    crossInsight,
  };
}
