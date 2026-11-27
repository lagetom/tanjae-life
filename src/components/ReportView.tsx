import { useState } from 'react';
import {
  BookMarked,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Copy,
  RotateCcw,
  Share2,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import type { ReadingReport } from '../types/saju';
import { AstrologySection } from './AstrologySection';
import { InnateChaptersTabs } from './InnateChaptersTabs';
import { NewYearForecastSection } from './NewYearForecastSection';
import { SajuChartSection } from './SajuChartSection';
import { SeoldamImage } from './SeoldamImage';
import { ShareCardModal } from './ShareCardModal';
import { YearEndReviewSection } from './YearEndReviewSection';

export type ReportPageId =
  | 'won-guk'
  | 'review-2026'
  | 'forecast-2027'
  | 'innate-saju'
  | 'astrology'
  | 'closing';

export const REPORT_PAGES: readonly {
  id: ReportPageId;
  num: string;
  shortLabel: string;
  fullLabel: string;
}[] = [
  { id: 'won-guk', num: '01', shortLabel: '원국표', fullLabel: '사주 원국표 · 오행' },
  { id: 'review-2026', num: '02', shortLabel: '2026 결산', fullLabel: '2026 병오년 연말결산' },
  { id: 'forecast-2027', num: '03', shortLabel: '2027 신년', fullLabel: '2027 정미년 신년사주' },
  { id: 'innate-saju', num: '04', shortLabel: '타고난 5대운', fullLabel: '타고난 5대 기질' },
  { id: 'astrology', num: '05', shortLabel: '베딕 점성술', fullLabel: '인도 베딕 점성술' },
  { id: 'closing', num: '06', shortLabel: '종합 처방', fullLabel: '2027 한 줄 처방' },
];

interface ReportViewProps {
  report: ReadingReport;
  activePage: ReportPageId;
  onChangePage: (page: ReportPageId) => void;
  isSavedInLedger: boolean;
  onSaveToLedger: () => void;
  onResetToInput: () => void;
  onOpenRelation: () => void;
  onOpenBokchae: () => void;
}

export function ReportView({
  report,
  activePage,
  onChangePage,
  isSavedInLedger,
  onSaveToLedger,
  onResetToInput,
  onOpenRelation,
  onOpenBokchae,
}: ReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { chart, astrology } = report;

  const pageIndex = Math.max(
    0,
    REPORT_PAGES.findIndex((p) => p.id === activePage)
  );
  const prevPage = pageIndex > 0 ? REPORT_PAGES[pageIndex - 1] : null;
  const nextPage = pageIndex < REPORT_PAGES.length - 1 ? REPORT_PAGES[pageIndex + 1] : null;

  const solarStr = `${chart.solarDate.year}.${String(chart.solarDate.month).padStart(2, '0')}.${String(chart.solarDate.day).padStart(2, '0')}`;
  const lunarStr = `${chart.lunarDate.year}.${String(chart.lunarDate.month).padStart(2, '0')}.${String(chart.lunarDate.day).padStart(2, '0')}${chart.lunarDate.isLeap ? '(윤)' : ''}`;
  const timeStr = chart.input.unknownTime
    ? '시간 미상 (삼주 6자)'
    : `${String(chart.solarDate.hour).padStart(2, '0')}:${String(chart.solarDate.minute).padStart(2, '0')}${
        chart.input.useTrueSolarTime
          ? ` (진태양시 ${String(chart.adjustedDate.hour).padStart(2, '0')}:${String(chart.adjustedDate.minute).padStart(2, '0')})`
          : ''
      }`;

  const handleCopySummary = async () => {
    const pillarsLine = [
      chart.pillars.hour ? `${chart.pillars.hour.ganjiHangul}(시)` : '미상(시)',
      `${chart.pillars.day.ganjiHangul}(일)`,
      `${chart.pillars.month.ganjiHangul}(월)`,
      `${chart.pillars.year.ganjiHangul}(연)`,
    ].join(' · ');

    const text = [
      `[차사 재(災) 명리] ${report.coverTitle}`,
      `사주 원국: ${pillarsLine} (${chart.pillars.day.ganjiHangul}일주 · ${chart.gyeokguk.name})`,
      `2026 병오년 결산: ${report.annual.review2026.headline}`,
      `2027 정미년 신년: ${report.annual.forecast2027.headline}`,
      `인도 베딕 점성술: 찬드라 ${astrology.moon.sign.sanskritKo}(${astrology.moon.sign.nameKo}) · ${astrology.janmaNakshatra.info.nameKo} ${astrology.janmaNakshatra.pada}파다${
        astrology.lagna ? ` · 라그나 ${astrology.lagna.sign.sanskritKo}` : ''
      } · ${astrology.dashas.currentMahadasha.lordKo} 대운`,
      `용신: ${report.closingPrescription.yongsinElement}`,
      `저승차사 재(災)의 2027 한 줄 처방: "${report.closingPrescription.oneLiner}"`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleFlipPage = (page: ReportPageId) => {
    onChangePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shouldRender = (id: ReportPageId) => activePage === id;

  return (
    <main className="bg-white">
      <article className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-10 pb-24 lg:pt-12">
        {/* Compact Editorial Cover Header */}
        <header className="pb-8 border-b border-[#E5E5E5]">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#595959] tabular-nums mb-4">
            <span>양력 {solarStr}</span>
            <span aria-hidden="true">·</span>
            <span>음력 {lunarStr}</span>
            <span aria-hidden="true">·</span>
            <span>{timeStr}</span>
            <span aria-hidden="true">·</span>
            <span>절기 {chart.solarTermName}</span>
            <span aria-hidden="true">·</span>
            <span>{chart.input.gender === 'female' ? '여명(女命)' : '남명(男命)'}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="font-editorial text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-[1.24] text-[#141414] text-balance">
                {report.coverTitle}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#525252]">
                {report.dayPillarSymbol}
              </p>
            </div>

            {/* Clean Utility Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 no-print">
              <button
                type="button"
                onClick={onSaveToLedger}
                aria-live="polite"
                className={`min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                  isSavedInLedger
                    ? 'text-[#14532D] bg-[#F2F7F4] border-[#C7DCD0]'
                    : 'text-[#141414] bg-white border-[#141414] hover:bg-[#141414] hover:text-white'
                }`}
              >
                {isSavedInLedger ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <BookMarked className="w-3.5 h-3.5" />
                )}
                <span>{isSavedInLedger ? '명부에 기록됨' : '명부에 기록'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenRelation}
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5" />
                <span>친구 사주 관계도</span>
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                aria-live="polite"
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '요약 복사됨' : '요약 복사'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>공유 카드</span>
              </button>
              <button
                type="button"
                onClick={onResetToInput}
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#525252] bg-[#FAFAFA] border border-[#E5E5E5] rounded-md hover:text-[#141414] hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>명부 · 입력창으로</span>
              </button>
            </div>
          </div>

          {/* Chapter-by-Chapter Folio Stepper */}
          <nav
            aria-label="리포트 장별 넘기기"
            className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-l border-[#E5E5E5] no-print"
          >
            {REPORT_PAGES.map((page) => {
              const isCurrent = activePage === page.id;
              return (
                <button
                  key={page.id}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => handleFlipPage(page.id)}
                  className={`min-h-[52px] px-3.5 py-3 text-left border-r border-b border-[#E5E5E5] transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#141414] text-white'
                      : 'bg-white text-[#525252] hover:bg-[#FAFAFA] hover:text-[#141414]'
                  }`}
                >
                  <span
                    className={`block font-mono text-[10px] tabular-nums ${
                      isCurrent ? 'text-[#D4D4D4]' : 'text-[#6E6E6E]'
                    }`}
                  >
                    {page.num}장
                  </span>
                  <span className="mt-0.5 block text-xs font-medium truncate">
                    {page.shortLabel}
                  </span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* Active Chapter Body */}
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Page 01: Opening Greeting + Four Pillars & Five Elements */}
          {shouldRender('won-guk') && (
            <div>
              <div className="mt-8 py-7 border-t border-b border-[#E5E5E5] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-2 flex items-center gap-3 md:block">
                  <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden bg-white shrink-0">
                    <SeoldamImage
                      src={SEOLDAM_ASSETS.notes.calm}
                      alt="검은 갓을 쓰고 찻잔을 들고 있는 저승차사 고양이 재(災)"
                      className="w-full h-full object-contain"
                      fallbackTitle="재(災)"
                    />
                  </div>
                  <span className="md:hidden text-xs font-medium text-[#141414]">
                    저승차사 재(災)의 첫인사
                  </span>
                </div>
                <div className="md:col-span-10">
                  <p className="hidden md:block text-xs text-[#6E6E6E] mb-2">
                    저승차사 재(災)의 총평 서문
                  </p>
                  <p className="font-editorial text-lg sm:text-[1.2rem] leading-[1.75] text-[#141414]">
                    “{report.openingGreeting}”
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#525252]">
                    {report.executiveSummary}
                  </p>
                </div>
              </div>

              <SajuChartSection chart={chart} />
            </div>
          )}

          {/* Page 02: 2026 Byeong-o Year-End Review */}
          {shouldRender('review-2026') && (
            <YearEndReviewSection review={report.annual.review2026} />
          )}

          {/* Page 03: 2027 Jeong-mi New Year Forecast & 12-Month Calendar */}
          {shouldRender('forecast-2027') && (
            <NewYearForecastSection forecast={report.annual.forecast2027} />
          )}

          {/* Page 04: Innate 5-Domain Saju Tabs */}
          {shouldRender('innate-saju') && (
            <InnateChaptersTabs chapters={report.chapters} />
          )}

          {/* Page 05: Indian Vedic Astrology (Jyotish) */}
          {shouldRender('astrology') && (
            <AstrologySection astrology={astrology} />
          )}

          {/* Page 06: Closing Prescription */}
          {shouldRender('closing') && (
            <section
              id="closing"
              aria-labelledby="closing-heading"
              className="py-12 border-t border-[#141414]"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-8">
                  <p className="text-xs text-[#595959] mb-2">
                    05. 종합 결어 · 2027 정미년 용신 양생 처방
                  </p>
                  <h2
                    id="closing-heading"
                    className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]"
                  >
                    저승차사 재(災)의 2027 한 줄 처방
                  </h2>
                  <p className="mt-5 font-editorial text-lg sm:text-xl leading-[1.8] text-[#141414] max-w-2xl">
                    “{report.closingPrescription.oneLiner}”
                  </p>

                  <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#E5E5E5]">
                    <div className="p-5 border-r border-b border-[#E5E5E5]">
                      <dt className="text-xs text-[#6E6E6E] mb-1">균형 용신 · 희신</dt>
                      <dd className="text-sm font-medium text-[#141414]">
                        {report.closingPrescription.yongsinElement}
                      </dd>
                    </div>
                    <div className="p-5 border-r border-b border-[#E5E5E5]">
                      <dt className="text-xs text-[#6E6E6E] mb-1">운을 돕는 계절 · 방향</dt>
                      <dd className="text-sm font-medium text-[#141414]">
                        {report.closingPrescription.favorableSeason} ·{' '}
                        {report.closingPrescription.favorableDirection}
                      </dd>
                    </div>
                    <div className="p-5 border-r border-b border-[#E5E5E5]">
                      <dt className="text-xs text-[#6E6E6E] mb-1">조화로운 색채</dt>
                      <dd className="text-sm font-medium text-[#141414]">
                        {report.closingPrescription.favorableColor}
                      </dd>
                    </div>
                    <div className="p-5 border-r border-b border-[#E5E5E5]">
                      <dt className="text-xs text-[#6E6E6E] mb-1">일상 보완 습관</dt>
                      <dd className="text-sm text-[#404040] leading-relaxed">
                        {report.closingPrescription.dailyRitual}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="lg:col-span-4 border border-[#E5E5E5] bg-[#FAFAFA] p-6 flex flex-col items-center text-center">
                  <div className="w-28 h-28 overflow-hidden bg-white border border-[#EFEFEF] p-2">
                    <SeoldamImage
                      src={SEOLDAM_ASSETS.notes.warm}
                      alt="검은 갓을 쓰고 부채를 든 저승차사 고양이 재(災)"
                      className="w-full h-full object-contain"
                      fallbackTitle="재(災)"
                    />
                  </div>
                  <p className="mt-4 font-editorial text-sm leading-relaxed text-[#262626]">
                    오늘 살펴보신 여덟 글자와 베딕 별자리가 스스로를 조금 더 너그럽게 이해하는 고요한 거울이 되시길 바랍니다.
                    지나온 액운은 제가 대신 태워 보내드리겠습니다.
                  </p>
                  <div className="mt-6 w-full space-y-2.5 no-print">
                    <button
                      type="button"
                      onClick={() => setShareModalOpen(true)}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#141414] bg-white border border-[#141414] rounded-md hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>공유 카드</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenRelation}
                      className="w-full min-h-[44px] px-4 py-2.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer"
                    >
                      내 명식으로 친구 사주 관계도 보기
                    </button>
                    <button
                      type="button"
                      onClick={onResetToInput}
                      className="w-full min-h-[44px] px-4 py-2.5 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer"
                    >
                      다른 생년월일로 새로 풀이하기
                    </button>
                    <button
                      type="button"
                      onClick={onOpenBokchae}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#525252] bg-white border border-[#E5E5E5] rounded-md hover:text-[#141414] hover:border-[#141414] transition-colors cursor-pointer"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>풀이가 도움되셨다면 · 복채 전하기</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </motion.div>

        {/* Bottom Book-Like Page-Turn Navigation Bar */}
        <nav
          aria-label="이전 장 · 다음 장 이동"
          className="mt-10 pt-8 border-t border-[#141414] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print"
        >
          {prevPage ? (
            <button
              type="button"
              onClick={() => handleFlipPage(prevPage.id)}
              className="min-h-[48px] inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>
                {prevPage.num}장 · {prevPage.fullLabel}
              </span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          <p className="text-center font-mono text-xs text-[#6E6E6E] tabular-nums py-1">
            {String(pageIndex + 1).padStart(2, '0')} / {String(REPORT_PAGES.length).padStart(2, '0')}장
          </p>

          {nextPage ? (
            <button
              type="button"
              onClick={() => handleFlipPage(nextPage.id)}
              className="min-h-[48px] inline-flex items-center justify-center sm:justify-end gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer"
            >
              <span>
                다음 장 · {nextPage.num}. {nextPage.fullLabel}
              </span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleFlipPage('won-guk')}
              className="min-h-[48px] inline-flex items-center justify-center sm:justify-end gap-2 px-5 py-2.5 text-xs font-medium text-[#141414] bg-[#FAFAFA] border border-[#141414] rounded-md hover:bg-[#141414] hover:text-white transition-colors cursor-pointer"
            >
              <span>처음 장(원국표)으로 돌아가기</span>
            </button>
          )}
        </nav>

        {/* Quiet Editorial Footer */}
        <footer className="mt-12 pt-8 border-t border-[#EBEBEB] space-y-2.5 text-xs text-[#6E6E6E]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>차사 재(災) 명리 · 자기 이해와 흥미를 위한 참고용 풀이</span>
            <span>명부에 기록해 두시면 새로고침 후에도 보관 명부에서 언제든 다시 꺼내 볼 수 있습니다.</span>
          </div>
          <p>
            © 2026{' '}
            <a
              href="https://tanjae.pages.dev"
              className="hover:text-[#141414] underline-offset-2 hover:underline transition-colors"
            >
              타고 남은 재
            </a>
            . All rights reserved. 무단 복제·재배포 금지 ·{' '}
            <a
              href="/LICENSE.txt"
              className="hover:text-[#141414] underline-offset-2 hover:underline transition-colors"
            >
              이용 안내
            </a>
          </p>
        </footer>
      </article>

      <ShareCardModal
        open={shareModalOpen}
        report={report}
        onClose={() => setShareModalOpen(false)}
      />
    </main>
  );
}
