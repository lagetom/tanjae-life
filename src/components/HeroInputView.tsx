import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookMarked, Check, Trash2, Users } from 'lucide-react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { ELEMENT_META, PRESET_PROFILES } from '../constants/uiMeta';
import type { BirthInput, PresetProfile } from '../types/saju';
import {
  getLunarLeapMonth,
  getLunarMonthDays,
  isValidSolarDate,
} from '../utils/lunarClient';
import type { LedgerEntry } from '../utils/storage';
import { ResetStorageButton } from './ResetStorageButton';
import { SeoldamImage } from './SeoldamImage';

interface HeroInputViewProps {
  initialInput: BirthInput;
  formSyncVersion: number;
  ledgerEntries: LedgerEntry[];
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (input: BirthInput) => void | Promise<void>;
  onSaveToLedger: (
    input: BirthInput
  ) => Promise<{ entry: LedgerEntry; updatedExisting: boolean }>;
  onOpenLedgerEntry: (entry: LedgerEntry) => void;
  onFillFormFromLedger: (entry: LedgerEntry) => void;
  onRemoveLedgerEntry: (id: string) => void;
  onClearLedger: () => void;
  onOpenLedgerInRelation: () => void;
  onSelectPreset: (preset: PresetProfile) => void;
  onOpenRelation: () => void;
}

const SHICHEN_LABELS = [
  '자시(子時 · 23:00–00:59)',
  '축시(丑時 · 01:00–02:59)',
  '인시(寅時 · 03:00–04:59)',
  '묘시(卯時 · 05:00–06:59)',
  '진시(辰時 · 07:00–08:59)',
  '사시(巳時 · 09:00–10:59)',
  '오시(午時 · 11:00–12:59)',
  '미시(未時 · 13:00–14:59)',
  '신시(申時 · 15:00–16:59)',
  '유시(酉時 · 17:00–18:59)',
  '술시(戌時 · 19:00–20:59)',
  '해시(亥時 · 21:00–22:59)',
];

