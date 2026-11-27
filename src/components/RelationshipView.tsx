import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookMarked,
  Check,
  Coffee,
  Copy,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { ELEMENT_META } from '../engine/manseryeok';
import {
  PillarOrderMode,
  RelationMember,
  SAMPLE_RELATION_BATCH_TEXT,
  analyzeGroupChemistry,
  createMemberFromBirthInput,
  createMemberFromCode,
  createMemberFromSajuChart,
  createSampleRelationMembers,
  getPairKey,
  parseBatchMembersText,
  parseManseryeokCode,
} from '../engine/sajuRelationship';
import { CalendarType, SajuChart } from '../engine/sajuTypes';
import { LedgerEntry, isEntryInLedger } from '../utils/storage';
import { RelationshipGraphSvg } from './RelationshipGraphSvg';
import { ResetStorageButton } from './ResetStorageButton';
import { SeoldamImage } from './SeoldamImage';

interface RelationshipViewProps {
  myChart: SajuChart | null;
  members: RelationMember[];
  ledgerEntries: LedgerEntry[];
  onChangeMembers: (next: RelationMember[]) => void;
  onSaveMemberToLedger: (member: RelationMember) => void;
  onClearLedger: () => void;
  onBackToPersonal: () => void;
  onOpenBokchae: () => void;
}

type InputTab = 'single' | 'batch' | 'birth';

const MAX_MEMBERS = 8;

