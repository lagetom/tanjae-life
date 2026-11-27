/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { BokchaeModal } from './components/BokchaeModal';
import { HeroInputView } from './components/HeroInputView';
import {
  RELATION_PAGES,
  type RelationPageId,
  RelationshipView,
} from './components/RelationshipView';
import { REPORT_PAGES, type ReportPageId, ReportView } from './components/ReportView';
import { TopBar } from './components/TopBar';
import { PRESET_PROFILES } from './constants/uiMeta';
import type {
  BirthInput,
  GroupChemistryReport,
  PresetProfile,
  ReadingReport,
  RelationMember,
} from './types/saju';
import {
  fetchChartSummary,
  fetchReadingReport,
  fetchRelationshipAction,
  toMemberSeeds,
} from './utils/api';
import {
  type AppMode,
  DEFAULT_BIRTH_INPUT,
  type LedgerEntry,
  buildLedgerEntryFromChart,
  buildLedgerEntryFromMember,
  buildLedgerEntryFromSummary,
  clearLedgerEntries,
  formatChartShorthand,
  isEntryInLedger,
  loadLedgerEntries,
  saveLedgerEntries,
  upsertLedgerEntry,
} from './utils/storage';

export default function App() {
  // Always start fresh on page reload; only the user's explicit 명부(ledger) persists in localStorage
  const [mode, setMode] = useState<AppMode>('input');
  const [birthInput, setBirthInput] = useState<BirthInput>(DEFAULT_BIRTH_INPUT);
  const [formSyncVersion, setFormSyncVersion] = useState(0);
  const [report, setReport] = useState<ReadingReport | null>(null);
  const [selfMember, setSelfMember] = useState<RelationMember | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [relationMembers, setRelationMembers] = useState<RelationMember[]>([]);
  const [groupReport, setGroupReport] = useState<GroupChemistryReport | null>(null);
  const [isRelationBusy, setIsRelationBusy] = useState(false);
  const [hasSyncedSelfOnce, setHasSyncedSelfOnce] = useState(false);

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => loadLedgerEntries());
  const [bokchaeOpen, setBokchaeOpen] = useState(false);
  const [activeReportPage, setActiveReportPage] = useState<ReportPageId>('won-guk');
  const [activeRelationPage, setActiveRelationPage] = useState<RelationPageId>('rel-members');
  const [activeSection, setActiveSection] = useState<string>('input-form');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const persistLedger = (next: LedgerEntry[]) => {
    setLedgerEntries(next);
    saveLedgerEntries(next);
  };

  const handleUpdateRelationState = (
    nextMembers: RelationMember[],
    nextGroupReport: GroupChemistryReport | null
  ) => {
    setRelationMembers(nextMembers);
    setGroupReport(nextGroupReport);
    if (nextMembers.length < 2 || !nextGroupReport) {
      setActiveRelationPage('rel-members');
    }
  };

  const runAnalysis = async (input: BirthInput) => {
    setIsSubmittingReport(true);
    setReportError(null);
    try {
      const { report: generated, selfMember: resolvedSelf } = await fetchReadingReport(input);
      setBirthInput(input);
      setFormSyncVersion((v) => v + 1);
      setReport(generated);
      setSelfMember(resolvedSelf);
      setHasSyncedSelfOnce(false);
      setMode('report');
      setActiveReportPage('won-guk');
      setActiveSection('won-guk');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setReportError(
        err instanceof Error
          ? err.message
          : '리포트를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSaveBirthToLedger = async (
    input: BirthInput
  ): Promise<{ entry: LedgerEntry; updatedExisting: boolean }> => {
    const summary = await fetchChartSummary(input);
    const entry = buildLedgerEntryFromSummary(input, summary);
    const { next, updatedExisting } = upsertLedgerEntry(ledgerEntries, entry);
    persistLedger(next);
    return { entry, updatedExisting };
  };

  const handleSaveCurrentReportToLedger = () => {
    if (!report) return;
    const entry = buildLedgerEntryFromChart(report.chart);
    const { next } = upsertLedgerEntry(ledgerEntries, entry);
    persistLedger(next);
  };

  const handleSaveMemberToLedger = (member: RelationMember) => {
    const entry = buildLedgerEntryFromMember(member);
    const { next } = upsertLedgerEntry(ledgerEntries, entry);
    persistLedger(next);
  };

  const handleRemoveLedgerEntry = (id: string) => {
    const next = ledgerEntries.filter((item) => item.id !== id);
    persistLedger(next);
  };

  const handleClearLedger = () => {
    clearLedgerEntries();
    setLedgerEntries([]);
  };

  const handleOpenLedgerEntry = async (entry: LedgerEntry) => {
    if (entry.kind === 'birth' && entry.birthInput) {
      await runAnalysis(entry.birthInput);
      return;
    }

    const base = relationMembers.every((m) => m.isSample) ? [] : relationMembers;
    setMode('relation');
    setActiveRelationPage('rel-members');
    setActiveSection('rel-members');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsRelationBusy(true);
    try {
      const res = await fetchRelationshipAction({
        action: 'from-ledger',
        entries: [
          {
            id: entry.id,
            name: entry.name,
            kind: entry.kind,
            shorthand: entry.shorthand,
            birthInput: entry.birthInput,
          },
        ],
        existingMembers: toMemberSeeds(base),
      });
      if (res.ok) {
        handleUpdateRelationState(res.members, res.groupReport);
      }
    } finally {
      setIsRelationBusy(false);
    }
  };

  const handleFillFormFromLedger = (entry: LedgerEntry) => {
    if (!entry.birthInput) return;
    setBirthInput(entry.birthInput);
    setFormSyncVersion((v) => v + 1);
    const el = document.getElementById('input-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenLedgerInRelation = async () => {
    setHasSyncedSelfOnce(true);
    setMode('relation');
    setActiveRelationPage('rel-members');
    setActiveSection('rel-members');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsRelationBusy(true);
    try {
      const res = await fetchRelationshipAction({
        action: 'from-ledger',
        entries: ledgerEntries.slice(0, 8).map((entry) => ({
          id: entry.id,
          name: entry.name,
          kind: entry.kind,
          shorthand: entry.shorthand,
          birthInput: entry.birthInput,
        })),
        existingMembers: [],
      });
      if (res.ok) {
        handleUpdateRelationState(res.members, res.groupReport);
      }
    } finally {
      setIsRelationBusy(false);
    }
  };

  const handleSelectPreset = (preset: PresetProfile) => {
    void runAnalysis(preset.input);
  };

  const handleLoadDefaultPreset = () => {
    void runAnalysis(PRESET_PROFILES[0].input);
  };

  const handleResetToInput = () => {
    setMode('input');
    setActiveSection('input-form');
    setScrollProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRelation = async () => {
    setMode('relation');
    setActiveRelationPage('rel-members');
    setActiveSection('rel-members');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (selfMember && !hasSyncedSelfOnce) {
      setHasSyncedSelfOnce(true);
      const isSampleOnly = relationMembers.length > 0 && relationMembers.every((m) => m.isSample);
      const withoutOldSelf = isSampleOnly
        ? []
        : relationMembers.filter((m) => m.id !== 'my-report-self');
      const nextList = [selfMember, ...withoutOldSelf].slice(0, 8);

      if (nextList.length < 2) {
        handleUpdateRelationState(nextList, null);
        return;
      }

      setIsRelationBusy(true);
      try {
        const res = await fetchRelationshipAction({
          action: 'analyze',
          members: toMemberSeeds(nextList),
        });
        if (res.ok) {
          handleUpdateRelationState(res.members, res.groupReport);
        }
      } finally {
        setIsRelationBusy(false);
      }
    }
  };

  const handleReturnToReport = () => {
    if (report) {
      setMode('report');
      setActiveSection(activeReportPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleResetToInput();
    }
  };

  const handleChangeReportPage = (page: ReportPageId) => {
    setActiveReportPage(page);
    setActiveSection(page);
  };

  const handleChangeRelationPage = (page: RelationPageId) => {
    if (page !== 'rel-members' && (relationMembers.length < 2 || !groupReport)) {
      return;
    }
    setActiveRelationPage(page);
    setActiveSection(page);
  };

  const handleNavigateSection = (id: string) => {
    if (mode === 'report') {
      const targetPage = REPORT_PAGES.find((p) => p.id === id);
      if (targetPage) {
        handleChangeReportPage(targetPage.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (mode === 'relation') {
      const targetPage = RELATION_PAGES.find((p) => p.id === id);
      if (targetPage) {
        if (targetPage.id !== 'rel-members' && (relationMembers.length < 2 || !groupReport)) {
          return;
        }
        handleChangeRelationPage(targetPage.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  // Update progress bar based on active chapter in report and relation modes
  useEffect(() => {
    if (mode === 'report') {
      const idx = REPORT_PAGES.findIndex((p) => p.id === activeReportPage);
      const pct = idx >= 0 ? ((idx + 1) / REPORT_PAGES.length) * 100 : 16.6;
      setScrollProgress(pct);
      setActiveSection(activeReportPage);
      return;
    }

    if (mode === 'relation') {
      const effectiveRelPage: RelationPageId =
        relationMembers.length >= 2 && groupReport ? activeRelationPage : 'rel-members';
      const idx = RELATION_PAGES.findIndex((p) => p.id === effectiveRelPage);
      const pct = idx >= 0 ? ((idx + 1) / RELATION_PAGES.length) * 100 : 25;
      setScrollProgress(pct);
      setActiveSection(effectiveRelPage);
    }
  }, [mode, activeReportPage, activeRelationPage, relationMembers.length, groupReport]);

  const isCurrentReportInLedger = useMemo(() => {
    if (!report) return false;
    const shorthand = formatChartShorthand(report.chart);
    const displayName = report.chart.input.name.trim() || `${report.chart.dayPillarCode}일주`;
    return isEntryInLedger(ledgerEntries, displayName, shorthand);
  }, [report, ledgerEntries]);

  return (
    <div className="min-h-screen bg-white text-[#141414]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#141414] focus:text-white focus:text-xs focus:font-medium focus:rounded-md"
      >
        본문으로 바로가기
      </a>

      <TopBar
        mode={mode}
        hasPersonalReport={Boolean(report)}
        activeSection={activeSection}
        disabledSectionIds={
          mode === 'relation' && (relationMembers.length < 2 || !groupReport)
            ? ['rel-graph', 'rel-pair', 'rel-group']
            : []
        }
        scrollProgress={scrollProgress}
        onResetToInput={handleResetToInput}
        onOpenRelation={handleOpenRelation}
        onReturnToReport={handleReturnToReport}
        onLoadDefaultPreset={handleLoadDefaultPreset}
        onNavigateSection={handleNavigateSection}
        onOpenBokchae={() => setBokchaeOpen(true)}
      />

      <div id="main-content" tabIndex={-1} className="outline-none">
        {mode === 'relation' ? (
          <RelationshipView
            hasPersonalReport={Boolean(report)}
            selfMember={selfMember}
            members={relationMembers}
            groupReport={groupReport}
            activePage={activeRelationPage}
            onChangePage={handleChangeRelationPage}
            isBusy={isRelationBusy}
            ledgerEntries={ledgerEntries}
            onUpdateRelationState={handleUpdateRelationState}
            onSetBusy={setIsRelationBusy}
            onSaveMemberToLedger={handleSaveMemberToLedger}
            onClearLedger={handleClearLedger}
            onBackToPersonal={handleReturnToReport}
            onOpenBokchae={() => setBokchaeOpen(true)}
          />
        ) : mode === 'report' && report ? (
          <ReportView
            report={report}
            activePage={activeReportPage}
            onChangePage={handleChangeReportPage}
            isSavedInLedger={isCurrentReportInLedger}
            onSaveToLedger={handleSaveCurrentReportToLedger}
            onResetToInput={handleResetToInput}
            onOpenRelation={handleOpenRelation}
            onOpenBokchae={() => setBokchaeOpen(true)}
          />
        ) : (
          <HeroInputView
            initialInput={birthInput}
            formSyncVersion={formSyncVersion}
            ledgerEntries={ledgerEntries}
            isSubmitting={isSubmittingReport}
            serverError={reportError}
            onSubmit={runAnalysis}
            onSaveToLedger={handleSaveBirthToLedger}
            onOpenLedgerEntry={handleOpenLedgerEntry}
            onFillFormFromLedger={handleFillFormFromLedger}
            onRemoveLedgerEntry={handleRemoveLedgerEntry}
            onClearLedger={handleClearLedger}
            onOpenLedgerInRelation={handleOpenLedgerInRelation}
            onSelectPreset={handleSelectPreset}
            onOpenRelation={handleOpenRelation}
          />
        )}
      </div>

      <BokchaeModal open={bokchaeOpen} onClose={() => setBokchaeOpen(false)} />
    </div>
  );
}
