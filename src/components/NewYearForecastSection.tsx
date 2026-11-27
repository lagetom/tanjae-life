import { useState } from 'react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { MonthlyFlow2027, NewYearForecast2027 } from '../engine/annualFortune';
import { SeoldamImage } from './SeoldamImage';

interface NewYearForecastSectionProps {
  forecast: NewYearForecast2027;
}

const GRADE_STYLE: Record<MonthlyFlow2027['grade'], { color: string; label: string }> = {
  호조: { color: '#14532D', label: '호조' },
  안정: { color: '#525252', label: '안정' },
  점검: { color: '#9A3412', label: '점검' },
};

export function NewYearForecastSection({ forecast }: NewYearForecastSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(2); // 입춘 2월 기본 선택
  const { pillar } = forecast;

  const activeMonthFlow =
    forecast.monthlyFlows.find((m) => m.month === selectedMonth) ??
    forecast.monthlyFlows[1];

  return (
    <section
      id="forecast-2027"
      aria-labelledby="forecast-2027-heading"
      className="py-16 border-t border-[#141414] scroll-mt-20"
    >
      {/* Top 70/30 Editorial Overview + 4 Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-8 max-w-2xl">
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <span className="font-mono text-xs text-[#737373] tabular-nums">02.</span>
            <h2
              id="forecast-2027-heading"
              className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]"
            >
              2027 정미년(丁未) 신년사주
            </h2>
          </div>

          <p className="text-sm text-[#666666]">
            붉은 양의 해 — 확장에서 결실로 넘어가는 새해 전략과 월별 흐름
          </p>

          {/* Unboxed Metadata Line */}
          <p className="mt-4 pb-5 border-b border-[#EFEFEF] text-xs text-[#737373] tabular-nums">
            2027 세운 · {pillar.ganjiHangul}({pillar.ganjiHanja}) · 천간 {pillar.stemTenGod} · 지지{' '}
            {pillar.branchTenGod} · 12운성 {pillar.lifeStage}
            {pillar.isCheoneulYear ? ' · 천을귀인(天乙貴人) 세운' : ''}
          </p>

          <h3 className="mt-7 font-editorial text-xl sm:text-[1.35rem] font-bold leading-snug text-[#141414] text-balance">
            {forecast.headline}
          </h3>

          <div className="mt-5 space-y-5 text-[15.5px] leading-[1.88] text-[#262626]">
            {forecast.overviewParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* 2027 4-Domain Grid */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#E5E5E5]">
            {forecast.domainForecasts.map((domain) => (
              <div
                key={domain.id}
                className="p-5 border-r border-b border-[#E5E5E5] bg-white"
              >
                <p className="text-xs font-semibold text-[#141414]">{domain.label}</p>
                <p className="mt-1 text-xs text-[#737373]">{domain.theme}</p>
                <p className="mt-3 text-sm leading-[1.78] text-[#404040]">
                  {domain.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 30% Sticky Seoldam Margin Note */}
        <aside
          aria-label={forecast.seoldamNote.tag}
          className="lg:col-span-4 lg:sticky lg:top-24 space-y-6"
        >
          <div className="border border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#F0F0F0]">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-white">
                <SeoldamImage
                  src={SEOLDAM_ASSETS.notes.warm}
                  alt="부채를 들고 2027년 신년 운세를 전하는 저승차사 고양이 재(災)"
                  className="w-full h-full object-contain"
                  fallbackTitle="재(災)"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#141414]">
                  {forecast.seoldamNote.tag}
                </p>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  저승차사 재(災)
                </p>
              </div>
            </div>

            <blockquote className="mt-5 font-editorial text-[15px] leading-[1.82] text-[#262626]">
              “{forecast.seoldamNote.quote}”
            </blockquote>

            <div className="mt-5 pt-4 border-t border-[#F0F0F0] space-y-1.5 text-xs text-[#525252] tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">주요 상승 월</span>
                <span className="font-medium text-[#14532D]">
                  {forecast.peakMonths.map((m) => `${m}월`).join(' · ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737373]">페이스 점검 월</span>
                <span className="font-medium text-[#9A3412]">
                  {forecast.careMonths.map((m) => `${m}월`).join(' · ')}
                </span>
              </div>
            </div>

            <p className="mt-4 pt-4 border-t border-[#F0F0F0] text-[11px] leading-relaxed text-[#737373] tabular-nums">
              주석 · {forecast.seoldamNote.footnote}
            </p>
          </div>
        </aside>
      </div>

      {/* Interactive 2027 12-Month Calendar Grid */}
      <div className="mt-14 pt-12 border-t border-[#EBEBEB]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <p className="text-xs text-[#666666] mb-1">2027 정미년 월운 캘린더</p>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#141414]">
              1월~12월 월별 흐름표
            </h3>
          </div>
          <p className="text-xs text-[#737373] no-print">
            원하는 달을 선택하면 해당 월의 상세 조언과 재(災)의 메모가 표시됩니다.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 border-t border-l border-[#E5E5E5]">
          {forecast.monthlyFlows.map((flow) => {
            const isSelected = flow.month === activeMonthFlow.month;
            const style = GRADE_STYLE[flow.grade];

            return (
              <button
                key={flow.month}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedMonth(flow.month)}
                className={`text-left min-h-[84px] p-4 border-r border-b border-[#E5E5E5] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#141414] ${
                  isSelected
                    ? 'bg-[#141414] text-white'
                    : 'bg-white hover:bg-[#FAFAFA] text-[#141414]'
                }`}
              >
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <span className="font-mono font-medium">
                    {String(flow.month).padStart(2, '0')}월
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: isSelected ? '#E5E5E5' : style.color }}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="mt-2 font-editorial text-base font-bold">
                  {flow.ganjiHangul}{' '}
                  <span
                    className={`text-xs font-normal ${
                      isSelected ? 'text-[#CCCCCC]' : 'text-[#737373]'
                    }`}
                  >
                    {flow.ganjiHanja}
                  </span>
                </p>
                <p
                  className={`mt-1 text-[11px] truncate ${
                    isSelected ? 'text-[#D4D4D4]' : 'text-[#666666]'
                  }`}
                >
                  {flow.keyword}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Month Detailed Reading Box */}
        <div
          role="region"
          aria-label="선택된 월 상세 풀이"
          className="mt-4 border border-[#141414] bg-[#FAFAFA] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-baseline gap-2.5 text-xs text-[#666666] tabular-nums">
              <span className="font-mono text-[#141414] font-medium">
                2027.{String(activeMonthFlow.month).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeMonthFlow.solarTermLabel}</span>
              <span aria-hidden="true">·</span>
              <span>
                {activeMonthFlow.ganjiHangul}({activeMonthFlow.ganjiHanja})월
              </span>
              <span aria-hidden="true">·</span>
              <span>
                천간 {activeMonthFlow.stemTenGod} / 지지 {activeMonthFlow.branchTenGod}
              </span>
            </div>
            <h4 className="mt-2 font-editorial text-lg font-bold text-[#141414]">
              {activeMonthFlow.month}월 흐름 — {activeMonthFlow.keyword} ({activeMonthFlow.grade})
            </h4>
            <p className="mt-2.5 text-sm leading-[1.82] text-[#262626]">
              {activeMonthFlow.advice}
            </p>
          </div>
          <div className="lg:col-span-4 lg:border-l lg:border-[#E5E5E5] lg:pl-6">
            <p className="text-xs font-medium text-[#141414] mb-1.5">
              재(災)의 {activeMonthFlow.month}월 메모
            </p>
            <p className="font-editorial text-sm leading-relaxed text-[#404040]">
              “{activeMonthFlow.seoldamTip}”
            </p>
          </div>
        </div>
      </div>

      {/* 2027 Vedic Gochar Transit Bridge */}
      <div className="mt-10 pt-8 border-t border-[#EBEBEB]">
        <p className="text-xs text-[#595959] mb-1.5">
          2027 인도 베딕 고차라(Gochar) 트랜짓 · 구루 목성(카르카→심하) · 샤니 토성(미나)
        </p>
        <h3 className="font-editorial text-lg font-bold text-[#141414] mb-4">
          {forecast.astrologyTransit2027.headline}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#E5E5E5] bg-white p-5">
            <p className="text-xs font-semibold text-[#141414] mb-2">
              2027 상반기 (구루 카르카 고조 · 샤니 미나 마무리)
            </p>
            <p className="text-sm leading-[1.8] text-[#404040]">
              {forecast.astrologyTransit2027.firstHalf}
            </p>
          </div>
          <div className="border border-[#E5E5E5] bg-white p-5">
            <p className="text-xs font-semibold text-[#141414] mb-2">
              2027 하반기 (구루 심하 진입 · 외부 확장 전환)
            </p>
            <p className="text-sm leading-[1.8] text-[#404040]">
              {forecast.astrologyTransit2027.secondHalf}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