export function HeroInputView({
  initialInput,
  formSyncVersion,
  ledgerEntries,
  isSubmitting = false,
  serverError = null,
  onSubmit,
  onSaveToLedger,
  onOpenLedgerEntry,
  onFillFormFromLedger,
  onRemoveLedgerEntry,
  onClearLedger,
  onOpenLedgerInRelation,
  onSelectPreset,
  onOpenRelation,
}: HeroInputViewProps) {
  const [name, setName] = useState(initialInput.name);
  const [gender, setGender] = useState(initialInput.gender);
  const [calendarType, setCalendarType] = useState(initialInput.calendarType);
  const [year, setYear] = useState(String(initialInput.year));
  const [month, setMonth] = useState(String(initialInput.month));
  const [day, setDay] = useState(String(initialInput.day));
  const [isLeapMonth, setIsLeapMonth] = useState(initialInput.isLeapMonth);
  const [hour, setHour] = useState(String(initialInput.hour).padStart(2, '0'));
  const [minute, setMinute] = useState(String(initialInput.minute).padStart(2, '0'));
  const [unknownTime, setUnknownTime] = useState(initialInput.unknownTime);
  const [useTrueSolarTime, setUseTrueSolarTime] = useState(initialInput.useTrueSolarTime);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [isSavingLedger, setIsSavingLedger] = useState(false);

  useEffect(() => {
    setName(initialInput.name);
    setGender(initialInput.gender);
    setCalendarType(initialInput.calendarType);
    setYear(String(initialInput.year));
    setMonth(String(initialInput.month));
    setDay(String(initialInput.day));
    setIsLeapMonth(initialInput.isLeapMonth);
    setHour(String(initialInput.hour).padStart(2, '0'));
    setMinute(String(initialInput.minute).padStart(2, '0'));
    setUnknownTime(initialInput.unknownTime);
    setUseTrueSolarTime(initialInput.useTrueSolarTime);
    setErrorMessage(null);
  }, [formSyncVersion, initialInput]);

  const numericYear = parseInt(year, 10);
  const numericMonth = parseInt(month, 10);

  const leapMonthForYear = useMemo(() => {
    if (isNaN(numericYear) || numericYear < 1900 || numericYear > 2050) return 0;
    return getLunarLeapMonth(numericYear);
  }, [numericYear]);

  const canBeLeapMonth =
    calendarType === 'lunar' &&
    leapMonthForYear > 0 &&
    !isNaN(numericMonth) &&
    numericMonth === leapMonthForYear;

  const shichenPreview = useMemo(() => {
    if (unknownTime) return '삼주(연·월·일주 6글자) 기준으로 정밀 보정 분석';
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      return '시각을 00:00~23:59 형식으로 입력해 주세요.';
    }
    const totalMin = h * 60 + m + (useTrueSolarTime ? -30 : 0);
    const normalized = ((totalMin % 1440) + 1440) % 1440;
    const adjH = Math.floor(normalized / 60);
    const adjM = normalized % 60;
    const branchIdx = Math.floor(((adjH + 1) % 24) / 2);
    const adjTimeStr = `${String(adjH).padStart(2, '0')}:${String(adjM).padStart(2, '0')}`;
    return useTrueSolarTime
      ? `진태양시 ${adjTimeStr} 적용 · ${SHICHEN_LABELS[branchIdx]}`
      : `입력 시각 기준 · ${SHICHEN_LABELS[branchIdx]}`;
  }, [hour, minute, unknownTime, useTrueSolarTime]);

  const validateAndBuildInput = (): BirthInput | null => {
    setErrorMessage(null);

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const h = unknownTime ? 12 : parseInt(hour, 10);
    const min = unknownTime ? 0 : parseInt(minute, 10);

    if (isNaN(y) || y < 1900 || y > 2050) {
      setErrorMessage('출생 연도는 1900년부터 2050년 사이로 입력해 주세요.');
      return null;
    }
    if (isNaN(m) || m < 1 || m > 12) {
      setErrorMessage('출생 월은 1에서 12 사이의 숫자로 입력해 주세요.');
      return null;
    }
    if (isNaN(d) || d < 1 || d > 31) {
      setErrorMessage('출생 일을 올바르게 입력해 주세요.');
      return null;
    }

    const effectiveLeap = canBeLeapMonth && isLeapMonth;

    if (calendarType === 'solar') {
      if (!isValidSolarDate(y, m, d)) {
        setErrorMessage(`${y}년 ${m}월에는 ${d}일이 존재하지 않습니다.`);
        return null;
      }
    } else {
      const maxLunarDay = getLunarMonthDays(y, m, effectiveLeap);
      if (maxLunarDay === 0 || d > maxLunarDay) {
        setErrorMessage(
          `음력 ${y}년 ${effectiveLeap ? '윤' : ''}${m}월은 최대 ${maxLunarDay || 29}일까지입니다.`
        );
        return null;
      }
    }

    if (!unknownTime) {
      if (isNaN(h) || h < 0 || h > 23 || isNaN(min) || min < 0 || min > 59) {
        setErrorMessage('출생 시각은 0~23시, 0~59분 사이로 입력해 주세요.');
        return null;
      }
    }

    return {
      name: name.trim(),
      gender,
      calendarType,
      year: y,
      month: m,
      day: d,
      isLeapMonth: effectiveLeap,
      hour: h,
      minute: min,
      unknownTime,
      useTrueSolarTime,
    };
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const validated = validateAndBuildInput();
    if (!validated) return;
    onSubmit(validated);
  };

  const handleSaveToLedgerClick = async () => {
    if (isSavingLedger || isSubmitting) return;
    const validated = validateAndBuildInput();
    if (!validated) return;
    setIsSavingLedger(true);
    try {
      const { entry, updatedExisting } = await onSaveToLedger(validated);
      setSavedNotice(
        updatedExisting
          ? `${entry.name}님의 명부 기록을 최신으로 갱신했습니다.`
          : `${entry.name}님을 재(災)의 명부에 올렸습니다.`
      );
      window.setTimeout(() => setSavedNotice(null), 3000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '명부에 기록하는 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSavingLedger(false);
    }
  };

  return (
    <main className="bg-white">
      {/* Hero Split Section */}
      <section
        id="input-form"
        className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-10 pb-16 lg:pt-14 lg:pb-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left Column: Editorial Intro + Input Form */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#666666] tracking-wide mb-4">
                <span>2026 병오년 연말결산</span>
                <span aria-hidden="true">·</span>
                <span>2027 정미년 신년사주</span>
                <span aria-hidden="true">·</span>
                <span>인도 베딕 점성술</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.24] tracking-tight text-[#141414] text-balance">
                2026년을 차분히 결산하고,
                <br />
                2027년 정미년의 길을 읽습니다.
              </h1>

              <p className="mt-4 text-[15px] leading-relaxed text-[#525252] max-w-xl">
                생년월일시 한 번의 입력으로 2026 병오년 월별 회고, 2027 정미년 신년사주와
                12개월 월운표, 타고난 5대 기질, 인도 베딕 쿤달리·27 나크샤트라까지 한 장씩
                넘겨 보는 리포트로 정리합니다.
              </p>
            </div>

            {/* Clean Hairline Form Surface */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 border border-[#E5E5E5] bg-white p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name (Optional) */}
                <div>
                  <label
                    htmlFor="saju-name"
                    className="block text-xs font-medium text-[#525252] mb-2"
                  >
                    이름 또는 호칭 <span className="text-[#6E6E6E] font-normal">(선택)</span>
                  </label>
                  <input
                    id="saju-name"
                    type="text"
                    maxLength={16}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 김봄"
                    className="w-full h-11 px-3.5 text-base sm:text-sm text-[#141414] bg-white border border-[#D4D4D4] rounded-md placeholder:text-[#767676] focus:outline-none focus:border-[#141414] transition-colors"
                  />
                </div>

                {/* Gender Segmented Control */}
                <div>
                  <span className="block text-xs font-medium text-[#525252] mb-2">
                    성별 <span className="text-[#6E6E6E] font-normal">(인연성 기준)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5F5F5] rounded-md h-11">
                    <button
                      type="button"
                      aria-pressed={gender === 'female'}
                      onClick={() => setGender('female')}
                      className={`text-sm rounded transition-colors cursor-pointer whitespace-nowrap ${
                        gender === 'female'
                          ? 'bg-white text-[#141414] font-medium shadow-xs'
                          : 'text-[#595959] hover:text-[#141414]'
                      }`}
                    >
                      여성
                    </button>
                    <button
                      type="button"
                      aria-pressed={gender === 'male'}
                      onClick={() => setGender('male')}
                      className={`text-sm rounded transition-colors cursor-pointer whitespace-nowrap ${
                        gender === 'male'
                          ? 'bg-white text-[#141414] font-medium shadow-xs'
                          : 'text-[#595959] hover:text-[#141414]'
                      }`}
                    >
                      남성
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Type + Date Inputs */}
              <div className="mt-6 pt-6 border-t border-[#F0F0F0]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-medium text-[#525252]">생년월일</span>
                  <div className="inline-flex items-center gap-1 p-1 bg-[#F5F5F5] rounded-md">
                    <button
                      type="button"
                      aria-pressed={calendarType === 'solar'}
                      onClick={() => {
                        setCalendarType('solar');
                        setIsLeapMonth(false);
                      }}
                      className={`min-h-[36px] px-3.5 py-1.5 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                        calendarType === 'solar'
                          ? 'bg-white text-[#141414] font-medium shadow-xs'
                          : 'text-[#595959] hover:text-[#141414]'
                      }`}
                    >
                      양력
                    </button>
                    <button
                      type="button"
                      aria-pressed={calendarType === 'lunar'}
                      onClick={() => setCalendarType('lunar')}
                      className={`min-h-[36px] px-3.5 py-1.5 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                        calendarType === 'lunar'
                          ? 'bg-white text-[#141414] font-medium shadow-xs'
                          : 'text-[#595959] hover:text-[#141414]'
                      }`}
                    >
                      음력
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label htmlFor="saju-year" className="sr-only">
                      출생 연도
                    </label>
                    <div className="relative">
                      <input
                        id="saju-year"
                        type="number"
                        inputMode="numeric"
                        min={1900}
                        max={2050}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full h-11 pl-3 pr-7 sm:pl-3.5 sm:pr-8 text-base sm:text-sm tabular-nums text-[#141414] bg-white border border-[#D4D4D4] rounded-md focus:outline-none focus:border-[#141414] transition-colors"
                      />
                      <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">
                        년
                      </span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="saju-month" className="sr-only">
                      출생 월
                    </label>
                    <div className="relative">
                      <input
                        id="saju-month"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={12}
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full h-11 pl-3 pr-7 sm:pl-3.5 sm:pr-8 text-base sm:text-sm tabular-nums text-[#141414] bg-white border border-[#D4D4D4] rounded-md focus:outline-none focus:border-[#141414] transition-colors"
                      />
                      <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">
                        월
                      </span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="saju-day" className="sr-only">
                      출생 일
                    </label>
                    <div className="relative">
                      <input
                        id="saju-day"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={31}
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="w-full h-11 pl-3 pr-7 sm:pl-3.5 sm:pr-8 text-base sm:text-sm tabular-nums text-[#141414] bg-white border border-[#D4D4D4] rounded-md focus:outline-none focus:border-[#141414] transition-colors"
                      />
                      <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">
                        일
                      </span>
                    </div>
                  </div>
                </div>

                {calendarType === 'lunar' && (
                  <div className="mt-3 flex items-center justify-between text-xs text-[#595959]">
                    {canBeLeapMonth ? (
                      <label className="min-h-[44px] inline-flex items-center gap-2.5 cursor-pointer text-[#141414]">
                        <input
                          type="checkbox"
                          checked={isLeapMonth}
                          onChange={(e) => setIsLeapMonth(e.target.checked)}
                          className="w-4 h-4 accent-[#141414] rounded"
                        />
                        <span>
                          {numericYear}년 윤{leapMonthForYear}월(윤달) 출생
                        </span>
                      </label>
                    ) : (
                      <span>
                        {leapMonthForYear > 0
                          ? `${numericYear}년 음력 윤달은 윤${leapMonthForYear}월입니다.`
                          : `${isNaN(numericYear) ? '' : `${numericYear}년은 `}음력 윤달이 없는 해입니다.`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Birth Time Inputs */}
              <div className="mt-6 pt-6 border-t border-[#F0F0F0]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-[#525252]">태어난 시각 (24시간제)</span>
                  <label className="min-h-[44px] inline-flex items-center gap-2 text-xs text-[#525252] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unknownTime}
                      onChange={(e) => setUnknownTime(e.target.checked)}
                      className="w-4 h-4 accent-[#141414] rounded"
                    />
                    <span>태어난 시간 모름</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label htmlFor="saju-hour" className="sr-only">
                      출생 시
                    </label>
                    <input
                      id="saju-hour"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={23}
                      disabled={unknownTime}
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      className="w-full h-11 pl-3.5 pr-8 text-base sm:text-sm tabular-nums text-[#141414] bg-white border border-[#D4D4D4] rounded-md disabled:bg-[#F7F7F7] disabled:text-[#767676] focus:outline-none focus:border-[#141414] transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">
                      시
                    </span>
                  </div>
                  <div className="relative">
                    <label htmlFor="saju-minute" className="sr-only">
                      출생 분
                    </label>
                    <input
                      id="saju-minute"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={59}
                      disabled={unknownTime}
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      className="w-full h-11 pl-3.5 pr-8 text-base sm:text-sm tabular-nums text-[#141414] bg-white border border-[#D4D4D4] rounded-md disabled:bg-[#F7F7F7] disabled:text-[#767676] focus:outline-none focus:border-[#141414] transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">
                      분
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#595959]">
                  <span className="tabular-nums py-1">{shichenPreview}</span>
                  <label
                    className={`min-h-[44px] inline-flex items-center gap-2 ${
                      unknownTime ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer text-[#525252]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={unknownTime}
                      checked={useTrueSolarTime}
                      onChange={(e) => setUseTrueSolarTime(e.target.checked)}
                      className="w-4 h-4 accent-[#141414] rounded"
                    />
                    <span>서울 진태양시 보정 (−30분)</span>
                  </label>
                </div>
              </div>

              {(errorMessage || serverError) && (
                <div
                  role="alert"
                  className="mt-5 px-4 py-3 text-xs text-[#9A3412] bg-[#FDF5F2] border border-[#E9CEC3] rounded-md"
                >
                  오류 안내 · {errorMessage || serverError}
                </div>
              )}

              <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingLedger || isSubmitting}
                    onClick={handleSaveToLedgerClick}
                    className="min-h-[44px] sm:min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {savedNotice ? (
                      <Check className="w-3.5 h-3.5 text-[#14532D]" />
                    ) : (
                      <BookMarked className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingLedger ? '명부에 적는 중…' : '명부에 올리기'}</span>
                  </button>
                  {ledgerEntries.length > 0 && (
                    <a
                      href="#ledger"
                      className="min-h-[44px] sm:min-h-[40px] inline-flex items-center justify-center px-3.5 py-2 text-xs font-medium text-[#525252] bg-[#FAFAFA] border border-[#E5E5E5] rounded-md hover:text-[#141414] hover:border-[#141414] transition-colors whitespace-nowrap tabular-nums"
                    >
                      보관 명부 ({ledgerEntries.length})
                    </a>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>
                    {isSubmitting ? '명식과 별자리 읽는 중…' : '2026·2027 리포트 보기'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span aria-live="polite" className="text-[#6E6E6E]">
                  {savedNotice ? (
                    <span className="text-[#141414] font-medium">{savedNotice}</span>
                  ) : (
                    '새로고침하면 입력창은 비워지고, 명부에 올린 인연만 아래 보관 명부에 남습니다.'
                  )}
                </span>
              </div>
            </form>
          </div>

          {/* Right Column: Seoldam Character Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-[#E5E5E5] bg-white p-6 sm:p-8">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-[360px] aspect-[3/4] overflow-hidden bg-white flex items-center justify-center">
                <SeoldamImage
                  src={SEOLDAM_ASSETS.heroPortrait}
                  alt="검은 갓과 도포를 쓰고 명리 서적 앞에 앉아 있는 저승차사 고양이 재(災) 일러스트"
                  className="w-full h-full object-contain"
                  fallbackTitle="저승차사 재(災)"
                />
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#E5E5E5]">
              <p className="font-editorial text-[15px] leading-relaxed text-[#262626]">
                “뜨거웠던 2026 병오년의 잔불과 액운은 제가 조용히 태워 보내드리겠습니다.
                생년월일을 적어 주시면 다가오는 2027 정미년의 흐름을 사주와 별자리로
                나란히 펼쳐 차분히 안내해 드리겠습니다.”
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[#737373]">
                <span className="font-editorial italic">Fig. 01 — 저승차사 재(災)</span>
                <span>액운을 태우는 차사</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saved Roster Ledger Section — 차사 재(災)의 명부 */}
      <section
        id="ledger"
        aria-labelledby="ledger-heading"
        className="border-t border-[#E5E5E5] bg-white scroll-mt-16"
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <p className="text-xs text-[#6E6E6E] mb-1.5 tabular-nums">
                인연 보관 기록부 · 현재 브라우저 저장 · {ledgerEntries.length}명 기록됨
              </p>
              <h2
                id="ledger-heading"
                className="font-editorial text-2xl font-bold text-[#141414]"
              >
                차사 재(災)의 명부(名簿)
              </h2>
              <p className="mt-1.5 text-sm text-[#595959] leading-relaxed">
                액운을 대신 태워 주고 싶은 나와 인연들의 명식을 조용히 적어 두는 보관 명부입니다.
              </p>
            </div>

            {ledgerEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {ledgerEntries.length >= 2 && (
                  <button
                    type="button"
                    onClick={onOpenLedgerInRelation}
                    className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#141414] rounded-md hover:bg-[#141414] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>명부 인원으로 관계도 보기</span>
                  </button>
                )}
                <ResetStorageButton
                  onConfirmReset={onClearLedger}
                  label="명부 비우기"
                  confirmPrompt="명부를 비울까요?"
                />
              </div>
            )}
          </div>

          {ledgerEntries.length === 0 ? (
            <div className="border border-dashed border-[#D4D4D4] bg-[#FAFAFA] px-6 py-10 text-center">
              <BookMarked className="w-5 h-5 text-[#6E6E6E] mx-auto mb-3" />
              <p className="font-editorial text-base font-bold text-[#141414]">
                아직 명부에 기록된 인연이 없습니다
              </p>
              <p className="mt-1.5 text-xs text-[#595959] leading-relaxed max-w-md mx-auto">
                위 입력창에서 ‘명부에 올리기’를 누르거나 리포트·관계도 화면에서 기록해 두시면,
                새로고침 후에도 언제든 이 명부에서 바로 꺼내 보실 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ledgerEntries.map((entry) => {
                const elMeta = ELEMENT_META[entry.dayElement];
                return (
                  <div
                    key={entry.id}
                    className="border border-[#E5E5E5] bg-white p-5 flex flex-col justify-between gap-4 hover:border-[#BDBDBD] transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0F0F0]">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-editorial text-base font-bold text-[#141414] truncate">
                              {entry.name}
                            </h3>
                            <span
                              className="text-xs font-medium whitespace-nowrap"
                              style={{ color: elMeta.color }}
                            >
                              {entry.dayPillarCode}({entry.dayPillarHanja})
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] tracking-wide text-[#6E6E6E]">
                            {entry.shorthand}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveLedgerEntry(entry.id)}
                          aria-label={`${entry.name} 명부에서 지우기`}
                          className="min-h-[40px] min-w-[40px] -mr-2 -mt-2 inline-flex items-center justify-center text-[#6E6E6E] hover:text-[#9A3412] transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="mt-3 text-xs text-[#595959] tabular-nums leading-relaxed">
                        {entry.caption}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F5F5F5]">
                      <button
                        type="button"
                        onClick={() => onOpenLedgerEntry(entry)}
                        className="flex-1 min-h-[40px] sm:min-h-[34px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>{entry.kind === 'birth' ? '리포트 열기' : '관계도에서 보기'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {entry.kind === 'birth' && entry.birthInput && (
                        <button
                          type="button"
                          onClick={() => onFillFormFromLedger(entry)}
                          className="min-h-[40px] sm:min-h-[34px] px-3 py-1.5 text-xs font-medium text-[#525252] bg-[#FAFAFA] border border-[#E5E5E5] rounded-md hover:text-[#141414] hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          입력창 채우기
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Presets Strip */}
      <section id="presets" className="border-t border-[#E5E5E5] bg-[#FAFAFA] scroll-mt-16">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs text-[#666666] mb-1.5">리포트 미리 보기</p>
              <h2 className="font-editorial text-2xl font-bold text-[#141414]">
                예시 명식으로 구성 살펴보기
              </h2>
            </div>
            <p className="text-xs text-[#666666]">
              클릭하면 해당 명식의 만세력 원국표와 5대 영역 리포트가 즉시 열립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRESET_PROFILES.map((preset, index) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className="group text-left bg-white border border-[#E5E5E5] p-5 hover:border-[#141414] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-[#6E6E6E] tabular-nums mb-3">
                  <span>예시 0{index + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6E6E6E] group-hover:text-[#141414] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h3 className="font-editorial text-base font-bold text-[#141414]">
                  {preset.label}
                </h3>
                <p className="mt-2 text-xs text-[#595959] tabular-nums leading-relaxed">
                  {preset.caption}
                </p>
              </button>
            ))}
          </div>

          {/* Saju-Only Friend Relationship Studio Strip */}
          <div className="mt-8 pt-8 border-t border-[#E5E5E5] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs text-[#666666] mb-1">
                순수 명리 궁합 · 한글 8글자 직접 입력
              </p>
              <h3 className="font-editorial text-xl font-bold text-[#141414]">
                친구 만세력 사주 관계도 바로 보기
              </h3>
              <p className="mt-1.5 text-sm text-[#525252] leading-relaxed">
                한자 없이 <span className="font-medium text-[#141414]">‘김봄 계병무경사술자술’</span>처럼
                여러 명의 천간·지지 여덟 글자를 이어 적으면 1:1 십신 역할, 합·충·원진, 모임 오행과 삼합까지 한눈에 비교합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRelation}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium text-[#141414] bg-white border border-[#141414] rounded-md hover:bg-[#141414] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>친구 사주 관계도 열기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Standards & Seoldam Editorial Footer Info */}
      <section
        id="standards"
        className="border-t border-[#E5E5E5] bg-white scroll-mt-16"
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <p className="text-xs text-[#595959] mb-2">만세력 산출 원칙</p>
            <h2 className="font-editorial text-2xl font-bold text-[#141414] mb-6">
              정확한 천문 절기와 투명한 명리학 규칙
            </h2>

            <dl className="divide-y divide-[#EBEBEB] border-t border-b border-[#EBEBEB]">
              <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <dt className="sm:col-span-4 text-xs font-medium text-[#141414]">
                  24절기 태양 황경 계산
                </dt>
                <dd className="sm:col-span-8 text-sm text-[#525252] leading-relaxed">
                  입춘(황경 315°)을 기준으로 연주를 가르고, 12절입 시각을 천문 공식으로 계산해 월주를 정확히 세웁니다.
                </dd>
              </div>
              <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <dt className="sm:col-span-4 text-xs font-medium text-[#141414]">
                  음력 · 윤달 및 진태양시
                </dt>
                <dd className="sm:col-span-8 text-sm text-[#525252] leading-relaxed">
                  1900~2050년 음양력 변환과 윤달 검증을 내장했으며, 한국 표준시와 서울 경도 차이를 반영한 −30분 진태양시 보정을 지원합니다.
                </dd>
              </div>
              <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2">
                <dt className="sm:col-span-4 text-xs font-medium text-[#141414]">
                  인도 베딕 점성술(조티쉬) 계산
                </dt>
                <dd className="sm:col-span-8 text-sm text-[#525252] leading-relaxed">
                  라히리 아야남사 항성황도 기준으로 9 그라하(라후·케투 포함), 라그나(상승궁), 27 나크샤트라와 빔쇼타리 다샤 대운을 산출해 사주와 교차 분석합니다.
                </dd>
              </div>
            </dl>
          </div>

          <div id="seoldam-intro" className="lg:col-span-5 lg:border-l lg:border-[#E5E5E5] lg:pl-12 flex flex-col justify-between scroll-mt-20">
            <div>
              <p className="text-xs text-[#595959] mb-2">화자 소개</p>
              <h2 className="font-editorial text-2xl font-bold text-[#141414] mb-4">
                저승차사 재(災)
              </h2>
              <p className="text-sm leading-[1.85] text-[#525252]">
                재(災)는 사람들의 재앙(災)과 액운을 대신 불태워 주고 타고 남은 ‘재’가 된
                잿빛 고양이 저승차사입니다. 본문에서는 객관적인 명리·점성학 근거를 단정하게
                서술하고, 오른편 ‘여백 노트’에서는 차분하고 정중한 어조로 지나온 해의 결산과
                다가올 흐름의 핵심만 고요히 짚어 드립니다.
              </p>
            </div>
            <p className="mt-8 text-xs text-[#6E6E6E]">
              차사 재(災) 명리 · 입력하신 생년월일은 일회성 풀이 산출에만 쓰이고 서버에 저장되지 않으며, 명부 기록은 현재 기기 브라우저에만 보관됩니다.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#EBEBEB] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-6 text-xs text-[#6E6E6E]">
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
        </div>
      </footer>
    </main>
  );
}