export function RelationshipView({
  myChart,
  members,
  ledgerEntries,
  onChangeMembers,
  onSaveMemberToLedger,
  onClearLedger,
  onBackToPersonal,
  onOpenBokchae,
}: RelationshipViewProps) {
  const [inputTab, setInputTab] = useState<InputTab>('single');
  const [orderMode, setOrderMode] = useState<PillarOrderMode>('hour-first');

  // Single shorthand input state
  const [singleName, setSingleName] = useState('');
  const [singleCode, setSingleCode] = useState('');
  const [singleError, setSingleError] = useState<string | null>(null);

  // Batch textarea state
  const [batchText, setBatchText] = useState(SAMPLE_RELATION_BATCH_TEXT);
  const [batchErrors, setBatchErrors] = useState<string[]>([]);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // Birth date friend input state
  const [birthName, setBirthName] = useState('');
  const [birthCalendar, setBirthCalendar] = useState<CalendarType>('solar');
  const [birthYear, setBirthYear] = useState('1995');
  const [birthMonth, setBirthMonth] = useState('8');
  const [birthDay, setBirthDay] = useState('15');
  const [birthHour, setBirthHour] = useState('14');
  const [birthMinute, setBirthMinute] = useState('00');
  const [birthUnknownTime, setBirthUnknownTime] = useState(false);
  const [birthError, setBirthError] = useState<string | null>(null);

  // Selected pair state
  const [selectedPairKey, setSelectedPairKey] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Live preview for single shorthand input
  const livePreview = useMemo(() => {
    if (!singleCode.trim()) return null;
    return parseManseryeokCode(singleCode, orderMode);
  }, [singleCode, orderMode]);

  // Group chemistry calculation
  const groupReport = useMemo(() => analyzeGroupChemistry(members), [members]);

  // Resolve active pair cleanly
  const activePair = useMemo(() => {
    if (groupReport.pairs.length === 0) return null;
    if (selectedPairKey && groupReport.pairMap[selectedPairKey]) {
      return groupReport.pairMap[selectedPairKey];
    }
    return groupReport.pairs[0];
  }, [groupReport, selectedPairKey]);

  const myChartAlreadyIncluded = useMemo(() => {
    if (!myChart) return false;
    return members.some((m) => m.id === 'my-report-self');
  }, [myChart, members]);

  const isShowingSampleOnly = useMemo(
    () => members.length > 0 && members.every((m) => m.isSample),
    [members]
  );

  const handleAddMyChart = () => {
    if (!myChart || myChartAlreadyIncluded) return;
    const base = isShowingSampleOnly ? [] : members;
    if (base.length >= MAX_MEMBERS) {
      setSingleError(`최대 ${MAX_MEMBERS}명까지 함께 분석할 수 있습니다.`);
      return;
    }
    const selfMember = createMemberFromSajuChart(myChart);
    const next = [selfMember, ...base];
    onChangeMembers(next);
    setSelectedPairKey(next.length >= 2 ? getPairKey(next[0].id, next[1].id) : null);
  };

  const handleAddSingle = (e: FormEvent) => {
    e.preventDefault();
    setSingleError(null);

    const base = isShowingSampleOnly ? [] : members;
    if (base.length >= MAX_MEMBERS) {
      setSingleError(`한눈에 비교할 수 있도록 최대 ${MAX_MEMBERS}명까지 등록할 수 있습니다.`);
      return;
    }

    const fallbackLabel = String.fromCharCode(65 + (base.length % 26));
    const displayName = singleName.trim() || `친구 ${fallbackLabel}`;
    const result = createMemberFromCode(
      `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      displayName,
      singleCode,
      orderMode
    );

    if (!result.ok) {
      setSingleError(result.error);
      return;
    }

    const next = [...base, result.member];
    onChangeMembers(next);
    if (next.length >= 2) {
      setSelectedPairKey(getPairKey(next[0].id, result.member.id));
    } else {
      setSelectedPairKey(null);
    }
    setSingleName('');
    setSingleCode('');
  };

  const handleApplyBatch = (mode: 'replace' | 'append') => {
    setBatchErrors([]);
    setBatchNotice(null);

    const { members: parsed, errors } = parseBatchMembersText(batchText, orderMode);
    if (errors.length > 0) {
      setBatchErrors(errors);
      if (parsed.length === 0) return;
    }

    if (parsed.length === 0) {
      setBatchErrors(['해석할 만세력 줄을 입력해 주세요. 예: 김봄 계병무경사술자술']);
      return;
    }

    const base = mode === 'replace' || isShowingSampleOnly ? [] : members;
    const combined = [...base, ...parsed];
    const trimmed = combined.slice(0, MAX_MEMBERS);
    onChangeMembers(trimmed);
    setSelectedPairKey(
      trimmed.length >= 2 ? getPairKey(trimmed[0].id, trimmed[1].id) : null
    );
    setBatchNotice(
      combined.length > MAX_MEMBERS
        ? `${MAX_MEMBERS}명까지 반영되었습니다. (최대 ${MAX_MEMBERS}명)`
        : `${parsed.length}명의 만세력을 ${base.length === 0 ? '새로 반영했습니다' : '목록에 추가했습니다'}.`
    );
  };

  const handleAddFromBirth = (e: FormEvent) => {
    e.preventDefault();
    setBirthError(null);

    const base = isShowingSampleOnly ? [] : members;
    if (base.length >= MAX_MEMBERS) {
      setBirthError(`최대 ${MAX_MEMBERS}명까지 등록할 수 있습니다.`);
      return;
    }

    const y = parseInt(birthYear, 10);
    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);
    const h = birthUnknownTime ? 12 : parseInt(birthHour, 10);
    const min = birthUnknownTime ? 0 : parseInt(birthMinute, 10);

    if (isNaN(y) || y < 1900 || y > 2050 || isNaN(m) || m < 1 || m > 12 || isNaN(d) || d < 1 || d > 31) {
      setBirthError('출생 연도(1900~2050), 월, 일을 정확히 입력해 주세요.');
      return;
    }

    const fallbackLabel = String.fromCharCode(65 + (base.length % 26));
    const res = createMemberFromBirthInput(`b-${Date.now()}`, {
      name: birthName.trim() || `친구 ${fallbackLabel}`,
      gender: 'female',
      calendarType: birthCalendar,
      year: y,
      month: m,
      day: d,
      isLeapMonth: false,
      hour: isNaN(h) ? 12 : h,
      minute: isNaN(min) ? 0 : min,
      unknownTime: birthUnknownTime,
      useTrueSolarTime: true,
    });

    if (!res.ok) {
      setBirthError(res.error);
      return;
    }

    const next = [...base, res.member];
    onChangeMembers(next);
    if (next.length >= 2) {
      setSelectedPairKey(getPairKey(next[0].id, res.member.id));
    } else {
      setSelectedPairKey(null);
    }
    setBirthName('');
  };

  const handleRemoveMember = (id: string) => {
    const next = members.filter((m) => m.id !== id);
    onChangeMembers(next);
    if (selectedPairKey && selectedPairKey.split('__').includes(id)) {
      setSelectedPairKey(null);
    }
  };

  const handleLoadSample = () => {
    const sample = createSampleRelationMembers();
    onChangeMembers(sample);
    setBatchText(SAMPLE_RELATION_BATCH_TEXT);
    setBatchErrors([]);
    setBatchNotice(null);
    setSelectedPairKey(sample.length >= 2 ? getPairKey(sample[0].id, sample[1].id) : null);
  };

  const handleAddFromLedgerEntry = (entry: LedgerEntry) => {
    setSingleError(null);
    const base = isShowingSampleOnly ? [] : members;
    const already = base.some(
      (m) => m.name === entry.name && m.shorthand === entry.shorthand
    );
    if (already) return;
    if (base.length >= MAX_MEMBERS) {
      setSingleError(`최대 ${MAX_MEMBERS}명까지 함께 분석할 수 있습니다.`);
      return;
    }

    const built =
      entry.kind === 'birth' && entry.birthInput
        ? createMemberFromBirthInput(`ledger-${entry.id}`, entry.birthInput)
        : createMemberFromCode(`ledger-${entry.id}`, entry.name, entry.shorthand, 'hour-first');

    if (!built.ok) return;
    const next = [...base, built.member];
    onChangeMembers(next);
    setSelectedPairKey(
      next.length >= 2 ? getPairKey(next[0].id, built.member.id) : null
    );
  };

  const handleLoadAllFromLedger = () => {
    setSingleError(null);
    const loaded: RelationMember[] = [];
    for (const entry of ledgerEntries.slice(0, MAX_MEMBERS)) {
      const built =
        entry.kind === 'birth' && entry.birthInput
          ? createMemberFromBirthInput(`ledger-${entry.id}`, entry.birthInput)
          : createMemberFromCode(`ledger-${entry.id}`, entry.name, entry.shorthand, 'hour-first');
      if (built.ok) loaded.push(built.member);
    }
    onChangeMembers(loaded);
    setSelectedPairKey(
      loaded.length >= 2 ? getPairKey(loaded[0].id, loaded[1].id) : null
    );
  };

  const handleClearAll = () => {
    onChangeMembers([]);
    setSelectedPairKey(null);
  };

  const handleCopyRelationSummary = async () => {
    const lines = [
      `[저승차사 재(災) 사주 관계도 리포트 · ${members.length}인 명리 분석]`,
      ...members.map((m) => `- ${m.name}: ${m.shorthand} (${m.dayPillarCode}일주 · 용신 ${ELEMENT_META[m.yongsinPrimary].hangul})`),
      '',
      ...groupReport.pairs.map(
        (p) =>
          `· ${p.a.name} × ${p.b.name}: ${p.score}점 (${p.relationTier} / ${p.aToB.tenGod}·${p.bToA.tenGod})`
      ),
    ];
    if (groupReport.groupSamhaps.length > 0) {
      lines.push(
        '',
        `다자 합국: ${groupReport.groupSamhaps
          .map(
            (s) =>
              `${s.name} (${s.contributors.map((c) => `${c.memberName}:${c.branchHangul}`).join('+')})`
          )
          .join(', ')}`
      );
    }
    lines.push('', `저승차사 재(災)의 한마디: "${groupReport.seoldamGroupSummary}"`);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2200);
    } catch {
      setCopiedSummary(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-10 pb-24 lg:pt-14">
        {/* Header */}
        <header className="pb-10 border-b border-[#E5E5E5]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#666666] mb-4">
            <span>순수 명리 궁합</span>
            <span aria-hidden="true">·</span>
            <span>한글 8글자 직접 입력</span>
            <span aria-hidden="true">·</span>
            <span>2~{MAX_MEMBERS}인 다자 관계도</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold leading-[1.24] text-[#141414] text-balance">
                친구 만세력 사주 관계도
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#525252]">
                한자를 외우지 않아도 <span className="font-medium text-[#141414]">‘계병무경사술자술’</span>처럼
                천간·지지 여덟 글자만 이어서 적으면 60갑자를 자동 판별해 1:1 십신 역할, 일지 합·충·원진,
                천을귀인, 모임 전체 오행과 삼합까지 한눈에 풀어냅니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {members.length >= 2 && (
                <button
                  type="button"
                  onClick={handleCopyRelationSummary}
                  aria-live="polite"
                  className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? '관계 요약 복사됨' : '관계 요약 복사'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleLoadSample}
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>예시 4인 불러오기</span>
              </button>
              <button
                type="button"
                onClick={onBackToPersonal}
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#525252] bg-[#FAFAFA] border border-[#E5E5E5] rounded-md hover:text-[#141414] hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{myChart ? '내 리포트로' : '개인 사주 풀이'}</span>
              </button>
              {ledgerEntries.length > 0 && (
                <ResetStorageButton
                  onConfirmReset={onClearLedger}
                  label="명부 비우기"
                  confirmPrompt="명부를 비울까요?"
                />
              )}
            </div>
          </div>
        </header>

        {/* Section 00: Input Studio & Member Roster */}
        <section id="rel-members" className="py-12 border-b border-[#E5E5E5] scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Manseryeok Entry Studio */}
            <div className="lg:col-span-5 border border-[#E5E5E5] bg-white p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs text-[#666666] mb-0.5">00. 명식 등록</p>
                  <h2 className="font-editorial text-lg font-bold text-[#141414]">
                    만세력 직접 입력
                  </h2>
                </div>
                {myChart && !myChartAlreadyIncluded && (
                  <button
                    type="button"
                    onClick={handleAddMyChart}
                    className="min-h-[40px] inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#141414] bg-[#FAFAFA] border border-[#D4D4D4] rounded hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" />
                    <span>내 명식 넣기</span>
                  </button>
                )}
              </div>

              {/* Quick Pick from Saved 명부 */}
              {ledgerEntries.length > 0 && (
                <div className="mb-5 pb-4 border-b border-[#F0F0F0]">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-medium text-[#525252] inline-flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5 text-[#141414]" />
                      <span>재(災)의 명부에서 꺼내오기</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadAllFromLedger}
                      className="text-[11px] font-medium text-[#141414] underline underline-offset-4 hover:opacity-70 cursor-pointer whitespace-nowrap"
                    >
                      전체 불러오기
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ledgerEntries.map((entry) => {
                      const inCurrent =
                        !isShowingSampleOnly &&
                        members.some(
                          (m) => m.name === entry.name && m.shorthand === entry.shorthand
                        );
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          disabled={inCurrent}
                          onClick={() => handleAddFromLedgerEntry(entry)}
                          className={`min-h-[36px] px-2.5 py-1 text-xs rounded border transition-colors inline-flex items-center gap-1 ${
                            inCurrent
                              ? 'bg-[#F2F7F4] border-[#C7DCD0] text-[#14532D] cursor-default'
                              : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#141414] hover:border-[#141414] cursor-pointer'
                          }`}
                        >
                          {inCurrent ? (
                            <Check className="w-3 h-3 shrink-0" />
                          ) : (
                            <Plus className="w-3 h-3 shrink-0" />
                          )}
                          <span>{entry.name}</span>
                          <span className="text-[11px] text-[#6E6E6E]">
                            {entry.dayPillarCode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Input Mode Segmented Tabs */}
              <div
                role="tablist"
                aria-label="명식 입력 방식"
                className="grid grid-cols-3 gap-1 p-1 bg-[#F5F5F5] rounded-md mb-5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={inputTab === 'single'}
                  onClick={() => setInputTab('single')}
                  className={`min-h-[40px] py-2 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                    inputTab === 'single'
                      ? 'bg-white text-[#141414] font-medium shadow-xs'
                      : 'text-[#595959] hover:text-[#141414]'
                  }`}
                >
                  한 명씩 입력
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={inputTab === 'batch'}
                  onClick={() => setInputTab('batch')}
                  className={`min-h-[40px] py-2 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                    inputTab === 'batch'
                      ? 'bg-white text-[#141414] font-medium shadow-xs'
                      : 'text-[#595959] hover:text-[#141414]'
                  }`}
                >
                  여러 명 일괄
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={inputTab === 'birth'}
                  onClick={() => setInputTab('birth')}
                  className={`min-h-[40px] py-2 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                    inputTab === 'birth'
                      ? 'bg-white text-[#141414] font-medium shadow-xs'
                      : 'text-[#595959] hover:text-[#141414]'
                  }`}
                >
                  생년월일 추가
                </button>
              </div>

              {/* Pillar Order Toggle (only for shorthand / batch tabs) */}
              {inputTab !== 'birth' && (
                <div className="mb-5 pb-4 border-b border-[#F0F0F0] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#595959]">글자 순서 기준</span>
                  <div className="inline-flex items-center gap-1 p-1 bg-[#F5F5F5] rounded">
                    <button
                      type="button"
                      aria-pressed={orderMode === 'hour-first'}
                      onClick={() => setOrderMode('hour-first')}
                      className={`min-h-[36px] px-2.5 py-1.5 text-[11px] rounded transition-colors cursor-pointer whitespace-nowrap ${
                        orderMode === 'hour-first'
                          ? 'bg-white text-[#141414] font-medium shadow-xs'
                          : 'text-[#595959] hover:text-[#141414]'
                      }`}
                    >
                      시·일·월·년 (표준)
                    </button>
                    <button
                      type="button"
                      aria-pressed={orderMode === 'year-first'}
                      onClick={() => setOrderMode('year-first')}
                      className={`min-h-[36px] px-2.5 py-1.5 text-[11px] rounded transition-colors cursor-pointer whitespace-nowrap ${
                        orderMode === 'year-first'
                          ? 'bg-white text-[#141414] font-medium shadow-xs'
                          : 'text-[#595959] hover:text-[#141414]'
                      }`}
                    >
                      년·월·일·시
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 1: Single Shorthand Input */}
              {inputTab === 'single' && (
                <form onSubmit={handleAddSingle} className="space-y-4">
                  <div>
                    <label htmlFor="rel-name" className="block text-xs font-medium text-[#525252] mb-1.5">
                      이름 또는 별명
                    </label>
                    <input
                      id="rel-name"
                      type="text"
                      maxLength={14}
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      placeholder="예: 김봄, 이여름"
                      className="w-full h-11 sm:h-10 px-3 text-base sm:text-sm text-[#141414] bg-white border border-[#D4D4D4] rounded-md placeholder:text-[#767676] focus:outline-none focus:border-[#141414]"
                    />
                  </div>

                  <div>
                    <label htmlFor="rel-code" className="block text-xs font-medium text-[#525252] mb-1.5">
                      만세력 8글자 (천간 4자 + 지지 4자 이어쓰기)
                    </label>
                    <input
                      id="rel-code"
                      type="text"
                      value={singleCode}
                      onChange={(e) => {
                        setSingleCode(e.target.value);
                        setSingleError(null);
                      }}
                      placeholder={
                        orderMode === 'hour-first'
                          ? '예: 계병무경사술자술 (생시 모름: 병무경술자술)'
                          : '예: 경무병계술자술사 (생시 모름: 경무병술자술)'
                      }
                      className="w-full h-11 sm:h-10 px-3 text-base sm:text-sm tracking-wide text-[#141414] bg-white border border-[#D4D4D4] rounded-md placeholder:text-[#767676] placeholder:tracking-normal focus:outline-none focus:border-[#141414]"
                    />
                    <p className="mt-1.5 text-[11px] text-[#6E6E6E] leading-relaxed">
                      슬래시 없이 여덟 글자를 그대로 이어 적으세요. (생시 미상 6자, 슬래시 구분, 기둥 쌍 입력도 함께 지원합니다.)
                    </p>
                  </div>

                  {/* Live Parse Preview */}
                  {livePreview && (
                    <div
                      className={`p-3 text-xs border rounded-md ${
                        livePreview.ok
                          ? 'bg-[#FAFAFA] border-[#E5E5E5] text-[#262626]'
                          : 'bg-[#FDF5F2] border-[#E9CEC3] text-[#9A3412]'
                      }`}
                    >
                      {livePreview.ok ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[#666666]">인식된 원국</span>
                          <span className="font-medium text-[#141414]">
                            {(() => {
                              const chars = Array.from(livePreview.normalizedCode);
                              const half = chars.length / 2;
                              const stems = chars.slice(0, half);
                              const branches = chars.slice(half);
                              if (livePreview.raw.hour) {
                                return `${stems[0]}${branches[0]}(시) · ${stems[1]}${branches[1]}(일) · ${stems[2]}${branches[2]}(월) · ${stems[3]}${branches[3]}(년)`;
                              }
                              return `미상(시) · ${stems[0]}${branches[0]}(일) · ${stems[1]}${branches[1]}(월) · ${stems[2]}${branches[2]}(년)`;
                            })()}
                          </span>
                        </div>
                      ) : (
                        <span>확인 필요 · {livePreview.error}</span>
                      )}
                    </div>
                  )}

                  {singleError && (
                    <div role="alert" className="p-3 text-xs text-[#9A3412] bg-[#FDF5F2] border border-[#E9CEC3] rounded-md">
                      {singleError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>관계도에 추가하기</span>
                  </button>
                </form>
              )}

              {/* Tab 2: Batch Multi-line Paste */}
              {inputTab === 'batch' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="rel-batch" className="block text-xs font-medium text-[#525252] mb-1.5">
                      한 줄에 한 명씩 붙여넣기 (이름 천간지지 8자)
                    </label>
                    <textarea
                      id="rel-batch"
                      rows={5}
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                      placeholder={`김봄 계병무경사술자술\n이여름 신을계임사유묘신\n박가을 정무병기사오자묘\n최겨울 을정경정사축술해`}
                      className="w-full p-3 text-base sm:text-sm leading-6 text-[#141414] bg-white border border-[#D4D4D4] rounded-md placeholder:text-[#767676] focus:outline-none focus:border-[#141414]"
                    />
                    <p className="mt-1.5 text-[11px] text-[#6E6E6E]">
                      생시를 모르는 친구는 6글자(예: <span className="font-medium text-[#141414]">‘민수 병무경술자술’</span>)로 섞어 넣어도 됩니다.
                    </p>
                  </div>

                  {batchErrors.length > 0 && (
                    <div role="alert" className="p-3 text-xs text-[#9A3412] bg-[#FDF5F2] border border-[#E9CEC3] rounded-md space-y-1">
                      {batchErrors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}

                  {batchNotice && (
                    <div className="p-3 text-xs text-[#14532D] bg-[#F2F7F4] border border-[#C7DCD0] rounded-md">
                      {batchNotice}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleApplyBatch('replace')}
                      className="min-h-[44px] px-3 py-2.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      새 목록으로 분석
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBatch('append')}
                      className="min-h-[44px] px-3 py-2.5 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      현재 목록에 추가
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Birth Date Friend Addition */}
              {inputTab === 'birth' && (
                <form onSubmit={handleAddFromBirth} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="rel-b-name" className="block text-xs font-medium text-[#525252] mb-1.5">
                        친구 이름
                      </label>
                      <input
                        id="rel-b-name"
                        type="text"
                        maxLength={14}
                        value={birthName}
                        onChange={(e) => setBirthName(e.target.value)}
                        placeholder="예: 현우"
                        className="w-full h-11 sm:h-10 px-3 text-base sm:text-sm text-[#141414] bg-white border border-[#D4D4D4] rounded-md placeholder:text-[#767676] focus:outline-none focus:border-[#141414]"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-[#525252] mb-1.5">양력 · 음력</span>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5F5F5] rounded-md h-11 sm:h-10">
                        <button
                          type="button"
                          aria-pressed={birthCalendar === 'solar'}
                          onClick={() => setBirthCalendar('solar')}
                          className={`text-xs rounded cursor-pointer ${
                            birthCalendar === 'solar'
                              ? 'bg-white text-[#141414] font-medium shadow-xs'
                              : 'text-[#595959]'
                          }`}
                        >
                          양력
                        </button>
                        <button
                          type="button"
                          aria-pressed={birthCalendar === 'lunar'}
                          onClick={() => setBirthCalendar('lunar')}
                          className={`text-xs rounded cursor-pointer ${
                            birthCalendar === 'lunar'
                              ? 'bg-white text-[#141414] font-medium shadow-xs'
                              : 'text-[#595959]'
                          }`}
                        >
                          음력
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        aria-label="출생 연도"
                        min={1900}
                        max={2050}
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="w-full h-11 sm:h-10 pl-3 pr-7 text-base sm:text-sm tabular-nums border border-[#D4D4D4] rounded-md focus:outline-none focus:border-[#141414]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">년</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        aria-label="출생 월"
                        min={1}
                        max={12}
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className="w-full h-11 sm:h-10 pl-3 pr-7 text-base sm:text-sm tabular-nums border border-[#D4D4D4] rounded-md focus:outline-none focus:border-[#141414]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">월</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        aria-label="출생 일"
                        min={1}
                        max={31}
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className="w-full h-11 sm:h-10 pl-3 pr-7 text-base sm:text-sm tabular-nums border border-[#D4D4D4] rounded-md focus:outline-none focus:border-[#141414]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6E6E6E] pointer-events-none">일</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          aria-label="출생 시"
                          min={0}
                          max={23}
                          disabled={birthUnknownTime}
                          value={birthHour}
                          onChange={(e) => setBirthHour(e.target.value)}
                          className="w-full h-11 sm:h-10 pl-3 pr-7 text-base sm:text-xs tabular-nums border border-[#D4D4D4] rounded-md disabled:bg-[#F5F5F5] disabled:text-[#767676]"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#6E6E6E] pointer-events-none">시</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          aria-label="출생 분"
                          min={0}
                          max={59}
                          disabled={birthUnknownTime}
                          value={birthMinute}
                          onChange={(e) => setBirthMinute(e.target.value)}
                          className="w-full h-11 sm:h-10 pl-3 pr-7 text-base sm:text-xs tabular-nums border border-[#D4D4D4] rounded-md disabled:bg-[#F5F5F5] disabled:text-[#767676]"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#6E6E6E] pointer-events-none">분</span>
                      </div>
                    </div>
                    <label className="min-h-[44px] inline-flex items-center gap-2 text-xs text-[#525252] cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={birthUnknownTime}
                        onChange={(e) => setBirthUnknownTime(e.target.checked)}
                        className="w-4 h-4 accent-[#141414]"
                      />
                      <span>시간 모름</span>
                    </label>
                  </div>

                  {birthError && (
                    <div role="alert" className="p-3 text-xs text-[#9A3412] bg-[#FDF5F2] border border-[#E9CEC3] rounded-md">
                      {birthError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>만세력 변환 후 추가</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right: Registered Members Roster */}
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs text-[#666666] mb-0.5 tabular-nums">
                    등록된 명식 · {members.length} / {MAX_MEMBERS}명
                    {isShowingSampleOnly
                      ? ' · 예시 4인 표시 중 (직접 입력 시 자동 교체)'
                      : ''}
                  </p>
                  <h2 className="font-editorial text-xl font-bold text-[#141414]">
                    참여 인물 원국 요약
                  </h2>
                </div>
                {members.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="min-h-[40px] px-2 text-xs text-[#6E6E6E] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    전체 비우기
                  </button>
                )}
              </div>

              {members.length === 0 ? (
                <div className="border border-dashed border-[#D4D4D4] bg-[#FAFAFA] p-10 text-center">
                  <Users className="w-6 h-6 text-[#6E6E6E] mx-auto mb-3" />
                  <p className="font-editorial text-base font-bold text-[#141414]">
                    아직 등록된 명식이 없습니다
                  </p>
                  <p className="mt-1.5 text-xs text-[#595959] leading-relaxed">
                    왼편에서 <span className="font-medium text-[#141414]">‘계병무경사술자술’</span>처럼
                    여덟 글자를 입력하거나, 명부에서 꺼내오거나, 예시 4인을 불러와 보세요.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {ledgerEntries.length > 0 && (
                      <button
                        type="button"
                        onClick={handleLoadAllFromLedger}
                        className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors cursor-pointer"
                      >
                        <BookMarked className="w-3.5 h-3.5" />
                        <span>명부 인원 불러오기 ({ledgerEntries.length}명)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>예시 4인 불러오기</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {members.map((member) => {
                    const dmMeta = ELEMENT_META[member.dayMaster.element];
                    const yongMeta = ELEMENT_META[member.yongsinPrimary];
                    const inLedger = isEntryInLedger(ledgerEntries, member.name, member.shorthand);
                    const pillarCols = [
                      { label: '시주', pillar: member.pillars.hour },
                      { label: '일주', pillar: member.pillars.day },
                      { label: '월주', pillar: member.pillars.month },
                      { label: '연주', pillar: member.pillars.year },
                    ];

                    return (
                      <div
                        key={member.id}
                        className="border border-[#E5E5E5] bg-white p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0F0F0]">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-editorial text-base font-bold text-[#141414] truncate">
                                  {member.name}
                                </h3>
                                <span
                                  className="text-xs font-medium whitespace-nowrap"
                                  style={{ color: dmMeta.color }}
                                >
                                  {member.dayPillarCode}({member.pillars.day.ganjiHanja})
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] tracking-wide text-[#6E6E6E]">
                                {member.shorthand}
                              </p>
                            </div>
                            <div className="flex items-center shrink-0 -mr-2 -mt-2">
                              {!member.isSample && (
                                <button
                                  type="button"
                                  onClick={() => onSaveMemberToLedger(member)}
                                  aria-label={
                                    inLedger
                                      ? `${member.name} 명부에 보관 중`
                                      : `${member.name} 명부에 기록`
                                  }
                                  title={inLedger ? '명부에 보관 중' : '명부에 기록'}
                                  className={`min-h-[44px] min-w-[40px] inline-flex items-center justify-center transition-colors cursor-pointer ${
                                    inLedger
                                      ? 'text-[#14532D]'
                                      : 'text-[#6E6E6E] hover:text-[#141414]'
                                  }`}
                                >
                                  {inLedger ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <BookMarked className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.id)}
                                aria-label={`${member.name} 삭제`}
                                className="min-h-[44px] min-w-[40px] inline-flex items-center justify-center text-[#6E6E6E] hover:text-[#9A3412] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Compact 4-Pillar Strip */}
                          <div className="mt-3 grid grid-cols-4 border-t border-l border-[#EFEFEF] text-center">
                            {pillarCols.map(({ label, pillar }) => (
                              <div
                                key={label}
                                className="py-2 px-1 border-r border-b border-[#EFEFEF]"
                              >
                                <span className="block text-[10px] text-[#6E6E6E] mb-1">
                                  {label}
                                </span>
                                {pillar ? (
                                  <div className="space-y-0.5">
                                    <div
                                      className="text-sm font-bold leading-tight"
                                      style={{ color: ELEMENT_META[pillar.stem.element].color }}
                                    >
                                      {pillar.stem.hangul}
                                      <span className="text-[11px] font-normal ml-0.5 opacity-80">
                                        {pillar.stem.hanja}
                                      </span>
                                    </div>
                                    <div
                                      className="text-sm font-bold leading-tight"
                                      style={{ color: ELEMENT_META[pillar.branch.element].color }}
                                    >
                                      {pillar.branch.hangul}
                                      <span className="text-[11px] font-normal ml-0.5 opacity-80">
                                        {pillar.branch.hanja}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="block py-2 text-xs text-[#767676]">—</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#595959]">
                          <span>
                            {member.strengthGrade} · 용신{' '}
                            <strong className="font-medium text-[#141414]">
                              {yongMeta.hangul}({yongMeta.hanja})
                            </strong>
                          </span>
                          <span className="truncate max-w-[160px] text-[#6E6E6E]">
                            {member.dayPillarTitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Require at least 2 members for compatibility analysis */}
        {members.length < 2 ? (
          <section className="py-16 text-center">
            <p className="font-editorial text-xl font-bold text-[#141414]">
              두 사람 이상의 만세력이 모이면 관계도가 펼쳐집니다
            </p>
            <p className="mt-2 text-sm text-[#666666]">
              현재 {members.length}명 등록됨 · 친구를 한 명 더 추가하거나 상단의 ‘예시 4인 불러오기’를 눌러 보세요.
            </p>
          </section>
        ) : (
          <>
            {/* Section 01: Relationship Graph & Pairwise Matrix */}
            <section id="rel-graph" className="py-14 border-b border-[#E5E5E5] scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <p className="text-xs text-[#666666] mb-1.5">01. 사주 상관관계 연결망</p>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]">
                    관계도 및 1:1 궁합 매트릭스
                  </h2>
                </div>
                <p className="text-xs text-[#666666]">
                  연결선이나 표의 칸을 클릭하면 아래 1:1 상세 풀이가 즉시 전환됩니다.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left: Interactive SVG Graph */}
                <div className="lg:col-span-6 border border-[#E5E5E5] bg-white p-6">
                  <RelationshipGraphSvg
                    members={members}
                    pairs={groupReport.pairs}
                    selectedPairKey={activePair?.pairKey ?? null}
                    onSelectPair={setSelectedPairKey}
                  />
                </div>

                {/* Right: N×N Pairwise Matrix + Quick Pair List */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="overflow-x-auto border border-[#E5E5E5]">
                    <table className="w-full text-center border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                          <th className="p-3 text-left font-medium text-[#666666] border-r border-[#E5E5E5]">
                            관계 표
                          </th>
                          {members.map((col) => (
                            <th
                              key={col.id}
                              className="p-3 font-editorial font-bold text-[#141414] whitespace-nowrap"
                            >
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEFEF]">
                        {members.map((row) => (
                          <tr key={row.id}>
                            <th className="p-3 text-left font-editorial font-bold text-[#141414] bg-[#FAFAFA] border-r border-[#E5E5E5] whitespace-nowrap">
                              {row.name}
                            </th>
                            {members.map((col) => {
                              if (row.id === col.id) {
                                return (
                                  <td
                                    key={col.id}
                                    className="p-3 bg-[#FAFAFA] text-[#BDBDBD] tabular-nums"
                                  >
                                    —
                                  </td>
                                );
                              }
                              const pKey = getPairKey(row.id, col.id);
                              const pair = groupReport.pairMap[pKey];
                              const isSelected = activePair?.pairKey === pKey;
                              return (
                                <td key={col.id} className="p-1.5">
                                  <button
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => setSelectedPairKey(pKey)}
                                    className={`w-full min-h-[44px] py-2 px-1.5 rounded transition-colors cursor-pointer tabular-nums ${
                                      isSelected
                                        ? 'bg-[#141414] text-white'
                                        : pair.score < 58
                                          ? 'bg-[#FDF5F2] text-[#9A3412] hover:bg-[#F7E5DE]'
                                          : pair.score >= 76
                                            ? 'bg-[#F4F4F4] text-[#141414] font-semibold hover:bg-[#E8E8E8]'
                                            : 'bg-white text-[#404040] hover:bg-[#F5F5F5]'
                                    }`}
                                  >
                                    <span className="block font-mono text-xs font-medium">
                                      {pair.score}점
                                    </span>
                                    <span
                                      className={`block text-[10px] mt-0.5 truncate ${
                                        isSelected ? 'text-white/80' : 'text-[#6E6E6E]'
                                      }`}
                                    >
                                      {pair.relationTier}
                                    </span>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Clickable Pair Ranking */}
                  <div>
                    <p className="text-xs font-medium text-[#525252] mb-2.5">
                      전체 조합 목록 ({groupReport.pairs.length}쌍)
                    </p>
                    <div className="divide-y divide-[#EFEFEF] border-t border-b border-[#E5E5E5]">
                      {[...groupReport.pairs]
                        .sort((a, b) => b.score - a.score)
                        .map((pair) => {
                          const isSelected = activePair?.pairKey === pair.pairKey;
                          return (
                            <button
                              key={pair.pairKey}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => setSelectedPairKey(pair.pairKey)}
                              className={`w-full min-h-[48px] py-3 px-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                                isSelected ? 'bg-[#F5F5F5]' : 'hover:bg-[#FAFAFA]'
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="font-editorial text-sm font-bold text-[#141414]">
                                  {pair.a.name} × {pair.b.name}
                                </span>
                                <span className="ml-2 text-xs text-[#666666]">
                                  {pair.a.dayPillarCode} · {pair.b.dayPillarCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                                <span className="text-[#666666]">{pair.relationTier}</span>
                                <span
                                  className={`font-mono font-semibold ${
                                    pair.score < 58 ? 'text-[#9A3412]' : 'text-[#141414]'
                                  }`}
                                >
                                  {pair.score}점
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 02: 1:1 Detailed Pair Compatibility */}
            {activePair && (
              <section id="rel-pair" className="py-14 border-b border-[#E5E5E5] scroll-mt-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#666666] mb-1.5 tabular-nums">
                      <span>02. 선택된 1:1 명리 상관관계</span>
                      <span aria-hidden="true">·</span>
                      <span>{activePair.relationTier}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#141414] font-medium">
                        명리 조화 지수 {activePair.score}점
                      </span>
                    </div>
                    <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]">
                      {activePair.a.name}({activePair.a.dayPillarCode}) × {activePair.b.name}(
                      {activePair.b.dayPillarCode})
                    </h2>
                    <p className="mt-2 text-base text-[#525252]">{activePair.relationTitle}</p>
                  </div>
                </div>

                {/* Asymmetric Editorial Grid (8 cols analysis / 4 cols Seoldam Margin Note) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                  <div className="lg:col-span-8 space-y-10">
                    {/* Bidirectional Day Master Role */}
                    <div>
                      <h3 className="text-xs font-medium text-[#666666] mb-3">
                        일간(日干) 상호 십신 역할
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#E5E5E5]">
                        <div className="p-5 border-r border-b border-[#E5E5E5]">
                          <div className="flex items-baseline justify-between gap-2 mb-2">
                            <span className="text-xs text-[#666666]">
                              {activePair.a.name} → {activePair.b.name}
                            </span>
                            <span className="text-xs font-medium text-[#141414]">
                              {activePair.aToB.tenGod} · {activePair.aToB.roleLabel}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-[#404040]">
                            {activePair.aToB.description}
                          </p>
                        </div>
                        <div className="p-5 border-r border-b border-[#E5E5E5]">
                          <div className="flex items-baseline justify-between gap-2 mb-2">
                            <span className="text-xs text-[#666666]">
                              {activePair.b.name} → {activePair.a.name}
                            </span>
                            <span className="text-xs font-medium text-[#141414]">
                              {activePair.bToA.tenGod} · {activePair.bToA.roleLabel}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-[#404040]">
                            {activePair.bToA.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detected Saju Signals (합·충·원진·귀인·용신) */}
                    <div>
                      <h3 className="text-xs font-medium text-[#666666] mb-3">
                        원국 교차 명리 근거 ({activePair.signals.length}건)
                      </h3>
                      {activePair.signals.length === 0 ? (
                        <p className="text-sm text-[#525252] py-4 border-t border-b border-[#EFEFEF]">
                          강한 합·충·원진 같은 극단적 기복 없이 담백하고 잔잔하게 흐르는 무난한 구조입니다.
                        </p>
                      ) : (
                        <dl className="divide-y divide-[#EFEFEF] border-t border-b border-[#E5E5E5]">
                          {activePair.signals.map((sig) => (
                            <div
                              key={sig.id}
                              className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 items-baseline"
                            >
                              <dt className="sm:col-span-4 flex items-center gap-2 text-xs">
                                <span
                                  className={`font-medium ${
                                    sig.polarity === 'tension'
                                      ? 'text-[#9A3412]'
                                      : sig.polarity === 'harmony'
                                        ? 'text-[#14532D]'
                                        : 'text-[#525252]'
                                  }`}
                                >
                                  [{sig.category} ·{' '}
                                  {sig.polarity === 'harmony'
                                    ? '조화'
                                    : sig.polarity === 'tension'
                                      ? '주의'
                                      : '특징'}
                                  ]
                                </span>
                                <span className="font-semibold text-[#141414]">{sig.label}</span>
                              </dt>
                              <dd className="sm:col-span-8 text-sm leading-relaxed text-[#404040]">
                                {sig.detail}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>

                    {/* Strengths & Caution Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xs font-medium text-[#14532D] pb-2 border-b border-[#E5E5E5] mb-3">
                          잘 맞는 지점
                        </h3>
                        <ul className="space-y-2.5 text-sm leading-relaxed text-[#333333]">
                          {activePair.harmonyPoints.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#8C8C8C] select-none">—</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-medium text-[#9A3412] pb-2 border-b border-[#E5E5E5] mb-3">
                          조율하면 좋은 지점
                        </h3>
                        <ul className="space-y-2.5 text-sm leading-relaxed text-[#333333]">
                          {activePair.cautionPoints.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#8C8C8C] select-none">—</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Element Complementarity & 2027 Joint Flow */}
                    <dl className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#E5E5E5]">
                      <div className="p-5 border-r border-b border-[#E5E5E5]">
                        <dt className="text-xs font-medium text-[#666666] mb-1.5">
                          오행 · 용신 보완도
                        </dt>
                        <dd className="text-sm leading-relaxed text-[#404040]">
                          {activePair.elementComplementSummary}
                        </dd>
                      </div>
                      <div className="p-5 border-r border-b border-[#E5E5E5]">
                        <dt className="text-xs font-medium text-[#666666] mb-1.5">
                          2027 정미년(丁未) 두 사람의 흐름
                        </dt>
                        <dd className="text-sm leading-relaxed text-[#404040]">
                          {activePair.year2027JointNote}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Right Margin Rail: Seoldam Relationship Note */}
                  <aside className="lg:col-span-4 border border-[#E5E5E5] bg-[#FAFAFA] p-6">
                    <div className="flex items-center gap-4 pb-5 border-b border-[#E5E5E5]">
                      <div className="w-16 h-16 bg-white border border-[#EFEFEF] p-1.5 shrink-0">
                        <SeoldamImage
                          src={SEOLDAM_ASSETS.notes[activePair.seoldamNote.mood]}
                          alt="저승차사 재(災)의 관계 풀이 일러스트"
                          className="w-full h-full object-contain"
                          fallbackTitle="재(災)"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-[#737373]">여백 노트 · 사주 관계 평</p>
                        <p className="font-editorial text-base font-bold text-[#141414]">
                          저승차사 재(災)의 한마디
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 font-editorial text-[15px] leading-[1.8] text-[#141414]">
                      “{activePair.seoldamNote.quote}”
                    </p>
                    <p className="mt-4 pt-4 border-t border-[#E8E8E8] text-xs leading-relaxed text-[#525252]">
                      {activePair.seoldamNote.tip}
                    </p>
                  </aside>
                </div>
              </section>
            )}

            {/* Section 03: Collective Group Five Elements & Multi-Member Roles */}
            <section id="rel-group" className="pt-14 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <p className="text-xs text-[#666666] mb-1.5">
                    03. {members.length}인 합산 오행 및 다자 시너지
                  </p>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]">
                    {groupReport.groupTemperamentTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#525252] max-w-2xl">
                    {groupReport.groupTemperamentSummary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Collective Five-Element Bars */}
                <div className="lg:col-span-6 border border-[#E5E5E5] p-6">
                  <div className="flex items-center justify-between text-xs text-[#666666] mb-5">
                    <span>구성원 합산 오행 비율</span>
                    <span className="tabular-nums">
                      중심 {ELEMENT_META[groupReport.strongestGroupElement].hangul} · 희소{' '}
                      {ELEMENT_META[groupReport.weakestGroupElement].hangul}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {groupReport.collectiveElements.map((item) => {
                      const meta = ELEMENT_META[item.element];
                      return (
                        <div key={item.element}>
                          <div className="flex items-center justify-between text-xs mb-1.5 tabular-nums">
                            <span className="font-medium text-[#141414]">
                              {item.hangul}({item.hanja})
                              <span className="ml-2 text-[#737373] font-normal">
                                {item.rawCount}자 · {item.status}
                              </span>
                            </span>
                            <span className="font-mono font-medium text-[#141414]">
                              {item.percentage}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[#F2F2F2] overflow-hidden">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(2, item.percentage))}%`,
                                backgroundColor: meta.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Group Roles & Multi-member Samhap */}
                <div className="lg:col-span-6 space-y-6">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[#E5E5E5]">
                    {groupReport.bestPair && (
                      <div className="p-5 border-r border-b border-[#E5E5E5]">
                        <dt className="text-xs text-[#737373] mb-1">최고의 호흡 조합</dt>
                        <dd className="font-editorial text-base font-bold text-[#141414]">
                          {groupReport.bestPair.a.name} × {groupReport.bestPair.b.name}
                          <span className="ml-2 font-mono text-xs font-medium text-[#14532D] tabular-nums">
                            {groupReport.bestPair.score}점
                          </span>
                        </dd>
                        <p className="mt-1.5 text-xs text-[#666666]">
                          {groupReport.bestPair.shortKeyword}
                        </p>
                      </div>
                    )}

                    {groupReport.tensionPair && (
                      <div className="p-5 border-r border-b border-[#E5E5E5]">
                        <dt className="text-xs text-[#737373] mb-1">가장 입체적인 자극 조합</dt>
                        <dd className="font-editorial text-base font-bold text-[#141414]">
                          {groupReport.tensionPair.a.name} × {groupReport.tensionPair.b.name}
                          <span className="ml-2 font-mono text-xs font-medium text-[#9A3412] tabular-nums">
                            {groupReport.tensionPair.score}점
                          </span>
                        </dd>
                        <p className="mt-1.5 text-xs text-[#666666]">
                          {groupReport.tensionPair.shortKeyword}
                        </p>
                      </div>
                    )}

                    {groupReport.mediator && (
                      <div className="p-5 border-r border-b border-[#E5E5E5]">
                        <dt className="text-xs text-[#737373] mb-1">모임의 중심 · 중재자</dt>
                        <dd className="font-editorial text-base font-bold text-[#141414]">
                          {groupReport.mediator.member.name}
                          <span className="ml-2 font-mono text-xs font-normal text-[#666666] tabular-nums">
                            평균 {groupReport.mediator.avgScore}점
                          </span>
                        </dd>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#666666]">
                          {groupReport.mediator.reason}
                        </p>
                      </div>
                    )}

                    {groupReport.balancer && (
                      <div className="p-5 border-r border-b border-[#E5E5E5]">
                        <dt className="text-xs text-[#737373] mb-1">모임의 빈틈 균형추</dt>
                        <dd className="font-editorial text-base font-bold text-[#141414]">
                          {groupReport.balancer.member.name}
                          <span
                            className="ml-2 text-xs font-medium"
                            style={{ color: ELEMENT_META[groupReport.balancer.element].color }}
                          >
                            {ELEMENT_META[groupReport.balancer.element].hangul}(
                            {ELEMENT_META[groupReport.balancer.element].hanja}) 보완
                          </span>
                        </dd>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#666666]">
                          {groupReport.balancer.reason}
                        </p>
                      </div>
                    )}
                  </dl>

                  {/* Multi-member Samhap / Banghap Completions */}
                  {members.length >= 3 && (
                    <div className="border border-[#E5E5E5] p-5 bg-[#FAFAFA]">
                      <p className="text-xs font-medium text-[#141414] mb-3">
                        3인 이상 다자 합국(삼합 · 방합) 완성 여부
                      </p>
                      {groupReport.groupSamhaps.length === 0 ? (
                        <p className="text-xs leading-relaxed text-[#666666]">
                          세 사람의 지지가 하나의 삼합·방합으로 완전히 묶이지는 않지만, 각자의 개성이 뚜렷해 서로의 영역을 침범하지 않는 독립적인 모임 결을 보입니다.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {groupReport.groupSamhaps.map((match) => (
                            <div
                              key={match.id}
                              className="pb-3 last:pb-0 border-b last:border-b-0 border-[#E5E5E5]"
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span
                                  className="font-editorial text-sm font-bold"
                                  style={{ color: ELEMENT_META[match.element].color }}
                                >
                                  {match.name}
                                </span>
                                <span className="text-xs text-[#525252]">
                                  {match.contributors
                                    .map((c) => `${c.memberName}(${c.branchHangul}${c.branchHanja})`)
                                    .join(' + ')}
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs leading-relaxed text-[#525252]">
                                {match.meaning}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Closing Group Verdict with Seoldam */}
              <div className="mt-12 py-7 border-t border-b border-[#141414] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-2 flex items-center gap-3 md:block">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white overflow-hidden shrink-0">
                    <SeoldamImage
                      src={SEOLDAM_ASSETS.notes.warm}
                      alt="부채를 든 저승차사 고양이 재(災)"
                      className="w-full h-full object-contain"
                      fallbackTitle="재(災)"
                    />
                  </div>
                  <span className="md:hidden text-xs font-medium text-[#141414]">
                    재(災)의 모임 총평
                  </span>
                </div>
                <div className="md:col-span-10">
                  <p className="hidden md:block text-xs text-[#737373] mb-2">
                    저승차사 재(災)의 {members.length}인 사주 관계 총평
                  </p>
                  <p className="font-editorial text-lg leading-[1.75] text-[#141414]">
                    “{groupReport.seoldamGroupSummary}”
                  </p>
                  <div className="mt-4 no-print">
                    <button
                      type="button"
                      onClick={onOpenBokchae}
                      className="min-h-[40px] sm:min-h-[34px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#525252] bg-white border border-[#D4D4D4] rounded-md hover:text-[#141414] hover:border-[#141414] transition-colors cursor-pointer"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>관계 풀이가 도움되셨다면 · 복채 전하기</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Quiet Editorial Footer */}
        <footer className="mt-16 pt-8 border-t border-[#EBEBEB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6E6E6E]">
          <span>저승차사 재(災) 명리 리포트 · 순수 명리 원국 기반 참고용 다자 사주 관계도</span>
          <span>명부에 기록한 만세력만 현재 브라우저에 보관되며 외부로 전송되지 않습니다.</span>
        </footer>
      </div>
    </motion.main>
  );
}
