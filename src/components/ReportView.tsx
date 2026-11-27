import { useState } from 'react';
import { BookMarked, Check, Coffee, Copy, Printer, RotateCcw, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { ReadingReport } from '../engine/sajuTypes';
import { AstrologySection } from './AstrologySection';
import { InnateChaptersTabs } from './InnateChaptersTabs';
import { NewYearForecastSection } from './NewYearForecastSection';
import { SajuChartSection } from './SajuChartSection';
import { SeoldamImage } from './SeoldamImage';
import { YearEndReviewSection } from './YearEndReviewSection';

interface ReportViewProps {
  report: ReadingReport;
  isSavedInLedger: boolean;
  onSaveToLedger: () => void;
  onResetToInput: () => void;
  onOpenRelation: () => void;
  onOpenBokchae: () => void;
}

export function ReportView({
  report,
  isSavedInLedger,
  onSaveToLedger,
  onResetToInput,
  onOpenRelation,
  onOpenBokchae,
}: ReportViewProps) {
  const [copied, setCopied] = useState(false);
  const { chart } = report;

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
      `[저승차사 재(災) 명리 리포트] ${report.coverTitle}`,
      `사주 원국: ${pillarsLine} (${chart.pillars.day.ganjiHangul}일주 · ${chart.gyeokguk.name})`,
      `2026 병오년 결산: ${report.annual.review2026.headline}`,
      `2027 정미년 신년: ${report.annual.forecast2027.headline}`,
      `서양 점성술: 태양 ${report.astrology.sun.sign.nameKo} · 달 ${report.astrology.moon.sign.nameKo}${
        report.astrology.ascendant ? ` · 상승궁 ${report.astrology.ascendant.sign.nameKo}` : ''
      }`,
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white"
    >
      <article className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-10 pb-24 lg:pt-14">
        {/* Editorial Cover Header */}
        <header className="pb-12">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#666666] tabular-nums mb-5">
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
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-[1.24] text-[#141414] text-balance">
                {report.coverTitle}
              </h1>
              <p className="mt-3 text-base text-[#525252]">
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
                onClick={handlePrint}
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>인쇄 / PDF</span>
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

          {/* Seoldam Opening Pull Quote — Top & Bottom Hairline Rules (Zero Thick Left Border) */}
          <div className="mt-10 py-7 border-t border-b border-[#E5E5E5] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
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
              <p className="hidden md:block text-xs text-[#737373] mb-2">
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
        </header>

        {/* Section 00: Four Pillars & Five Elements */}
        <SajuChartSection chart={chart} />

        {/* Section 01: 2026 Byeong-o Year-End Review */}
        <YearEndReviewSection review={report.annual.review2026} />

        {/* Section 02: 2027 Jeong-mi New Year Forecast & 12-Month Calendar */}
        <NewYearForecastSection forecast={report.annual.forecast2027} />

        {/* Section 03: Innate 5-Domain Saju Tabs */}
        <InnateChaptersTabs chapters={report.chapters} />

        {/* Section 04: Western Astrology Natal Chart & East-West Cross-Insight */}
        <AstrologySection astrology={report.astrology} />

        {/* Closing Prescription */}
        <section
          aria-labelledby="closing-heading"
          className="pt-16 border-t border-[#141414]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-8">
              <p className="text-xs text-[#666666] mb-2">종합 결어 · 2027 정미년 용신 양생 처방</p>
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
                  <dt className="text-xs text-[#737373] mb-1">균형 용신 · 희신</dt>
                  <dd className="text-sm font-medium text-[#141414]">
                    {report.closingPrescription.yongsinElement}
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[#E5E5E5]">
                  <dt className="text-xs text-[#737373] mb-1">운을 돕는 계절 · 방향</dt>
                  <dd className="text-sm font-medium text-[#141414]">
                    {report.closingPrescription.favorableSeason} ·{' '}
                    {report.closingPrescription.favorableDirection}
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[#E5E5E5]">
                  <dt className="text-xs text-[#737373] mb-1">조화로운 색채</dt>
                  <dd className="text-sm font-medium text-[#141414]">
                    {report.closingPrescription.favorableColor}
                  </dd>
                </div>
                <div className="p-5 border-r border-b border-[#E5E5E5]">
                  <dt className="text-xs text-[#737373] mb-1">일상 보완 습관</dt>
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
                오늘 살펴보신 여덟 글자가 스스로를 조금 더 너그럽게 이해하는 고요한 거울이 되시길 바랍니다.
                지나온 액운은 제가 대신 태워 보내드리겠습니다.
              </p>
              <div className="mt-6 w-full space-y-2.5 no-print">
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

        {/* Quiet Editorial Footer */}
        <footer className="mt-16 pt-8 border-t border-[#EBEBEB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6E6E6E]">
          <span>저승차사 재(災) 명리 리포트 · 자기 이해와 흥미를 위한 참고용 풀이</span>
          <span>명부에 기록해 두시면 새로고침 후에도 보관 명부에서 언제든 다시 꺼내 볼 수 있습니다.</span>
        </footer>
      </article>
    </motion.main>
  );
}
