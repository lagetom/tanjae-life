import { generateAnnualReport } from './annualFortune.ts';
import { calculateAstrologyChart } from './astrology.ts';
import { ELEMENT_META } from './manseryeok.ts';
import {
  DAY_PILLAR_PROFILES,
  ELEMENT_HEALTH_GUIDE,
  GYEOKGUK_PROFILES,
} from './sajuKnowledge.ts';
import type {
  ElementBalanceItem,
  ElementType,
  ReadingReport,
  ReportChapter,
  SajuChart,
  TenGodGroup,
} from '../../src/types/saju.ts';

function getTenGodPercent(chart: SajuChart, group: TenGodGroup): number {
  return chart.tenGodGroups.find((g) => g.group === group)?.percentage ?? 0;
}

function getSortedElements(balance: ElementBalanceItem[]): {
  strongest: ElementBalanceItem;
  weakest: ElementBalanceItem;
  excessive: ElementBalanceItem[];
  lacking: ElementBalanceItem[];
} {
  const sorted = [...balance].sort((a, b) => b.weightedScore - a.weightedScore);
  return {
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
    excessive: balance.filter((b) => b.status === '과다'),
    lacking: balance.filter((b) => b.status === '결핍' || b.status === '부족'),
  };
}

function getSpousePalaceInsight(chart: SajuChart): {
  trait: string;
  advice: string;
} {
  const dayBranchTenGod = chart.pillars.day.branchTenGod;
  const map: Record<string, { trait: string; advice: string }> = {
    비견: {
      trait: '친구처럼 편안하고 대등하게 소통하는 연애를 지향합니다. 서로의 취미와 일상을 자연스레 공유할 때 안정감이 커집니다.',
      advice: '가까워질수록 자존심 싸움으로 번지지 않도록, 의견이 다를 때 한 박자 먼저 양보하는 여유가 관계를 깊게 만듭니다.',
    },
    겁재: {
      trait: '열정적이고 극적인 끌림이 있으며 상대에게 깊은 몰입을 보입니다. 강한 개성과 추진력을 지닌 파트너에게 매력을 느낍니다.',
      advice: '감정이 뜨거울수록 상대를 통제하려 하기보다, 각자의 독립적인 숨 쉴 공간을 존중해 줄 때 장기적인 신뢰가 쌓입니다.',
    },
    식신: {
      trait: '다정하고 세심하게 상대를 챙기며, 맛있는 음식과 쾌적한 일상을 함께 누리는 온화한 애정 스타일을 지녔습니다.',
      advice: '상대에게 베푸는 만큼 자신의 피로와 서운함도 솔직하고 부드럽게 표현해야 관계의 균형이 오래 유지됩니다.',
    },
    상관: {
      trait: '감각적이고 대화가 생동감 넘치며, 지적인 자극이나 미적 취향을 나눌 수 있는 상대에게 강하게 끌립니다.',
      advice: '날카로운 직관이 말로 곧장 나갈 때 상대가 상처받을 수 있으니, 애정이 깊을수록 따뜻한 어조를 의식하면 좋습니다.',
    },
    편재: {
      trait: '시원시원하고 유쾌한 데이트를 즐기며, 상대의 기분을 잘 살피고 분위기를 주도하는 세련된 배려심이 돋보입니다.',
      advice: '호기심이 넓은 만큼 한 사람과의 깊이 있는 약속을 지켜내는 꾸준함을 보여줄 때 신뢰가 단단해집니다.',
    },
    정재: {
      trait: '성실하고 책임감 있는 헌신형으로, 화려한 말보다 변함없는 행동과 안정적인 생활 감각으로 사랑을 증명합니다.',
      advice: '현실적인 안정도 중요하지만, 가끔은 계산을 내려놓고 작은 낭만과 감정 표현을 건네면 관계에 생기가 돕니다.',
    },
    편관: {
      trait: '책임감이 강하고 듬직한 카리스마를 지닌 인연에 끌리며, 한번 마음을 열면 어려운 상황에서도 끝까지 곁을 지킵니다.',
      advice: '관계 속에서 지나치게 긴장하거나 완벽히 해내려 애쓰기보다, 약한 모습도 편히 보여줄 수 있는 안전지대를 만드세요.',
    },
    정관: {
      trait: '예의와 신뢰를 중시하는 단정한 연애관으로, 사회적으로 성실하고 가치관이 반듯한 파트너와 안정적인 조화를 이룹니다.',
      advice: '상대에게 높은 도덕적·현실적 기준을 적용해 답답해지지 않도록, 때로는 유머와 부드러운 타협을 곁들이면 좋습니다.',
    },
    편인: {
      trait: '내면의 결이 맞고 말하지 않아도 마음을 읽어주는 깊은 교감을 원합니다. 독창적이고 사려 깊은 사람에게 매력을 느낍니다.',
      advice: '혼자만의 생각 속에서 상대의 의도를 지레짐작하지 말고, 궁금한 점은 담백하게 물어보며 오해를 줄이는 것이 핵심입니다.',
    },
    정인: {
      trait: '따뜻한 포용력과 정서적 안정을 가장 중시하며, 서로를 격려하고 보호해 주는 든든한 울타리 같은 사랑을 추구합니다.',
      advice: '상대의 배려에 익숙해지거나 지나치게 의존하기보다, 서로 독립적인 어른으로서 감사 표현을 자주 나누면 더욱 단단해집니다.',
    },
  };
  return map[dayBranchTenGod] ?? map['정인'];
}

