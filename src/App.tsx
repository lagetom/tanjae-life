/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { BokchaeModal } from './components/BokchaeModal';
import { HeroInputView } from './components/HeroInputView';
import { RelationshipView } from './components/RelationshipView';
import { REPORT_PAGES, ReportPageId, ReportView } from './components/ReportView';
import { TopBar } from './components/TopBar';
import { calculateSajuChart } from './engine/manseryeok';
import { generateReadingReport } from './engine/reportGenerator';
import { PRESET_PROFILES } from './engine/sajuKnowledge';
import {
  RelationMember,
  createMemberFromBirthInput,
  createMemberFromCode,
  createMemberFromSajuChart,
} from './engine/sajuRelationship';
import { BirthInput, PresetProfile, ReadingReport } from './engine/sajuTypes';
import {
  AppMode,
  DEFAULT_BIRTH_INPUT,
  LedgerEntry,
  buildLedgerEntryFromBirth,
  buildLedgerEntryFromMember,
  clearLedgerEntries,
  formatChartShorthand,
  isEntryInLedger,
  loadLedgerEntries,
  saveLedgerEntries,
  upsertLedgerEntry,
} from './utils/storage';

function ledgerEntryToRelationMember(entry: LedgerEntry): RelationMember | null {
  if (entry.kind === 'birth' && entry.birthInput) {
    const res = createMemberFromBirthInput(`ledger-${entry.id}`, entry.birthInput);
    if (res.ok) return res.member;
  }
  const res = createMemberFromCode(`ledger-${entry.id}`, entry.name, entry.shorthand, 'hour-first');
  return res.ok ? res.member : null;
}

export default function App() {
  // Always start fresh on page reload; only the user's explicit 명부(ledger) persists in localStorage
  const [mode, setMode] = useState<AppMode>('input');
  const [birthInput, setBirthInput] = useState<BirthInput>(DEFAULT_BIRTH_INPUT);
  const [formSyncVersion, setFormSyncVersion] = useState(0);
  const [report, setReport] = useState<ReadingReport | null>(null);
  const [relationMembers, setRelationMembers] = useState<RelationMember[]>([]);
  const [hasSyncedSelfOnce, setHasSyncedSelfOnce] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => loadLedgerEntries());
  const [bokchaeOpen, setBokchaeOpen] = useState(false);
  const [activeReportPage, setActiveReportPage] = useState<ReportPageId>('won-guk');
  const [activeSection, setActiveSection] = useState<string>('input-form');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const persistLedger = (next: LedgerEntry[]) => {
    setLedgerEntries(next);
    saveLedgerEntries(next);
  };

  const runAnalysis = (input: BirthInput) => {
    const chart = calculateSajuChart(input);
    const generated = generateReadingReport(chart);
    setBirthInput(input);
    setFormSyncVersion((v) => v + 1);
    setReport(generated);
    setHasSyncedSelfOnce(false);
    setMode('report');
    setActiveReportPage('won-guk');
    setActiveSection('won-guk');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveBirthToLedger = (
    input: BirthInput
  ): { entry: LedgerEntry; updatedExisting: boolean } => {
    const entry = buildLedgerEntryFromBirth(input);
    const { next, updatedExisting } = upsertLedgerEntry(ledgerEntries, entry);
    persistLedger(next);
    return { entry, updatedExisting };
  };

  const handleSaveCurrentReportToLedger = () => {
    if (!report) return;
    handleSaveBirthToLedger(report.chart.input);
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

  const handleOpenLedgerEntry = (entry: LedgerEntry) => {
    if (entry.kind === 'birth' && entry.birthInput) {
      runAnalysis(entry.birthInput);
      return;
    }
    const member = ledgerEntryToRelationMember(entry);
    if (!member) return;
    setRelationMembers((prev) => {
      const base = prev.every((m) => m.isSample) ? [] : prev;
      const already = base.some(
        (m) => m.name === member.name && m.shorthand === member.shorthand
      );
      if (already) return base;
      return [...base, member].slice(0, 8);
    });
    setMode('relation');
    setActiveSection('rel-members');
    setScrollProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleOpenLedgerInRelation = () => {
    const converted: RelationMember[] = [];
    for (const entry of ledgerEntries.slice(0, 8)) {
      const m = ledgerEntryToRelationMember(entry);
      if (m) converted.push(m);
    }
    setRelationMembers(converted);
    setHasSyncedSelfOnce(true);
    setMode('relation');
    setActiveSection('rel-members');
    setScrollProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPreset = (preset: PresetProfile) => {
    runAnalysis(preset.input);
  };

  const handleLoadDefaultPreset = () => {
    runAnalysis(PRESET_PROFILES[0].input);
  };

  const handleResetToInput = () => {
    setMode('input');
    setActiveSection('input-form');
    setScrollProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRelation = () => {
    if (report && !hasSyncedSelfOnce) {
      const selfMember = createMemberFromSajuChart(report.chart);
      setRelationMembers((prev) => {
        const isSampleOnly = prev.length > 0 && prev.every((m) => m.isSample);
        if (isSampleOnly) {
          return [selfMember];
        }
        const withoutOldSelf = prev.filter((m) => m.id !== 'my-report-self');
        return [selfMember, ...withoutOldSelf].slice(0, 8);
      });
      setHasSyncedSelfOnce(true);
    }
    setMode('relation');
    setActiveSection('rel-members');
    setScrollProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleNavigateSection = (id: string) => {
    if (mode === 'report') {
      const targetPage = REPORT_PAGES.find((p) => p.id === id);
      if (targetPage) {
        handleChangeReportPage(targetPage.id);
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

  // Update progress bar based on active chapter in report mode, and track sections in relation mode
  useEffect(() => {
    if (mode === 'report') {
      const idx = REPORT_PAGES.findIndex((p) => p.id === activeReportPage);
      const pct = idx >= 0 ? ((idx + 1) / REPORT_PAGES.length) * 100 : 16.6;
      setScrollProgress(pct);
      setActiveSection(activeReportPage);
      return;
    }

    if (mode !== 'relation') return;

    const sectionIds = ['rel-members', 'rel-graph', 'rel-pair', 'rel-group'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0.01 }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [mode, activeReportPage, relationMembers.length]);

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
            myChart={report?.chart ?? null}
            members={relationMembers}
            ledgerEntries={ledgerEntries}
            onChangeMembers={setRelationMembers}
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
