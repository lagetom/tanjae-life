import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import type { MonthlyReview2026, YearEndReview2026 } from '../types/saju';
import { SeoldamImage } from './SeoldamImage';

interface YearEndReviewSectionProps {
  review: YearEndReview2026;
}

const REVIEW_GRADE_STYLE: Record<
  MonthlyReview2026['grade'],
  { color: string; label: string }
> = {
  '빛난 달': { color: '#14532D', label: '빛난 달' },
  '다진 달': { color: '#525252', label: '다진 달' },
  '버틴 달': { color: '#9A3412', label: '버틴 달' },
};

export function YearEndReviewSection({ review }: YearEndReviewSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const { pillar } = review;

  const activeMonthReview =
    review.monthlyReviews.find((m) => m.month === selectedMonth) ??
    review.monthlyReviews[0];

  const handleStepMonth = (delta: number) => {
    setSelectedMonth((prev) => {
      const next = prev + delta;
      if (next < 1) return 12;
      if (next > 12) return 1;
      return next;
    });
  };

  return (
    <section
      id="review-2026"
      aria-labelledby="review-2026-heading"
      className="py-16 border-t border-[#141414] scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left 70% Main Year-End Narrative */}
        <div className="lg:col-span-8 max-w-2xl">
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <span className="font-mono text-xs text-[#6E6E6E] tabular-nums">01.</span>
            <h2
              id="review-2026-heading"
              className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]"
            >
              2026 병오년(丙午) 연말결산
            </h2>
          </div>

          <p className="text-sm text-[#595959]">
            붉은 말의 해를 건너온 나의 세운 회고와 1월~12월 월별 돌아보기
          </p>

          {/* Unboxed Metadata Line */}
          <p className="mt-4 pb-5 border-b border-[#EFEFEF] text-xs text-[#6E6E6E] tabular-nums">
            2026 세운 · {pillar.ganjiHangul}({pillar.ganjiHanja}) · 천간 {pillar.stemTenGod} · 지지{' '}
            {pillar.branchTenGod} · 12운성 {pillar.lifeStage}
            {pillar.interactionsWithChart.length > 0
              ? ` · ${pillar.interactionsWithChart[0]}`
              : ''}
          </p>

          <h3 className="mt-7 font-editorial text-xl sm:text-[1.35rem] font-bold leading-snug text-[#141414] text-balance">
            {review.headline}
          </h3>

          <div className="mt-5 space-y-5 text-[15.5px] leading-[1.88] text-[#262626]">
            {review.summaryParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Year-End Summary Definition List */}
          <dl className="mt-8 border-t border-b border-[#E5E5E5] divide-y divide-[#EFEFEF]">
            {review.retrospectItems.map((item) => (
              <div
                key={item.label}
                className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4"
              >
                <dt className="sm:col-span-4 text-xs font-semibold text-[#141414] pt-0.5">
                  {item.label}
                </dt>
                <dd className="sm:col-span-8 text-sm leading-relaxed text-[#404040]">
                  {item.content}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right 30% Sticky Seoldam Margin Note */}
        <aside
          aria-label={review.seoldamNote.tag}
          className="lg:col-span-4 lg:sticky lg:top-24"
        >
          <div className="border border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#F0F0F0]">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-white">
                <SeoldamImage
                  src={SEOLDAM_ASSETS.notes.calm}
                  alt="찻잔을 들고 2026년을 회고하는 저승차사 고양이 재(災)"
                  className="w-full h-full object-contain"
                  fallbackTitle="재(災)"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#141414]">
                  {review.seoldamNote.tag}
                </p>
                <p className="text-[11px] text-[#6E6E6E] mt-0.5">
                  저승차사 재(災)
                </p>
              </div>
            </div>

            <blockquote className="mt-5 font-editorial text-[15px] leading-[1.82] text-[#262626]">
              “{review.seoldamNote.quote}”
            </blockquote>

            <div className="mt-5 pt-4 border-t border-[#F0F0F0] space-y-1.5 text-xs text-[#525252] tabular-nums">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#6E6E6E]">올해 빛났던 달</span>
                <span className="font-medium text-[#14532D]">
                  {review.brightMonths.map((m) => `${m}월`).join(' · ')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#6E6E6E]">애쓰며 버텨낸 달</span>
                <span className="font-medium text-[#9A3412]">
                  {review.toughMonths.map((m) => `${m}월`).join(' · ')}
                </span>
              </div>
            </div>

            <p className="mt-4 pt-4 border-t border-[#F0F0F0] text-[11px] leading-relaxed text-[#6E6E6E] tabular-nums">
              주석 · {review.seoldamNote.footnote}
            </p>
          </div>
        </aside>
      </div>

      {/* Interactive 2026 12-Month Year-End Retrospective Grid */}
      <div className="mt-14 pt-12 border-t border-[#EBEBEB]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs text-[#595959] mb-1">2026 병오년 월운 연말결산</p>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#141414]">
              2026년 1월~12월 월별 돌아보기
            </h3>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 no-print">
            <p className="text-xs text-[#6E6E6E]">
              한 달씩 눌러 지나온 2026년의 결을 되짚어 보세요.
            </p>
            <div className="inline-flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleStepMonth(-1)}
                aria-label="이전 달 돌아보기"
                className="min-h-[40px] min-w-[40px] sm:min-h-[32px] sm:min-w-[32px] inline-flex items-center justify-center border border-[#D4D4D4] bg-white text-[#141414] rounded-md hover:border-[#141414] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleStepMonth(1)}
                aria-label="다음 달 돌아보기"
                className="min-h-[40px] min-w-[40px] sm:min-h-[32px] sm:min-w-[32px] inline-flex items-center justify-center border border-[#D4D4D4] bg-white text-[#141414] rounded-md hover:border-[#141414] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 border-t border-l border-[#E5E5E5]">
          {review.monthlyReviews.map((flow) => {
            const isSelected = flow.month === activeMonthReview.month;
            const style = REVIEW_GRADE_STYLE[flow.grade];

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
                      isSelected ? 'text-[#CCCCCC]' : 'text-[#6E6E6E]'
                    }`}
                  >
                    {flow.ganjiHanja}
                  </span>
                </p>
                <p
                  className={`mt-1 text-[11px] truncate ${
                    isSelected ? 'text-[#D4D4D4]' : 'text-[#595959]'
                  }`}
                >
                  {flow.keyword}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active 2026 Month Retrospective Reading Box */}
        <div
          role="region"
          aria-label="선택된 2026년 월별 회고 상세"
          className="mt-4 border border-[#141414] bg-[#FAFAFA] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-baseline gap-2.5 text-xs text-[#595959] tabular-nums">
              <span className="font-mono text-[#141414] font-medium">
                2026.{String(activeMonthReview.month).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeMonthReview.solarTermLabel}</span>
              <span aria-hidden="true">·</span>
              <span>
                {activeMonthReview.ganjiHangul}({activeMonthReview.ganjiHanja})월
              </span>
              <span aria-hidden="true">·</span>
              <span>
                천간 {activeMonthReview.stemTenGod} / 지지 {activeMonthReview.branchTenGod}
              </span>
            </div>
            <h4 className="mt-2 font-editorial text-lg font-bold text-[#141414]">
              {activeMonthReview.month}월 돌아보기 — {activeMonthReview.keyword} ({activeMonthReview.grade})
            </h4>
            <p className="mt-2.5 text-sm leading-[1.82] text-[#262626]">
              {activeMonthReview.retrospect}
            </p>
            <p className="mt-4 pt-3 border-t border-[#E5E5E5] text-xs leading-relaxed text-[#525252]">
              <span className="font-semibold text-[#141414]">이달의 연말 회고 질문</span>
              <span className="mx-1.5 text-[#A3A3A3]" aria-hidden="true">·</span>
              <span>{activeMonthReview.reflectionQuestion}</span>
            </p>
          </div>
          <div className="lg:col-span-4 lg:border-l lg:border-[#E5E5E5] lg:pl-6">
            <p className="text-xs font-medium text-[#141414] mb-1.5">
              재(災)의 2026년 {activeMonthReview.month}월 메모
            </p>
            <p className="font-editorial text-sm leading-relaxed text-[#404040]">
              “{activeMonthReview.seoldamNote}”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