function getElementCareerKeywords(el: ElementType): string {
  const map: Record<ElementType, string> = {
    wood: '교육, 출판, 기획, 바이오·친환경, 패션·인테리어, 성장형 초기 비즈니스',
    fire: '미디어, 마케팅, 브랜딩, IT 플랫폼, 조명·영상·공연, 대중 커뮤니케이션',
    earth: '부동산, 건축·공간기획, 중개·플랫폼 운영, 인사·조직관리, 웰니스·농식품',
    metal: '금융·회계, 법률·감사, 엔지니어링·정밀기술, 의료·치의학, 구조 설계·데이터',
    water: '무역·물류, 전략 컨설팅, 리서치·인문, 소프트웨어·AI·네트워크, 외교·글로벌 비즈니스',
  };
  return map[el];
}

export function generateReadingReport(chart: SajuChart): ReadingReport {
  const { dayMaster, dayPillarCode, gyeokguk, strength, yongsin, pillars, interactions, sinsal, input } =
    chart;
  const dayProfile = DAY_PILLAR_PROFILES[dayPillarCode] ?? DAY_PILLAR_PROFILES['갑자'];
  const gyeokProfile = GYEOKGUK_PROFILES[gyeokguk.group];
  const { strongest, weakest, excessive, lacking } = getSortedElements(chart.elementBalance);

  const bigeopPct = getTenGodPercent(chart, '비겁');
  const siksangPct = getTenGodPercent(chart, '식상');
  const jaeseongPct = getTenGodPercent(chart, '재성');
  const gwanseongPct = getTenGodPercent(chart, '관성');
  const inseongPct = getTenGodPercent(chart, '인성');

  const displayName = input.name.trim() ? `${input.name.trim()} 님의 ` : '';
  const coverTitle = `${displayName}2026 연말결산 · 2027 신년 명리 리포트`;

  const seasonWord = pillars.month.branch.season;
  const dmTitle = `${dayMaster.hangul}(${dayMaster.hanja}) · ${dayMaster.natureTitle}`;

  const openingGreeting = `${pillars.day.ganjiHangul}(${pillars.day.ganjiHanja})일주, ${chart.solarTermName} 무렵에 태어나셨습니다. ${dayProfile.seoldamQuip}`;

  const executiveSummary = `${dmTitle}의 본성을 바탕으로 ${gyeokguk.name}의 사회적 기질이 중심을 잡는 ${strength.grade} 명식입니다. 원국에서는 ${strongest.hangul}(${strongest.hanja}) 기운이 ${strongest.percentage}%로 가장 뚜렷하게 작동하며, 전체 균형을 매끄럽게 열어 주는 핵심 보완 기운(용신)은 ${ELEMENT_META[yongsin.primary].hangul}(${ELEMENT_META[yongsin.primary].hanja})입니다.`;

  // ------------------------------------------------------------------
  // Chapter 01: 성격 및 기질
  // ------------------------------------------------------------------
  const hasClash = interactions.some((i) => i.type === '지지충');
  const hasCombine = interactions.some((i) => i.type === '천간합' || i.type === '지지육합' || i.type === '지지삼합');
  const personalityParagraphs: string[] = [
    `${pillars.day.ganjiHangul}(${pillars.day.ganjiHanja})일주의 본질은 '${dayProfile.symbol}'으로 비유됩니다. ${dayProfile.coreTrait} ${dayProfile.innerDrive}`,
    `사회적 태도를 결정짓는 월지 격국은 ${gyeokguk.name}으로 자리하고 있습니다. ${gyeokProfile.socialStyle} 일간의 에너지 균형은 ${strength.grade}(지지력 지수 ${strength.score}%) 구간에 해당하여, ${strength.explanation}`,
    `원국 내 오행 분포를 보면 ${strongest.hangul}(${strongest.hanja}) 기운이 ${strongest.percentage}%로 가장 도드라지고, 음양 비율은 양 ${chart.yinYangRatio.yangPercent}% · 음 ${chart.yinYangRatio.yinPercent}%입니다. ${
      chart.yinYangRatio.yangPercent >= 65
        ? '양기가 우세해 생각이 행동으로 빠르게 이어지고 솔직담백한 표현을 선호합니다.'
        : chart.yinYangRatio.yinPercent >= 65
          ? '음기가 우세해 속이 깊고 신중하며, 상황을 충분히 숙고한 뒤 정교하게 움직입니다.'
          : '음과 양이 고르게 배합되어 외향적 추진력과 내향적 성찰을 상황에 맞게 유연하게 전환합니다.'
    }${
      hasCombine
        ? ' 또한 원국 내에 합(合)의 구조가 형성되어 타인과 호흡을 맞추고 인연을 결속시키는 융화력이 자연스럽게 발휘됩니다.'
        : ''
    }${
      hasClash
        ? ' 지지에 충(沖)의 역동성이 자리해 정체된 현실에 안주하기보다 스스로 변화를 일으키며 성장하는 기질이 함께 작동합니다.'
        : ''
    }`,
  ];

  const personalityChapter: ReportChapter = {
    id: 'personality',
    index: '01',
    title: '성격 및 기질',
    subtitle: '타고난 본성, 내면의 동기, 그리고 세상에 드러나는 결',
    evidenceLine: `${pillars.day.ganjiHangul}일주 · ${gyeokguk.name} · ${strength.grade}(${strength.score}%) · 최강 오행 ${strongest.hangul}(${strongest.hanja})`,
    headline: dayProfile.symbol,
    paragraphs: personalityParagraphs,
    keyPoints: [
      {
        label: '핵심 강점',
        content: `${dayMaster.hangul}(${dayMaster.hanja}) 일간 고유의 ${
          dayMaster.element === 'wood'
            ? '성장 의지와 곧은 기획력'
            : dayMaster.element === 'fire'
              ? '밝은 확산력과 직관적 추진력'
              : dayMaster.element === 'earth'
                ? '묵직한 신뢰감과 중재력'
                : dayMaster.element === 'metal'
                  ? '명쾌한 결단력과 완성도'
                  : '깊은 통찰력과 유연한 지혜'
        }에 ${gyeokguk.group}(${gyeokguk.tenGod})의 사회적 감각이 더해져 자기만의 색채가 분명합니다.`,
      },
      {
        label: '주의할 습관',
        content:
          excessive.length > 0
            ? `${excessive.map((e) => `${e.hangul}(${e.hanja})`).join(', ')} 기운이 과하게 몰려 있어 스트레스 상황에서 해당 기질이 고집이나 과열로 치우치지 않도록 의식적인 완급 조절이 필요합니다.`
            : lacking.length > 0
              ? `원국에서 ${weakest.hangul}(${weakest.hanja}) 기운(${weakest.percentage}%)이 약하므로, 부족한 영역의 성향을 보완해 주는 환경이나 동료를 곁에 두면 의사결정이 훨씬 입체적으로 변합니다.`
              : '오행이 비교적 고르게 흩어져 다재다능하지만, 때로는 모든 것을 무난히 처리하려다 핵심 강점 한 가지를 뾰족하게 세우는 데 망설일 수 있습니다.',
      },
    ],
    seoldamNote: {
      mood: 'calm',
      tag: '재(災)의 여백 노트 · 기질',
      quote:
        strength.grade === '신강' || strength.grade === '극왕'
          ? `자기 중심이 단단한 사주라 남의 말에 쉽게 휩쓸리지 않는 점이 참 훌륭합니다. 다만 본인의 기준이 옳더라도 상대의 속도까지 재촉하지 않으시면 곁에 사람이 훨씬 오래 남을 것입니다.`
          : strength.grade === '중화'
            ? `모난 데 없이 균형이 잘 잡힌 원국이군요. 어디에 두어도 자연스레 스며드는 것이 큰 복이지만, 가끔은 '이것은 제가 원하는 방향입니다'라고 선명하게 말씀해 보셔도 괜찮습니다.`
            : `섬세한 감각이 아주 예민하게 열려 있는 명식이군요. 남들보다 많은 것을 먼저 읽어내시다 보니 쉽게 지치실 수 있습니다. 마음을 쓰는 일에도 우선순위를 정해 보시길 권합니다.`,
      footnote: `월지 ${pillars.month.branch.hangul}(${pillars.month.branch.hanja}) · 일지 ${pillars.day.branch.hangul}(${pillars.day.branch.hanja}) 12운성 '${pillars.day.lifeStage}' 기준`,
    },
  };

  // ------------------------------------------------------------------
  // Chapter 02: 직업 및 적성
  // ------------------------------------------------------------------
  const primaryCareerEl = yongsin.primary;
  const orgVsIndep =
    gwanseongPct >= bigeopPct + 5
      ? '체계와 역할이 분명한 전문 조직·기관·기업 내에서 직위와 평판을 쌓아 올릴 때 안정감과 성취가 함께 커지는 조직 최적화형입니다.'
      : bigeopPct >= 28 || siksangPct >= 30
        ? '지시받은 틀을 반복하기보다 기획 권한과 자율성이 보장되는 프로젝트 리더, 전문 프리랜서, 독립 브랜드·사업 영역에서 역량이 배가되는 주도형입니다.'
        : '초기에는 체계적인 조직에서 검증된 방법론과 네트워크를 흡수한 뒤, 중반 이후 자신만의 전문 영역이나 독립 프로젝트로 확장하는 하이브리드 경로가 가장 이상적입니다.';

  const hasMunchang = sinsal.some((s) => s.id === 'munchang');
  const hasYeokma = sinsal.some((s) => s.id === 'yeokma');
  const hasHwagae = sinsal.some((s) => s.id === 'hwagae');

  const careerSpecialNotes: string[] = [];
  if (hasMunchang) careerSpecialNotes.push('문창귀인이 자리해 문서 작성, 기획, 교육, 자격 취득 분야에서 두각을 나타냅니다.');
  if (hasYeokma) careerSpecialNotes.push('역마의 기동력이 작동해 출장, 글로벌 협업, 유통, 외부 미팅이 많은 직무에서 활력이 살아납니다.');
  if (hasHwagae) careerSpecialNotes.push('화개살의 깊은 사유가 더해져 연구, 예술, 디자인, 인문·철학적 깊이가 필요한 분야에 강점이 있습니다.');

  const careerChapter: ReportChapter = {
    id: 'career',
    index: '02',
    title: '직업 및 적성',
    subtitle: '재능이 성과로 전환되는 무대와 커리어 전략',
    evidenceLine: `${gyeokguk.name} · 식상 ${siksangPct}% · 관성 ${gwanseongPct}% · 용신 ${ELEMENT_META[primaryCareerEl].hangul}(${ELEMENT_META[primaryCareerEl].hanja})`,
    headline: `${gyeokguk.group}의 재능을 ${ELEMENT_META[primaryCareerEl].hangul}(${ELEMENT_META[primaryCareerEl].hanja}) 분야의 실무로 확장하는 구조`,
    paragraphs: [
      `직업적 성향의 뼈대는 월지 ${gyeokguk.name}에서 출발합니다. ${gyeokProfile.workStyle} 특히 십성 분포상 ${
        siksangPct >= 22
          ? '식상(표현·제작)의 비율이 살아 있어 머릿속 구상을 실제 콘텐츠나 제품으로 뽑아내는 출력 능력이 우수합니다.'
          : inseongPct >= 22
            ? '인성(사고·학습)의 비율이 탄탄해 복잡한 정보를 분석하고 전략과 지식을 구조화하는 두뇌 활용 직무에 강합니다.'
            : jaeseongPct >= 22
              ? '재성(현실·운영)의 감각이 발달해 시장의 수요를 빠르게 포착하고 실질적인 비즈니스 숫자로 연결하는 능력이 돋보입니다.'
              : '비겁·관성의 중심축이 분명해 책임 있는 의사결정과 팀·프로젝트를 이끄는 관리 역량이 자연스럽게 길러집니다.'
      }`,
      `일하는 환경 면에서는 ${orgVsIndep} 원국의 균형을 열어 주는 용신 오행인 ${ELEMENT_META[primaryCareerEl].hangul}(${ELEMENT_META[primaryCareerEl].hanja}) 계열 산업(${getElementCareerKeywords(primaryCareerEl)})과 맞닿아 있을 때 노력 대비 인정과 보상이 크게 따릅니다.`,
      careerSpecialNotes.length > 0
        ? `신살과 세부 구조를 함께 살펴보면, ${careerSpecialNotes.join(' ')} 따라서 남들이 정해 둔 평범한 경력 공식보다 자신의 고유한 무기 하나를 분명히 브랜드화하는 전략이 유효합니다.`
        : `꾸준히 전문성을 축적할수록 대체 불가능한 신뢰가 쌓이는 구조이므로, 단기 유행 업종을 잦게 옮기기보다 3~5년 단위로 하나의 핵심 도메인을 깊게 파고드는 전략이 유리합니다.`,
    ],
    keyPoints: [
      {
        label: '추천 직군 · 역할',
        content: gyeokProfile.careerFit.join(' · '),
      },
      {
        label: '용신 기반 유망 산업',
        content: `${ELEMENT_META[primaryCareerEl].hangul}(${ELEMENT_META[primaryCareerEl].hanja}) 영역 — ${getElementCareerKeywords(primaryCareerEl)}`,
      },
      {
        label: '커리어 도약 포인트',
        content:
          siksangPct < 12
            ? '내면에 쌓인 실력을 바깥으로 표현하고 포트폴리오·발표로 드러내는 ' + "'아웃풋 습관'" + '을 의식적으로 만들면 평가가 빠르게 올라갑니다.'
            : gwanseongPct < 12
              ? '자유로운 재능을 일정·마감·수치 같은 ' + "'객관적 시스템'" + ' 위에 올려두면 신뢰도와 몸값이 함께 상승합니다.'
              : '이미 실무와 책임감의 축이 잡혀 있으므로, 권한이 더 큰 상위 프로젝트에 과감히 이름을 올리는 것이 성장의 지름길입니다.',
      },
    ],
    seoldamNote: {
      mood: 'keen',
      tag: '재(災)의 여백 노트 · 직업',
      quote:
        bigeopPct >= 28 || siksangPct >= 28
          ? `갓 챙 너머로 살펴보니 시키는 일만 반복하시면 금세 기운이 시들어 버릴 명식이군요. 작더라도 본인의 이름을 걸고 책임질 수 있는 무대를 하나 마련해 보시길 바랍니다.`
          : `단단하게 실력을 쌓아 올려 신뢰로 승부하시는 편이군요. 요란하게 드러내려 애쓰지 않으셔도 됩니다. 실력이 조용히 증명될 자리에 오래 머무시는 편이 결국 가장 크게 이깁니다.`,
      footnote: `십성 비율: 비겁 ${bigeopPct}% / 식상 ${siksangPct}% / 재성 ${jaeseongPct}% / 관성 ${gwanseongPct}% / 인성 ${inseongPct}%`,
    },
  };

  // ------------------------------------------------------------------
  // Chapter 03: 재물 및 금전운
  // ------------------------------------------------------------------
  const hasSiksangSaengjae = siksangPct >= 15 && jaeseongPct >= 15;
  const hasJaeseong = jaeseongPct >= 15;
  const hasBigeopRisk = bigeopPct >= 34 && jaeseongPct > 0;
  const hasStorageBranch = [pillars.year, pillars.month, pillars.day, ...(pillars.hour ? [pillars.hour] : [])].some(
    (p) => [1, 4, 7, 10].includes(p.branch.index) // 축진미술 (사고지)
  );

  const wealthHeadline = hasSiksangSaengjae
    ? '재능과 실행력이 재물로 순환하는 식상생재(食傷生財) 흐름'
    : hasJaeseong
      ? '현실 감각과 자원 관리 능력이 돋보이는 실리 축적형'
      : inseongPct >= 25 || gwanseongPct >= 25
        ? '전문성·직위·지적 자산이 부를 부르는 명예 축재형'
        : '주체적인 개척과 현금 흐름 설계로 키우는 자립형 재물운';

  const wealthParagraphs: string[] = [
    `재물운은 원국 내 재성(비율 ${jaeseongPct}%)의 유무만이 아니라 재물을 만들어 내는 식상(${siksangPct}%)과 이를 감당하는 일간의 힘(${strength.grade})이 함께 어우러져 결정됩니다. ${gyeokProfile.wealthStyle}`,
    hasSiksangSaengjae
      ? `특히 식상과 재성이 함께 살아 있어 아이디어·기술·서비스를 실질적인 수익으로 연결하는 감각이 뛰어납니다. ${
          strength.grade === '신강' || strength.grade === '극왕' || strength.grade === '중화'
            ? '일간의 체력까지 받쳐주어 큰 규모의 자산이나 사업을 직접 굴려도 감당할 힘이 충분합니다.'
            : '다만 일간의 에너지가 소진되지 않도록 무리한 다중 확장보다 수익성이 검증된 핵심 파이프라인에 집중하는 것이 현명합니다.'
        }`
      : !hasJaeseong
        ? `원국 표면에 재성 비중이 낮은 편이지만, 명리학에서 무재(無財) 사주는 돈이 없다는 뜻이 아니라 '돈 자체보다 일의 의미·전문성·명예를 좇을 때 결과적으로 큰 부가 따라오는 구조'를 의미합니다. 직접 단기 투자에 매달리기보다 자동 저축·우량 자산 적립과 본업 몸값 상승에 집중할 때 재산이 훨씬 크게 불어납니다.`
        : `원국에 재성의 기운이 분명하게 자리해 거래와 가치 판단이 현실적입니다. 충동적인 유행 소비보다 가성비와 장기 가치를 따지는 안목이 있어 시간이 갈수록 자산 관리 실력이 무르익습니다.`,
    `${
      hasBigeopRisk
        ? '비겁의 비중이 높아 주변 사람과의 금전 거래, 충동적 동업, 체면 지출로 자금이 새는 군겁쟁재(群劫爭財) 흐름을 경계해야 합니다. 자산의 일정 비율을 즉시 인출하기 어려운 장기 계좌나 실물 자산으로 묶어 두는 전략이 매우 효과적입니다.'
        : hasStorageBranch
          ? '원국 지지에 재물을 갈무리하는 사고지(辰戌丑未)의 창고 기운이 자리해 한번 모은 자산을 단단히 지켜내고 부동산·장기 자산으로 키우는 저력이 있습니다.'
          : '유동적인 현금 흐름을 관리하는 감각이 좋으므로, 월별 고정 저축 비율을 먼저 확보하고 남는 범위에서 투자·자기계발을 운용하는 선저축 후지출 원칙이 잘 맞습니다.'
    }`,
  ];

  const wealthChapter: ReportChapter = {
    id: 'wealth',
    index: '03',
    title: '재물 및 금전운',
    subtitle: '돈이 들어오는 통로, 지키는 힘, 그리고 리스크 관리',
    evidenceLine: `재성 ${jaeseongPct}% · 식상 ${siksangPct}% · 비겁 ${bigeopPct}% · ${hasStorageBranch ? '창고지(辰戌丑未) 보유' : '유동 순환형'}`,
    headline: wealthHeadline,
    paragraphs: wealthParagraphs,
    keyPoints: [
      {
        label: '유리한 축재 방식',
        content: hasSiksangSaengjae
          ? '자신의 콘텐츠·전문 기술·비즈니스 모델에서 반복 수익이 발생하는 구조 설계'
          : inseongPct >= 22
            ? '자격·지적재산·문서 기반의 장기 우량 자산 및 안정적 배당·임대형 포트폴리오'
            : '본업 전문성 상승을 통한 현금 흐름 확대와 분산 적립식 자산 운용',
      },
      {
        label: '재무 리스크 점검',
        content: hasBigeopRisk
          ? '지인 보증·비공식 동업·과시성 지출을 차단하고, 계좌를 생활비·투자·비상금으로 명확히 분리하세요.'
          : '감정 기복이나 피로가 쌓일 때의 충동 지출 및 검증되지 않은 단기 고수익 정보에 대한 경계만 유지하면 탄탄합니다.',
      },
    ],
    seoldamNote: {
      mood: 'keen',
      tag: '재(災)의 여백 노트 · 재물',
      quote: hasBigeopRisk
        ? `재물을 모으는 재주는 있으시지만, 주변에 인심을 쓰거나 타인을 돕다 주머니가 가벼워지기 쉬운 흐름입니다. 지갑을 여시기 전에 '이것이 온전히 내 몫인가' 한 번만 더 헤아려 보세요.`
        : !hasJaeseong
          ? `원국에 재성이 적다고 서운해하실 필요는 없습니다. 이런 명식은 숫자만 좇으면 오히려 피곤해지고, 본인의 실력과 이름값을 높이실 때 재물이 자연스레 뒤따라옵니다.`
          : `재물의 흐름을 읽으시는 눈이 꽤 정확하시군요. 단번에 크게 얻으려는 욕심만 경계하신다면, 시간이 편이 되어 차곡차곡 불려 줄 구조입니다.`,
      footnote: `재물 운용은 일간 ${strength.grade}(${strength.score}%)의 감당력과 식상·재성 순환을 기준으로 산출`,
    },
  };

  // ------------------------------------------------------------------
  // Chapter 04: 연애 및 대인관계
  // ------------------------------------------------------------------
  const spouseInsight = getSpousePalaceInsight(chart);
  const partnerGroup: TenGodGroup = input.gender === 'female' ? '관성' : '재성';
  const partnerPct = getTenGodPercent(chart, partnerGroup);
  const hasDohwa = sinsal.some((s) => s.id === 'dohwa');
  const dayBranchClashed = interactions.some(
    (i) => i.type === '지지충' && i.pillarsInvolved.includes('일주')
  );
  const dayBranchCombined = interactions.some(
    (i) => (i.type === '지지육합' || i.type === '천간합') && i.pillarsInvolved.includes('일주')
  );

  const romanceParagraphs: string[] = [
    `배우자궁에 해당하는 일지(${pillars.day.branch.hangul}${pillars.day.branch.hanja}, 십성 '${pillars.day.branchTenGod}')는 친밀한 관계에서 드러나는 나의 진짜 모습과 끌리는 인연의 결을 보여줍니다. ${spouseInsight.trait}`,
    `전통 명리학에서 ${input.gender === 'female' ? '여성의 인연성(관성)' : '남성의 인연성(재성)'} 비중은 ${partnerPct}%로 나타납니다. ${
      partnerPct >= 28
        ? '이성과 관계에 대한 관심이 자연스럽게 열려 있고 상대의 시그널을 잘 포착합니다. 다만 선택지가 많거나 기대치가 높아질수록 기준을 분명히 세워 깊이 있는 한 사람에게 집중하는 태도가 중요합니다.'
        : partnerPct >= 12
          ? '관계에 대한 감각이 과하지도 부족하지도 않아 건강한 거리감을 유지하며, 서로의 삶에 자연스럽게 스며드는 성숙한 연애를 이어가기 좋습니다.'
          : '감정에 쉽게 휩쓸려 가볍게 시작하기보다, 가치관과 신뢰가 충분히 검증된 뒤에 비로소 마음을 여는 신중한 타입입니다. 취향이나 일의 결이 맞는 공간에서 자연스럽게 인연이 깊어집니다.'
    }`,
    `대인관계 전반에서는 ${gyeokProfile.romanceStyle}${
      hasDohwa
        ? ' 원국에 도화의 매력이 깃들어 있어 첫인상이나 분위기에서 자연스럽게 호감을 얻는 힘이 큽니다.'
        : ''
    }${
      dayBranchCombined
        ? ' 특히 일주에 합(合)의 기운이 작용해 상대와 정서적 밀착도와 호흡을 맞추는 능력이 부드럽게 발휘됩니다.'
        : ''
    }${
      dayBranchClashed
        ? ' 일지에 충(沖)의 역동성이 있어 비슷한 성향보다 서로 다른 매력을 지닌 상대에게 끌리는 경향이 있으며, 갈등 시 회피하지 않고 솔직한 대화 규칙을 정해 두면 관계가 훨씬 단단해집니다.'
        : ''
    }`,
  ];

  const romanceChapter: ReportChapter = {
    id: 'romance',
    index: '04',
    title: '연애 및 대인관계',
    subtitle: '배우자궁의 결, 사랑의 언어, 그리고 오래가는 관계의 조건',
    evidenceLine: `일지 ${pillars.day.branch.hangul}(${pillars.day.branch.hanja}) · ${pillars.day.branchTenGod} · ${partnerGroup} ${partnerPct}%${hasDohwa ? ' · 도화 작용' : ''}`,
    headline: `일지 '${pillars.day.branchTenGod}'의 결로 맺는 신뢰와 교감의 관계`,
    paragraphs: romanceParagraphs,
    keyPoints: [
      {
        label: '어울리는 파트너 성향',
        content: `원국의 부족한 기운인 ${ELEMENT_META[yongsin.primary].hangul}(${ELEMENT_META[yongsin.primary].hanja})의 성향(${
          yongsin.primary === 'wood'
            ? '따뜻하고 성장 지향적이며 진취적인 사람'
            : yongsin.primary === 'fire'
              ? '밝고 표현력이 풍부하며 유쾌한 온기를 주는 사람'
              : yongsin.primary === 'earth'
                ? '차분하고 듬직하며 변함없이 곁을 지키는 사람'
                : yongsin.primary === 'metal'
                  ? '명쾌하고 깔끔하며 판단이 반듯한 사람'
                  : '깊이 있고 유연하며 대화가 잘 통하는 지적인 사람'
        })을 지닌 상대와 만날 때 서로의 빈틈을 자연스럽게 채워줍니다.`,
      },
      {
        label: '관계 유지 조언',
        content: spouseInsight.advice,
      },
    ],
    seoldamNote: {
      mood: 'warm',
      tag: '재(災)의 여백 노트 · 인연',
      quote:
        partnerPct < 12
          ? `마음의 문을 여시는 데 시간이 조금 걸리는 편이시군요. 괜찮습니다. 아무나 들이지 않는 신중함이 오히려 귀한 인연을 지켜 주니까요. 다만 좋은 분 앞에서는 마음을 조금만 더 분명히 표현해 보세요.`
          : dayBranchClashed
            ? `일지에 충이 있어 무미건조한 관계는 답답해하시는 편입니다. 갈등이 생기더라도 문을 닫아 버리기보다, 차 한 잔을 사이에 두고 솔직히 대화를 나누어 보시길 권합니다.`
            : `관계에서 진심이 고스란히 묻어나는 명식이군요. 상대에게 맞추다 본인의 리듬만 잃지 않으신다면, 함께할수록 서로가 빛나는 좋은 인연을 누리실 수 있습니다.`,
      footnote: `일지(배우자궁) ${pillars.day.branch.hangul}(${pillars.day.branch.hanja}) 및 ${input.gender === 'female' ? '여명 관성' : '남명 재성'} 분포 종합`,
    },
  };

  // ------------------------------------------------------------------
  // Chapter 05: 건강 및 체질
  // ------------------------------------------------------------------
  const strongHealth = ELEMENT_HEALTH_GUIDE[strongest.element];
  const weakHealth = ELEMENT_HEALTH_GUIDE[weakest.element];
  const yongsinHealth = ELEMENT_HEALTH_GUIDE[yongsin.primary];

  const healthParagraphs: string[] = [
    `명리학의 체질 분석은 원국에서 지나치게 몰린 오행(과열·긴장)과 비어 있는 오행(허약·취약)의 균형을 살피는 데서 시작합니다. 현재 명식에서는 ${strongest.hangul}(${strongest.hanja}) 기운이 ${strongest.percentage}%로 가장 높고, ${weakest.hangul}(${weakest.hanja}) 기운이 ${weakest.percentage}%로 가장 낮게 분포되어 있습니다.`,
    `${
      strongest.status === '과다' || strongest.status === '발달'
        ? `${strongHealth.excessSymptom} 해당 오행과 연결된 ${strongHealth.organs} 부위에 과부하가 걸리지 않도록 의식적인 이완 루틴이 필요합니다.`
        : `특정 오행이 극단적으로 폭주하지는 않으나, 주도 오행인 ${strongest.hangul}(${strongest.hanja})과 연관된 ${strongHealth.organs}의 피로 신호를 평소 잘 관찰해 두는 것이 좋습니다.`
    }`,
    `반면 상대적으로 약한 ${weakest.hangul}(${weakest.hanja}) 기운은 ${weakHealth.organs} 영역과 맞닿아 있습니다. ${weakHealth.lackingSymptom} 계절적 조후(調候) 관점에서도 ${yongsin.johuNote}`,
  ];

  const healthChapter: ReportChapter = {
    id: 'health',
    index: '05',
    title: '건강 및 체질',
    subtitle: '오행 장부 대응으로 살펴보는 취약 부위와 생활 처방',
    evidenceLine: `우세 ${strongest.hangul}(${strongest.hanja}) ${strongest.percentage}% · 약세 ${weakest.hangul}(${weakest.hanja}) ${weakest.percentage}% · 출생 계절 ${seasonWord}`,
    headline: `${weakest.hangul}(${weakest.hanja}) 영역(${weakHealth.organs})을 보살피고 계절 리듬을 조율하는 체질 관리`,
    paragraphs: healthParagraphs,
    keyPoints: [
      {
        label: `보완 관리 부위 (${weakest.hangul}·${weakest.hanja})`,
        content: `${weakHealth.organs} — ${weakHealth.careHabit}`,
      },
      {
        label: `과부하 주의 부위 (${strongest.hangul}·${strongest.hanja})`,
        content: `${strongHealth.organs} — 피로가 몰릴 때 가장 먼저 긴장이 쌓이는 부위이므로 무리한 야근·수면 부족을 경계하세요.`,
      },
      {
        label: '계절 · 조후 균형 팁',
        content: yongsin.johuNote,
      },
    ],
    seoldamNote: {
      mood: 'warm',
      tag: '재(災)의 여백 노트 · 양생',
      quote: `사주가 아무리 좋아도 몸이라는 그릇에 금이 가면 복을 온전히 담기 어렵습니다. 햇살 드는 곳에서 가볍게 기지개를 켜듯, ${weakHealth.organs.split('·')[0]} 건강부터 차분히 보살펴 보세요.`,
      footnote: `본 건강 풀이는 전통 오행 장부론에 근거한 생활 양생 참고이며, 의학적 진단을 대체하지 않습니다.`,
    },
  };

  const yongsinElLabel = `${ELEMENT_META[yongsin.primary].hangul}(${ELEMENT_META[yongsin.primary].hanja})`;

  const astrology = calculateAstrologyChart(chart);
  const annual = generateAnnualReport(chart, astrology);

  return {
    chart,
    astrology,
    annual,
    coverTitle,
    dayPillarSymbol: dayProfile.symbol,
    openingGreeting,
    seoldamQuip: dayProfile.seoldamQuip,
    executiveSummary,
    chapters: [
      personalityChapter,
      careerChapter,
      wealthChapter,
      romanceChapter,
      healthChapter,
    ],
    closingPrescription: {
      oneLiner: `타고난 ${pillars.day.ganjiHangul}일주의 결을 억지로 바꾸려 하지 말고, 부족한 ${yongsinElLabel}의 리듬을 일상 한 스푼씩 채워 넣을 때 가장 나다운 운이 열립니다.`,
      yongsinElement: `${yongsinElLabel} · 보조 ${ELEMENT_META[yongsin.secondary].hangul}(${ELEMENT_META[yongsin.secondary].hanja})`,
      favorableSeason: yongsinHealth.season,
      favorableDirection: yongsinHealth.direction,
      favorableColor: yongsinHealth.colorName,
      dailyRitual: yongsinHealth.careHabit,
    },
  };
}
