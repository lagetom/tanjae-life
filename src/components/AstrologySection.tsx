import { useState } from 'react';
import { X } from 'lucide-react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import {
  AspectItem,
  AstrologyChart,
  PlanetId,
  WESTERN_ELEMENT_META,
} from '../engine/astrology';
import { NatalWheelSvg } from './NatalWheelSvg';
import { SeoldamImage } from './SeoldamImage';

interface AstrologySectionProps {
  astrology: AstrologyChart;
}

export function AstrologySection({ astrology }: AstrologySectionProps) {
  const [selectedPlanetId, setSelectedPlanetId] = useState<PlanetId>('sun');
  const [selectedAspect, setSelectedAspect] = useState<AspectItem | null>(null);

  const activePlanet =
    astrology.placements.find((p) => p.id === selectedPlanetId) ?? astrology.sun;

  const bigThree = [
    astrology.sun,
    astrology.moon,
    astrology.ascendant ?? astrology.venus,
  ];

  return (
    <section
      id="astrology"
      aria-labelledby="astrology-heading"
      className="py-16 border-t border-[#141414] scroll-mt-20"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
        <div>
          <p className="text-xs text-[#666666] mb-1.5">04. 서양 천궁도 · 동서양 교차 분석</p>
          <h2
            id="astrology-heading"
            className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]"
          >
            서양 점성술 네이탈 차트
          </h2>
        </div>
        <p className="text-xs text-[#737373] tabular-nums">
          열대 황도대 · 서울(37.5°N, 127.0°E) 천문 궤도 계산 기준
        </p>
      </div>

      {/* Top Split: Left Natal Wheel / Right Big 3 + Planet Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Minimalist Ink Natal Wheel */}
        <div className="lg:col-span-5 border border-[#E5E5E5] bg-white p-6">
          <NatalWheelSvg
            astrology={astrology}
            selectedPlanetId={activePlanet.id}
            onSelectPlanet={setSelectedPlanetId}
          />
          <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#737373]">
            <span className="font-editorial italic">Fig. 02 — 네이탈 천궁도</span>
            <span>{astrology.ascendant ? '상승궁(ASC) 기준 정렬' : '시간 미상 · 0° 양자리 기준'}</span>
          </div>
        </div>

        {/* Right: Big 3 + Interactive Planet Table + Active Detail */}
        <div className="lg:col-span-7">
          {/* Big 3 Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-l border-[#E5E5E5]">
            {bigThree.map((p) => {
              const isSelected = activePlanet.id === p.id;
              const elMeta = WESTERN_ELEMENT_META[p.sign.element];
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPlanetId(p.id)}
                  className={`text-left p-4 border-r border-b border-[#E5E5E5] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#F7F7F7]' : 'bg-white hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-[#6E6E6E]">
                    <span>
                      {p.symbol} {p.nameKo}
                    </span>
                    <span style={{ color: elMeta.color }}>{elMeta.nameKo.split('(')[0]}</span>
                  </div>
                  <p className="mt-2 font-editorial text-lg font-bold text-[#141414]">
                    {p.sign.symbol} {p.sign.nameKo}
                  </p>
                  <p className="mt-1 text-[11px] text-[#595959] tabular-nums">
                    {p.degreeLabel} · {p.domainKo.split(' · ')[0]}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Planet Reading Box */}
          <div className="mt-5 border border-[#141414] bg-[#FAFAFA] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-lg font-bold text-[#141414]">
                  {activePlanet.symbol} {activePlanet.nameKo} · {activePlanet.sign.nameKo}(
                  {activePlanet.sign.nameEn})
                </span>
                <span className="font-mono text-xs text-[#666666] tabular-nums">
                  {activePlanet.degreeLabel}
                </span>
              </div>
              <span className="text-xs text-[#666666]">
                {activePlanet.domainKo} · {activePlanet.sign.keyword}
              </span>
            </div>
            <p className="mt-3 text-sm leading-[1.8] text-[#262626]">
              {activePlanet.interpretation}
            </p>
          </div>

          {/* Complete 7-Planet (+ ASC) Precision Table */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[#525252]">
                전체 행성 배치표 <span className="text-[#6E6E6E] font-normal">(행을 눌러 풀이 확인)</span>
              </h3>
              <span className="text-[11px] text-[#6E6E6E]">황도 경도</span>
            </div>
            <div className="border-t border-b border-[#E5E5E5] divide-y divide-[#F0F0F0]">
              {astrology.placements.map((p) => {
                const isSelected = activePlanet.id === p.id;
                const elMeta = WESTERN_ELEMENT_META[p.sign.element];
                const primaryDomain = p.domainKo.split(' · ')[0];
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedPlanetId(p.id)}
                    className={`w-full min-h-[48px] py-2.5 px-3 grid grid-cols-12 items-center gap-x-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F5F5F5] font-medium' : 'bg-white hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <span className="col-span-5 sm:col-span-4 text-[#141414] flex items-center gap-2 min-w-0">
                      <span className="w-5 text-center text-sm shrink-0">{p.symbol}</span>
                      <span className="min-w-0">
                        <span className="block truncate">{p.nameKo}</span>
                        <span className="block sm:hidden text-[11px] font-normal text-[#6E6E6E] truncate">
                          {primaryDomain}
                        </span>
                      </span>
                    </span>
                    <span className="col-span-4 text-[#141414] whitespace-nowrap">
                      <span style={{ color: elMeta.color }} className="mr-1">
                        {p.sign.symbol}
                      </span>
                      {p.sign.nameKo}
                    </span>
                    <span className="col-span-3 sm:col-span-2 text-right sm:text-left font-mono text-[#595959] tabular-nums whitespace-nowrap">
                      {p.degreeLabel}
                    </span>
                    <span className="hidden sm:block sm:col-span-2 text-right text-[#6E6E6E] truncate">
                      {primaryDomain}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Strip: 4 Elements / 3 Modalities & Major Aspects */}
      <div className="mt-12 pt-10 border-t border-[#EBEBEB] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: 4 Elements & 3 Modalities */}
        <div className="lg:col-span-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-editorial text-lg font-bold text-[#141414]">
              서양 4원소 및 행동 양식
            </h3>
            <span className="text-xs text-[#737373]">
              주도 원소 · {astrology.dominantElement.nameKo}
            </span>
          </div>

          <div className="space-y-3.5">
            {astrology.elements.map((el) => (
              <div key={el.element}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: el.color }}>
                      {el.nameKo}
                    </span>
                    <span className="text-[#737373] tabular-nums">{el.count}행성</span>
                  </div>
                  <span className="font-mono text-[#141414] tabular-nums">
                    {el.percentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#F2F2F2]">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(el.percentage, el.count > 0 ? 4 : 0)}%`,
                      backgroundColor: el.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#666666] tabular-nums">
            {astrology.modalities.map((m, idx) => (
              <span key={m.modality} className="inline-flex items-center gap-2">
                {idx > 0 && <span className="text-[#CCCCCC]" aria-hidden="true">·</span>}
                <span className={m.modality === astrology.dominantModality.modality ? 'text-[#141414] font-medium' : ''}>
                  {m.nameKo} {m.percentage}%
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Major Ptolemaic Aspects */}
        <div className="lg:col-span-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-editorial text-lg font-bold text-[#141414]">
              행성 간 주요 각도 (Aspects)
            </h3>
            <span className="text-xs text-[#737373]">클릭하여 해석 보기</span>
          </div>

          {astrology.aspects.length === 0 ? (
            <p className="text-sm text-[#666666] leading-relaxed">
              행성 간 극단적인 밀착 각도 없이 각 행성이 독립적이고 자유롭게 고유 성향을 발휘하는 배치입니다.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                {astrology.aspects.map((asp, i) => (
                  <span key={asp.id} className="inline-flex items-center gap-2">
                    {i > 0 && <span className="text-[#BDBDBD]" aria-hidden="true">/</span>}
                    <button
                      type="button"
                      aria-pressed={selectedAspect?.id === asp.id}
                      onClick={() =>
                        setSelectedAspect(selectedAspect?.id === asp.id ? null : asp)
                      }
                      className={`min-h-[40px] py-1.5 underline underline-offset-4 transition-colors cursor-pointer ${
                        selectedAspect?.id === asp.id
                          ? 'text-[#141414] font-medium decoration-[#141414]'
                          : 'text-[#262626] decoration-[#BDBDBD] hover:decoration-[#141414]'
                      }`}
                    >
                      {asp.labelKo}
                    </button>
                  </span>
                ))}
              </div>

              {selectedAspect ? (
                <div className="mt-4 border border-[#141414] bg-[#FAFAFA] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#595959]">{selectedAspect.summary}</p>
                      <h4 className="font-editorial text-base font-bold text-[#141414] mt-0.5">
                        {selectedAspect.labelKo}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAspect(null)}
                      aria-label="각도 해설 닫기"
                      className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 inline-flex items-center justify-center text-[#595959] hover:text-[#141414] cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-[#262626] leading-relaxed">
                    {selectedAspect.detail}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-xs text-[#737373] leading-relaxed">
                  천궁도 안쪽의 파란 실선은 조화 각도(삼합·육분·합), 붉은 점선은 역동적 긴장 각도(사각·충)를 뜻합니다.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Asymmetric 70/30: East-Meets-West Cross-Insight + Seoldam Margin Note */}
      <div className="mt-14 pt-12 border-t border-[#E5E5E5] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-8 max-w-2xl">
          <p className="text-xs text-[#666666] mb-2">동서양 교차 통찰 · 사주 × 점성술</p>
          <h3 className="font-editorial text-xl sm:text-2xl font-bold leading-snug text-[#141414] text-balance">
            {astrology.crossInsight.headline}
          </h3>

          <div className="mt-5 space-y-4 text-[15.5px] leading-[1.88] text-[#262626]">
            <p>{astrology.crossInsight.sharedTheme}</p>
            <p>{astrology.crossInsight.contrastNote}</p>
          </div>

          <dl className="mt-8 border-t border-b border-[#E5E5E5] divide-y divide-[#EFEFEF]">
            {astrology.crossInsight.synthesisPoints.map((pt) => (
              <div
                key={pt.label}
                className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4"
              >
                <dt className="sm:col-span-4 text-xs font-semibold text-[#141414] pt-0.5">
                  {pt.label}
                </dt>
                <dd className="sm:col-span-8 text-sm leading-relaxed text-[#404040]">
                  {pt.content}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside
          aria-label="재(災)의 여백 노트 · 별자리"
          className="lg:col-span-4 lg:sticky lg:top-24"
        >
          <div className="border border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#F0F0F0]">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-white">
                <SeoldamImage
                  src={SEOLDAM_ASSETS.notes.keen}
                  alt="갓 챙을 매만지며 별자리를 살피는 저승차사 고양이 재(災)"
                  className="w-full h-full object-contain"
                  fallbackTitle="재(災)"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#141414]">
                  재(災)의 여백 노트 · 동서양 교차
                </p>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  저승차사 재(災)
                </p>
              </div>
            </div>

            <blockquote className="mt-5 font-editorial text-[15px] leading-[1.82] text-[#262626]">
              “{astrology.crossInsight.seoldamQuote}”
            </blockquote>

            <p className="mt-5 pt-4 border-t border-[#F0F0F0] text-[11px] leading-relaxed text-[#737373] tabular-nums">
              주석 · {astrology.crossInsight.footnote}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
