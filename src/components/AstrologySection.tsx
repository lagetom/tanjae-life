import { useState } from 'react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import {
  AstrologyChart,
  GrahaId,
  VEDIC_ELEMENT_META,
} from '../engine/astrology';
import { SeoldamImage } from './SeoldamImage';
import { VedicKundaliSvg } from './VedicKundaliSvg';

interface AstrologySectionProps {
  astrology: AstrologyChart;
}

export function AstrologySection({ astrology }: AstrologySectionProps) {
  const [selectedGrahaId, setSelectedGrahaId] = useState<GrahaId>('moon');

  const activeGraha =
    astrology.placements.find((p) => p.id === selectedGrahaId) ?? astrology.moon;

  const coreThree = [
    astrology.moon,
    astrology.lagna ?? astrology.sun,
    astrology.lagna ? astrology.sun : astrology.rahu,
  ];

  const { janmaNakshatra, dashas, rahuKetuAxis } = astrology;

  return (
    <section
      id="astrology"
      aria-labelledby="astrology-heading"
      className="py-12 border-t border-[#141414] scroll-mt-20"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
        <div>
          <p className="text-xs text-[#595959] mb-1.5">
            04. 인도 베딕 점성술(조티쉬) · 사주 교차 분석
          </p>
          <h2
            id="astrology-heading"
            className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]"
          >
            베딕 쿤달리 · 27 나크샤트라
          </h2>
        </div>
        <p className="text-xs text-[#6E6E6E] tabular-nums">
          항성황도(Sidereal) · {astrology.ayanamsaLabel} · 서울 기준
        </p>
      </div>

      {/* Top Split: Left North Indian Kundali / Right Core 3 + Nakshatra + 9 Graha Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Minimalist North Indian Diamond Kundali */}
        <div className="lg:col-span-5 space-y-5">
          <div className="border border-[#E5E5E5] bg-white p-6">
            <VedicKundaliSvg
              astrology={astrology}
              selectedGrahaId={activeGraha.id}
              onSelectGraha={setSelectedGrahaId}
            />
            <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E6E6E]">
              <span className="font-editorial italic">Fig. 02 — 북인도식 쿤달리</span>
              <span>
                {astrology.chartBase === 'lagna'
                  ? '라그나(Lagna) 1하우스 기준'
                  : '시간 미상 · 찬드라(달) 1하우스 기준'}
              </span>
            </div>
          </div>

          {/* Janma Nakshatra Spotlight Card */}
          <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-5">
            <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#E5E5E5]">
              <div>
                <p className="text-[11px] text-[#6E6E6E]">출생 달 나크샤트라 (Janma Nakshatra)</p>
                <h3 className="mt-0.5 font-editorial text-lg font-bold text-[#141414]">
                  {janmaNakshatra.info.nameKo} ({janmaNakshatra.info.nameEn}) ·{' '}
                  <span className="font-mono text-sm font-medium">{janmaNakshatra.pada}파다</span>
                </h3>
              </div>
              <span className="text-xs text-[#595959] whitespace-nowrap">
                지배성 {janmaNakshatra.info.rulerKo}
              </span>
            </div>
            <p className="mt-3 text-xs text-[#595959]">
              상징 · {janmaNakshatra.info.symbolKo} · 성향 · {janmaNakshatra.info.gana} · 키워드 ·{' '}
              <span className="text-[#141414] font-medium">{janmaNakshatra.info.keyword}</span>
            </p>
            <p className="mt-2.5 text-sm leading-[1.8] text-[#262626]">
              {janmaNakshatra.info.description}
            </p>
            <p className="mt-3 pt-3 border-t border-[#E5E5E5] text-xs text-[#525252] leading-relaxed">
              {janmaNakshatra.padaFocus}
            </p>
          </div>
        </div>

        {/* Right: Core 3 + Interactive 9-Graha Table + Active Reading */}
        <div className="lg:col-span-7">
          {/* Core 3 Summary Grid (Chandra / Lagna / Surya) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-l border-[#E5E5E5]">
            {coreThree.map((p) => {
              const isSelected = activeGraha.id === p.id;
              const elMeta = VEDIC_ELEMENT_META[p.sign.element];
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedGrahaId(p.id)}
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
                    {p.sign.sanskritKo}
                    <span className="text-xs font-normal text-[#595959] ml-1">
                      ({p.sign.nameKo})
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#595959] tabular-nums">
                    {p.nakshatra.nameKo} {p.pada}파다 · {p.house}하우스
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Graha Reading Box */}
          <div className="mt-5 border border-[#141414] bg-[#FAFAFA] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-editorial text-lg font-bold text-[#141414]">
                  {activeGraha.symbol} {activeGraha.nameKo} ({activeGraha.sanskritKo}) ·{' '}
                  {activeGraha.sign.sanskritKo}({activeGraha.sign.nameKo})
                </span>
                <span className="font-mono text-xs text-[#595959] tabular-nums">
                  {activeGraha.degreeLabel}
                </span>
              </div>
              <span className="text-xs text-[#595959]">
                {activeGraha.nakshatra.nameKo} {activeGraha.pada}파다 · {activeGraha.houseDomain}
              </span>
            </div>
            <p className="mt-3 text-sm leading-[1.82] text-[#262626]">
              {activeGraha.interpretation}
            </p>
          </div>

          {/* Complete 9 Navagraha (+ Lagna) Precision Table */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[#525252]">
                9 그라하(Navagraha) 배치표{' '}
                <span className="text-[#6E6E6E] font-normal">(행을 눌러 풀이 확인)</span>
              </h3>
              <span className="text-[11px] text-[#6E6E6E]">라시 · 나크샤트라 · 하우스</span>
            </div>
            <div className="border-t border-b border-[#E5E5E5] divide-y divide-[#F0F0F0]">
              {astrology.placements.map((p) => {
                const isSelected = activeGraha.id === p.id;
                const elMeta = VEDIC_ELEMENT_META[p.sign.element];
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedGrahaId(p.id)}
                    className={`w-full min-h-[48px] py-2.5 px-3 grid grid-cols-12 items-center gap-x-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F5F5F5] font-medium' : 'bg-white hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <span className="col-span-4 sm:col-span-3 text-[#141414] flex items-center gap-1.5 min-w-0">
                      <span className="w-5 text-center text-sm shrink-0">{p.symbol}</span>
                      <span className="truncate">{p.nameKo}</span>
                    </span>
                    <span className="col-span-4 sm:col-span-4 text-[#141414] truncate">
                      <span style={{ color: elMeta.color }} className="mr-1">
                        {p.sign.symbol}
                      </span>
                      {p.sign.sanskritKo}
                      <span className="text-[#6E6E6E] ml-0.5 hidden sm:inline">
                        ({p.sign.nameKo})
                      </span>
                    </span>
                    <span className="col-span-4 sm:col-span-3 text-right sm:text-left text-[#525252] truncate">
                      {p.nakshatra.nameKo} {p.pada}파다
                    </span>
                    <span className="hidden sm:block sm:col-span-2 text-right font-mono text-[#6E6E6E] tabular-nums whitespace-nowrap">
                      {p.house}H · {p.degreeLabel.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Strip: Vimshottari Dasha Timeline & Rahu-Ketu Axis + Tattva Elements */}
      <div className="mt-12 pt-10 border-t border-[#EBEBEB] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Vimshottari Dasha (Vedic Life Cycles) */}
        <div className="lg:col-span-6">
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <h3 className="font-editorial text-lg font-bold text-[#141414]">
              빔쇼타리 다샤 (베딕 대운 주기)
            </h3>
            <span className="text-xs text-[#6E6E6E] tabular-nums">
              2026~2027 현재 주기 기준
            </span>
          </div>

          <div className="border border-[#141414] bg-[#FAFAFA] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-editorial text-base font-bold text-[#141414]">
                {dashas.currentMahadasha.lordKo}({dashas.currentMahadasha.sanskritKo}) 마하다샤 ·{' '}
                {dashas.currentAntardasha.lordKo} 소운
              </p>
              <span className="font-mono text-xs text-[#595959] tabular-nums">
                {dashas.currentMahadasha.startYear}–{dashas.currentMahadasha.endYear}년
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-[1.8] text-[#262626]">
              {dashas.currentMahadasha.theme}.
            </p>
            <p className="mt-3 pt-3 border-t border-[#E5E5E5] text-xs text-[#525252] leading-relaxed">
              <span className="font-semibold text-[#141414]">
                현재 안타르다샤(소운 · {dashas.currentAntardasha.endYearMonth})
              </span>
              <span className="mx-1.5 text-[#A3A3A3]" aria-hidden="true">·</span>
              <span>{dashas.currentAntardasha.theme}.</span>
            </p>
          </div>

          {/* Surrounding 5 Mahadasha Steps */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 border-t border-l border-[#E5E5E5]">
            {dashas.timeline.map((period, idx) => (
              <div
                key={`${period.lordId}-${idx}`}
                className={`p-3 border-r border-b border-[#E5E5E5] ${
                  period.isCurrent ? 'bg-[#141414] text-white' : 'bg-white text-[#141414]'
                }`}
              >
                <p
                  className={`text-[10px] font-mono tabular-nums ${
                    period.isCurrent ? 'text-[#D4D4D4]' : 'text-[#6E6E6E]'
                  }`}
                >
                  {period.startYear}–{period.endYear}
                </p>
                <p className="mt-1 font-editorial text-sm font-bold">
                  {period.lordKo}
                </p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    period.isCurrent ? 'text-[#E5E5E5]' : 'text-[#6E6E6E]'
                  }`}
                >
                  {period.isCurrent ? '현재 대운' : `${period.durationYears}년`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rahu-Ketu Karmic Axis + 4 Tattva Elements */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-4">
              <h3 className="font-editorial text-lg font-bold text-[#141414]">
                라후(☊) · 케투(☋) 카르마 축
              </h3>
              <span className="text-xs text-[#6E6E6E] tabular-nums">
                {rahuKetuAxis.rahuHouse}H ↔ {rahuKetuAxis.ketuHouse}H
              </span>
            </div>
            <div className="border border-[#E5E5E5] bg-white p-5 space-y-3.5">
              <p className="text-xs font-semibold text-[#141414]">
                {rahuKetuAxis.headline}
              </p>
              <div className="text-sm leading-[1.78] text-[#262626] space-y-2.5">
                <p>
                  <span className="font-medium text-[#141414]">라후(확장축) · </span>
                  {rahuKetuAxis.rahuGuidance}
                </p>
                <p>
                  <span className="font-medium text-[#141414]">케투(비움축) · </span>
                  {rahuKetuAxis.ketuGuidance}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#141414]">
                베딕 4대 원소(Tattva) 분포
              </h3>
              <span className="text-xs text-[#6E6E6E]">
                주도 원소 · {astrology.dominantElement.nameKo}
              </span>
            </div>

            <div className="space-y-3">
              {astrology.elements.map((el) => (
                <div key={el.element}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: el.color }}>
                        {el.nameKo}
                      </span>
                      <span className="text-[#6E6E6E] tabular-nums">{el.count}배치</span>
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
          </div>
        </div>
      </div>

      {/* Bottom Asymmetric 70/30: Saju × Vedic Cross-Insight + Cheosa Jae Margin Note */}
      <div className="mt-14 pt-12 border-t border-[#E5E5E5] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-8 max-w-2xl">
          <p className="text-xs text-[#595959] mb-2">명리 × 조티쉬 교차 통찰 · 사주 × 베딕</p>
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
          aria-label="재(災)의 여백 노트 · 베딕 교차"
          className="lg:col-span-4 lg:sticky lg:top-24"
        >
          <div className="border border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#F0F0F0]">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-white">
                <SeoldamImage
                  src={SEOLDAM_ASSETS.notes.keen}
                  alt="갓 챙을 매만지며 베딕 쿤달리를 살피는 저승차사 고양이 재(災)"
                  className="w-full h-full object-contain"
                  fallbackTitle="재(災)"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#141414]">
                  재(災)의 여백 노트 · 베딕 교차
                </p>
                <p className="text-[11px] text-[#6E6E6E] mt-0.5">
                  저승차사 재(災)
                </p>
              </div>
            </div>

            <blockquote className="mt-5 font-editorial text-[15px] leading-[1.82] text-[#262626]">
              “{astrology.crossInsight.seoldamQuote}”
            </blockquote>

            <p className="mt-5 pt-4 border-t border-[#F0F0F0] text-[11px] leading-relaxed text-[#6E6E6E] tabular-nums">
              주석 · {astrology.crossInsight.footnote}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
