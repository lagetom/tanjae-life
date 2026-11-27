import { useState } from 'react';
import { X } from 'lucide-react';
import { ELEMENT_META } from '../constants/uiMeta';
import type {
  InteractionItem,
  Pillar,
  SajuChart,
  SinsalItem,
  TermExplanation,
} from '../types/saju';

interface SajuChartSectionProps {
  chart: SajuChart;
}

export function SajuChartSection({ chart }: SajuChartSectionProps) {
  const [selectedPillarPos, setSelectedPillarPos] = useState<Pillar['position'] | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<TermExplanation | null>(null);

  const orderedPillars: (Pillar | null)[] = [
    chart.pillars.hour,
    chart.pillars.day,
    chart.pillars.month,
    chart.pillars.year,
  ];
  const fallbackLabels = ['시주', '일주', '월주', '연주'];
  const pillarTimeRoles = ['말년 · 자녀 · 내면', '나 자신 · 배우자궁', '청년 · 직업 · 격국', '초년 · 뿌리 · 가풍'];

  const handleSelectPillar = (pillar: Pillar, roleDesc: string) => {
    if (selectedPillarPos === pillar.position) {
      setSelectedPillarPos(null);
      setSelectedTerm(null);
      return;
    }
    setSelectedPillarPos(pillar.position);
    if (pillar.explanation) {
      setSelectedTerm(pillar.explanation);
      return;
    }
    const hiddenText = pillar.hiddenStems
      .map((h) => `${h.stem.hangul}(${h.stem.hanja} · ${h.tenGod})`)
      .join(', ');
    setSelectedTerm({
      title: `${pillar.label} — ${pillar.ganjiHangul}(${pillar.ganjiHanja})`,
      subtitle: `${roleDesc} · 12운성 ${pillar.lifeStage}`,
      roleInChart: `천간 ${pillar.stem.hangul}(${pillar.stem.hanja}, ${pillar.stemTenGod}) · 지지 ${pillar.branch.hangul}(${pillar.branch.hanja}, ${pillar.branchTenGod}) · 지장간 ${hiddenText}`,
      description: `천간 '${pillar.stem.hangul}(${pillar.stem.hanja})'과 지지 '${pillar.branch.hangul}(${pillar.branch.hanja})'가 결합한 기둥입니다.`,
    });
  };

  const handleSelectInteraction = (item: InteractionItem) => {
    setSelectedPillarPos(null);
    setSelectedTerm({
      title: item.name,
      subtitle: `${item.type} · 작용 위치: ${item.pillarsInvolved}`,
      roleInChart: item.summary,
      description: item.detail,
    });
  };

  const handleSelectSinsal = (item: SinsalItem) => {
    setSelectedPillarPos(null);
    setSelectedTerm({
      title: `${item.name}(${item.hanja})`,
      subtitle: `주요 신살 · 위치: ${item.location}`,
      roleInChart: item.summary,
      description: item.detail,
    });
  };

  return (
    <section
      id="won-guk"
      aria-labelledby="won-guk-heading"
      className="py-14 border-t border-[#E5E5E5] scroll-mt-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-xs text-[#666666] mb-1.5">00. 만세력 근거</p>
          <h2 id="won-guk-heading" className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]">
            사주 원국표 및 오행 균형
          </h2>
        </div>
        <p className="text-xs text-[#737373] no-print">
          각 기둥이나 합·충·신살 항목을 누르면 명리 해설이 열립니다.
        </p>
      </div>

      {/* Four Pillars Museum Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-l border-[#E5E5E5]">
        {orderedPillars.map((pillar, idx) => {
          const isDayPillar = idx === 1;
          const isSelected = pillar !== null && selectedPillarPos === pillar.position;

          if (!pillar) {
            return (
              <div
                key={fallbackLabels[idx]}
                className="border-r border-b border-[#E5E5E5] bg-[#FAFAFA] p-5 flex flex-col justify-between min-h-[250px]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#6E6E6E]">
                    <span className="font-medium text-[#525252]">{fallbackLabels[idx]}</span>
                    <span>미입력</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#6E6E6E]">{pillarTimeRoles[idx]}</p>
                </div>
                <div className="py-10 text-center">
                  <span className="font-editorial text-3xl text-[#A3A3A3]">—</span>
                  <p className="mt-3 text-xs text-[#6E6E6E]">
                    출생 시각 미상으로
                    <br />
                    삼주(6자) 기준 분석
                  </p>
                </div>
                <div className="pt-3 border-t border-[#EBEBEB] text-[11px] text-[#6E6E6E] text-center">
                  지장간 · 12운성 생략
                </div>
              </div>
            );
          }

          const stemMeta = ELEMENT_META[pillar.stem.element];
          const branchMeta = ELEMENT_META[pillar.branch.element];

          return (
            <button
              key={pillar.position}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleSelectPillar(pillar, pillarTimeRoles[idx])}
              className={`text-left border-r border-b border-[#E5E5E5] p-4 sm:p-5 flex flex-col justify-between transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#141414] ${
                isSelected
                  ? 'bg-[#F7F7F7]'
                  : isDayPillar
                    ? 'bg-[#FCFCFC] hover:bg-[#F7F7F7]'
                    : 'bg-white hover:bg-[#FAFAFA]'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#141414]">
                    {pillar.label}
                    {isDayPillar ? ' · 본원' : ''}
                  </span>
                  <span className="text-[#6E6E6E]">{pillar.lifeStage}</span>
                </div>
                <p className="mt-1 text-[11px] text-[#6E6E6E]">{pillarTimeRoles[idx]}</p>
              </div>

              {/* Stem & Branch Characters */}
              <div className="my-5 space-y-3">
                {/* Heavenly Stem */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
                  <div>
                    <span className="block text-[11px] text-[#737373] mb-0.5">
                      {pillar.stemTenGod}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-editorial text-3xl sm:text-[2.1rem] font-bold leading-none"
                        style={{ color: stemMeta.color }}
                      >
                        {pillar.stem.hanja}
                      </span>
                      <span className="text-sm font-medium text-[#141414]">
                        {pillar.stem.hangul}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[#666666]">
                    <span style={{ color: stemMeta.color }} className="font-medium">
                      {pillar.stem.yinYang === 'yang' ? '양' : '음'}
                      {stemMeta.hangul}
                    </span>
                    <span className="block text-[#6E6E6E]">{stemMeta.hanja}</span>
                  </div>
                </div>

                {/* Earthly Branch */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] text-[#6E6E6E] mb-0.5">
                      {pillar.branchTenGod}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-editorial text-3xl sm:text-[2.1rem] font-bold leading-none"
                        style={{ color: branchMeta.color }}
                      >
                        {pillar.branch.hanja}
                      </span>
                      <span className="text-sm font-medium text-[#141414]">
                        {pillar.branch.hangul}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[#595959]">
                    <span style={{ color: branchMeta.color }} className="font-medium">
                      {pillar.branch.yinYang === 'yang' ? '양' : '음'}
                      {branchMeta.hangul}
                    </span>
                    <span className="block text-[#6E6E6E]">{pillar.branch.animal}</span>
                  </div>
                </div>
              </div>

              {/* Hidden Stems Footer */}
              <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-[11px] text-[#737373]">
                <span>지장간</span>
                <span className="font-mono text-[#525252]">
                  {pillar.hiddenStems.map((h) => h.stem.hanja).join(' ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline Contextual Explanation Drawer */}
      {selectedTerm && (
        <div
          role="region"
          aria-label="명리 용어 상세 해설"
          className="mt-4 border border-[#141414] bg-[#FAFAFA] p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-[#666666]">{selectedTerm.subtitle}</p>
              <h3 className="font-editorial text-lg font-bold text-[#141414] mt-1">
                {selectedTerm.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTerm(null);
                setSelectedPillarPos(null);
              }}
              aria-label="해설 닫기"
              className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 inline-flex items-center justify-center text-[#595959] hover:text-[#141414] cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-[#525252]">{selectedTerm.roleInChart}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#262626]">{selectedTerm.description}</p>
        </div>
      )}

      {/* Five-Element Balance & Strength / Yongsin Grid */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Five Elements Precision Bars */}
        <div className="lg:col-span-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-editorial text-lg font-bold text-[#141414]">
              오행 균형 분포
            </h3>
            <span className="text-xs text-[#737373] tabular-nums">
              음양 비율 · 양 {chart.yinYangRatio.yangPercent}% / 음 {chart.yinYangRatio.yinPercent}%
            </span>
          </div>

          <div className="space-y-4">
            {chart.elementBalance.map((item) => {
              const meta = ELEMENT_META[item.element];
              return (
                <div key={item.element}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-editorial font-bold text-sm"
                        style={{ color: meta.color }}
                      >
                        {item.hangul}({item.hanja})
                      </span>
                      <span className="text-[#737373] tabular-nums">{item.rawCount}자</span>
                      <span aria-hidden="true" className="text-[#CCCCCC]">
                        ·
                      </span>
                      <span
                        className="font-medium"
                        style={{
                          color:
                            item.status === '과다' || item.status === '결핍'
                              ? meta.color
                              : '#525252',
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#141414] tabular-nums">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F2F2F2] overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.max(item.percentage, item.rawCount > 0 ? 4 : 0)}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-[#737373] leading-relaxed">
            월지(계절 사령)와 일지, 지장간의 세력을 전통 명리학 가중치로 환산한 비율입니다.
          </p>
        </div>

        {/* Right: Strength Scale, Yongsin & Interactions/Sinsal */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
          {/* Strength & Yongsin */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-editorial text-lg font-bold text-[#141414]">
                일간 신강·신약 및 용신
              </h3>
              <span className="font-mono text-xs text-[#141414] tabular-nums">
                {chart.strength.grade} ({chart.strength.score}%)
              </span>
            </div>

            {/* Linear Strength Scale */}
            <div className="relative pt-2 pb-4">
              <div className="h-1.5 w-full bg-[#EAEAEA] relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#141414] rotate-45 -ml-1.5"
                  style={{ left: `${chart.strength.score}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-[#737373]">
                <span>극약</span>
                <span>신약</span>
                <span>중화</span>
                <span>신강</span>
                <span>극왕</span>
              </div>
            </div>

            <div className="text-xs text-[#666666] flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
              <span>득령 {chart.strength.deukryeong ? '충족' : '미충족'}</span>
              <span aria-hidden="true">·</span>
              <span>득지 {chart.strength.deukji ? '충족' : '미충족'}</span>
              <span aria-hidden="true">·</span>
              <span>득세 {chart.strength.deukse ? '충족' : '미충족'}</span>
              <span aria-hidden="true">·</span>
              <span>격국 {chart.gyeokguk.name}</span>
            </div>

            <p className="text-sm text-[#404040] leading-relaxed">
              {chart.yongsin.reason}
            </p>
          </div>

          {/* Interactions & Sinsal Interactive Text List */}
          <div className="pt-6 border-t border-[#EBEBEB]">
            <h4 className="text-xs font-medium text-[#525252] mb-2">
              원국 내 주요 합·충 및 신살 <span className="text-[#6E6E6E] font-normal">(클릭하여 해설 보기)</span>
            </h4>

            {chart.interactions.length === 0 && chart.sinsal.length === 0 ? (
              <p className="text-sm text-[#595959]">
                두드러진 합·충이나 특수 신살 없이 각 기둥이 고요하고 독립적으로 작용하는 담백한 원국입니다.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                {chart.interactions.map((inter, i) => (
                  <span key={inter.id} className="inline-flex items-center gap-2">
                    {i > 0 && <span className="text-[#BDBDBD]" aria-hidden="true">/</span>}
                    <button
                      type="button"
                      onClick={() => handleSelectInteraction(inter)}
                      className="min-h-[40px] py-1.5 text-[#141414] underline decoration-[#BDBDBD] underline-offset-4 hover:decoration-[#141414] transition-colors cursor-pointer"
                    >
                      {inter.name}
                    </button>
                  </span>
                ))}
                {chart.sinsal.map((s, i) => (
                  <span key={s.id} className="inline-flex items-center gap-2">
                    {(chart.interactions.length > 0 || i > 0) && (
                      <span className="text-[#BDBDBD]" aria-hidden="true">/</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelectSinsal(s)}
                      className="min-h-[40px] py-1.5 text-[#141414] underline decoration-[#BDBDBD] underline-offset-4 hover:decoration-[#141414] transition-colors cursor-pointer"
                    >
                      {s.name}({s.hanja})
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
