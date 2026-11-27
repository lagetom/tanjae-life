import type {
  BirthInput,
  ChartLedgerSummary,
  ElementType,
  RelationMember,
  SajuChart,
} from '../types/saju';

export const LEDGER_STORAGE_KEY = 'chasa-jae-ledger-v2';
const LEGACY_STORAGE_KEY = 'chasa-jae-saju-state-v1';
const MAX_LEDGER_ENTRIES = 30;

export type AppMode = 'input' | 'report' | 'relation';

export interface LedgerEntry {
  id: string;
  name: string;
  savedAt: string;
  kind: 'birth' | 'shorthand';
  birthInput?: BirthInput;
  shorthand: string;
  dayPillarCode: string;
  dayPillarHanja: string;
  dayElement: ElementType;
  caption: string;
}

interface StoredLedgerPayload {
  version: 2;
  entries: LedgerEntry[];
}

export const DEFAULT_BIRTH_INPUT: BirthInput = {
  name: '',
  gender: 'female',
  calendarType: 'solar',
  year: 1994,
  month: 5,
  day: 12,
  isLeapMonth: false,
  hour: 10,
  minute: 30,
  unknownTime: false,
  useTrueSolarTime: true,
};

function isValidBirthInput(value: unknown): value is BirthInput {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    (v.gender === 'male' || v.gender === 'female') &&
    (v.calendarType === 'solar' || v.calendarType === 'lunar') &&
    typeof v.year === 'number' &&
    v.year >= 1900 &&
    v.year <= 2050 &&
    typeof v.month === 'number' &&
    v.month >= 1 &&
    v.month <= 12 &&
    typeof v.day === 'number' &&
    v.day >= 1 &&
    v.day <= 31 &&
    typeof v.isLeapMonth === 'boolean' &&
    typeof v.hour === 'number' &&
    v.hour >= 0 &&
    v.hour <= 23 &&
    typeof v.minute === 'number' &&
    v.minute >= 0 &&
    v.minute <= 59 &&
    typeof v.unknownTime === 'boolean' &&
    typeof v.useTrueSolarTime === 'boolean'
  );
}

const VALID_ELEMENTS: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

function isValidLedgerEntry(value: unknown): value is LedgerEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== 'string' ||
    typeof v.name !== 'string' ||
    typeof v.savedAt !== 'string' ||
    (v.kind !== 'birth' && v.kind !== 'shorthand') ||
    typeof v.shorthand !== 'string' ||
    typeof v.dayPillarCode !== 'string' ||
    typeof v.dayPillarHanja !== 'string' ||
    typeof v.caption !== 'string' ||
    !VALID_ELEMENTS.includes(v.dayElement as ElementType)
  ) {
    return false;
  }
  if (v.kind === 'birth' && !isValidBirthInput(v.birthInput)) {
    return false;
  }
  return true;
}

export function formatChartShorthand(chart: SajuChart): string {
  const stems = [
    ...(chart.pillars.hour ? [chart.pillars.hour.stem.hangul] : []),
    chart.pillars.day.stem.hangul,
    chart.pillars.month.stem.hangul,
    chart.pillars.year.stem.hangul,
  ].join('');
  const branches = [
    ...(chart.pillars.hour ? [chart.pillars.hour.branch.hangul] : []),
    chart.pillars.day.branch.hangul,
    chart.pillars.month.branch.hangul,
    chart.pillars.year.branch.hangul,
  ].join('');
  return `${stems}${branches}`;
}

export function buildLedgerEntryFromSummary(
  input: BirthInput,
  summary: ChartLedgerSummary
): LedgerEntry {
  return {
    id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: summary.cleanName,
    savedAt: new Date().toISOString(),
    kind: 'birth',
    birthInput: {
      ...input,
      name: summary.cleanName,
    },
    shorthand: summary.shorthand,
    dayPillarCode: summary.dayPillarCode,
    dayPillarHanja: summary.dayPillarHanja,
    dayElement: summary.dayElement,
    caption: summary.caption,
  };
}

export function buildLedgerEntryFromChart(chart: SajuChart): LedgerEntry {
  const input = chart.input;
  const shorthand = formatChartShorthand(chart);
  const cleanName = input.name.trim() || `${chart.dayPillarCode}일주`;
  const calLabel =
    input.calendarType === 'lunar' ? (input.isLeapMonth ? '음력(윤)' : '음력') : '양력';
  const datePart = `${calLabel} ${input.year}.${String(input.month).padStart(2, '0')}.${String(input.day).padStart(2, '0')}`;
  const timePart = input.unknownTime
    ? '시간 미상'
    : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
  const genderPart = input.gender === 'female' ? '여명' : '남명';

  return {
    id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName,
    savedAt: new Date().toISOString(),
    kind: 'birth',
    birthInput: {
      ...input,
      name: cleanName,
    },
    shorthand,
    dayPillarCode: chart.dayPillarCode,
    dayPillarHanja: chart.pillars.day.ganjiHanja,
    dayElement: chart.dayMaster.element,
    caption: `${datePart} · ${timePart} · ${genderPart}`,
  };
}

export function buildLedgerEntryFromMember(member: RelationMember): LedgerEntry {
  const charCount = Array.from(member.shorthand).length;
  return {
    id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: member.name.trim() || `${member.dayPillarCode}일주`,
    savedAt: new Date().toISOString(),
    kind: 'shorthand',
    shorthand: member.shorthand,
    dayPillarCode: member.dayPillarCode,
    dayPillarHanja: member.pillars.day.ganjiHanja,
    dayElement: member.dayMaster.element,
    caption: charCount === 6 ? '만세력 6글자 (생시 미상)' : '만세력 8글자 직접 기록',
  };
}

export function upsertLedgerEntry(
  entries: LedgerEntry[],
  incoming: LedgerEntry
): { next: LedgerEntry[]; updatedExisting: boolean } {
  const idx = entries.findIndex(
    (item) => item.name === incoming.name && item.shorthand === incoming.shorthand
  );

  if (idx >= 0) {
    const existing = entries[idx];
    const merged: LedgerEntry = {
      ...existing,
      savedAt: incoming.savedAt,
      kind: incoming.kind === 'birth' ? 'birth' : existing.kind,
      birthInput: incoming.birthInput ?? existing.birthInput,
      caption: incoming.kind === 'birth' ? incoming.caption : existing.caption,
    };
    const rest = entries.filter((_, i) => i !== idx);
    return { next: [merged, ...rest].slice(0, MAX_LEDGER_ENTRIES), updatedExisting: true };
  }

  return {
    next: [incoming, ...entries].slice(0, MAX_LEDGER_ENTRIES),
    updatedExisting: false,
  };
}

export function isEntryInLedger(
  entries: LedgerEntry[],
  name: string,
  shorthand: string
): boolean {
  const normalizedName = name.trim();
  return entries.some(
    (item) =>
      item.shorthand === shorthand &&
      (normalizedName ? item.name === normalizedName : true)
  );
}

export function loadLedgerEntries(): LedgerEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    // Clean up legacy auto-restore session key so page reloads always start fresh
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);

    const raw = window.localStorage.getItem(LEDGER_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Partial<StoredLedgerPayload>;
    if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.entries)) {
      return [];
    }

    return parsed.entries.filter(isValidLedgerEntry).slice(0, MAX_LEDGER_ENTRIES);
  } catch {
    return [];
  }
}

export function saveLedgerEntries(entries: LedgerEntry[]): boolean {
  if (typeof window === 'undefined') return false;

  const payload: StoredLedgerPayload = {
    version: 2,
    entries: entries.slice(0, MAX_LEDGER_ENTRIES),
  };

  try {
    window.localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearLedgerEntries(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEDGER_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage errors in restricted browsing contexts
  }
}
