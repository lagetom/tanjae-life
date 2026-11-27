import {
  getLunarMonthDays,
  isValidSolarDate,
} from './engine/lunarCalendar.ts';
import { calculateSajuChart } from './engine/manseryeok.ts';
import { generateReadingReport } from './engine/reportGenerator.ts';
import {
  SAMPLE_RELATION_BATCH_TEXT,
  analyzeGroupChemistry,
  buildRelationMemberFromRaw,
  createMemberFromBirthInput,
  createMemberFromCode,
  createMemberFromSajuChart,
  createSampleRelationMembers,
  parseBatchMembersText,
  parseManseryeokCode,
} from './engine/sajuRelationship.ts';
import type {
  BirthInput,
  ChartLedgerSummary,
  MemberSeed,
  PillarOrderMode,
  RelationMember,
  SajuChart,
} from '../src/types/saju.ts';

const MAX_MEMBERS = 8;
const MAX_BATCH_TEXT_LENGTH = 2000;
const MAX_BATCH_LINES = 20;

// ---------- Lightweight Per-IP Rate Limiter ----------

interface RateWindow {
  count: number;
  resetAt: number;
}

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 60;
const rateBuckets = new Map<string, RateWindow>();

export function checkRateLimit(clientIp: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const key = (clientIp || 'unknown').slice(0, 80);

  if (rateBuckets.size > 500) {
    for (const [k, v] of rateBuckets) {
      if (v.resetAt <= now) rateBuckets.delete(k);
    }
  }

  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (current.count >= RATE_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function resolveAllowedCorsOrigin(
  originHeader: string | undefined | null,
  allowedOriginsEnv: string | undefined
): string | null {
  if (!originHeader || !allowedOriginsEnv) return null;
  const allowlist = allowedOriginsEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return allowlist.includes(originHeader) ? originHeader : null;
}

// ---------- Input Sanitization & Validation ----------

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function validateBirthInput(
  raw: unknown
): { ok: true; input: BirthInput } | { ok: false; error: string } {
  if (!isPlainObject(raw)) {
    return { ok: false, error: '생년월일 입력 형식이 올바르지 않습니다.' };
  }

  const gender = raw.gender;
  const calendarType = raw.calendarType;
  const year = raw.year;
  const month = raw.month;
  const day = raw.day;
  const isLeapMonth = Boolean(raw.isLeapMonth);
  const unknownTime = Boolean(raw.unknownTime);
  const useTrueSolarTime = Boolean(raw.useTrueSolarTime);
  const hour = unknownTime ? 12 : raw.hour;
  const minute = unknownTime ? 0 : raw.minute;

  if (gender !== 'female' && gender !== 'male') {
    return { ok: false, error: '성별을 올바르게 선택해 주세요.' };
  }
  if (calendarType !== 'solar' && calendarType !== 'lunar') {
    return { ok: false, error: '양력 또는 음력을 선택해 주세요.' };
  }
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 1900 || year > 2050) {
    return { ok: false, error: '출생 연도는 1900년부터 2050년 사이로 입력해 주세요.' };
  }
  if (typeof month !== 'number' || !Number.isInteger(month) || month < 1 || month > 12) {
    return { ok: false, error: '출생 월은 1에서 12 사이의 숫자로 입력해 주세요.' };
  }
  if (typeof day !== 'number' || !Number.isInteger(day) || day < 1 || day > 31) {
    return { ok: false, error: '출생 일을 올바르게 입력해 주세요.' };
  }
  if (typeof hour !== 'number' || !Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { ok: false, error: '출생 시각(시)은 0~23 사이로 입력해 주세요.' };
  }
  if (typeof minute !== 'number' || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    return { ok: false, error: '출생 시각(분)은 0~59 사이로 입력해 주세요.' };
  }

  if (calendarType === 'solar') {
    if (!isValidSolarDate(year, month, day)) {
      return { ok: false, error: `${year}년 ${month}월에는 ${day}일이 존재하지 않습니다.` };
    }
  } else {
    const maxLunarDay = getLunarMonthDays(year, month, isLeapMonth);
    if (maxLunarDay === 0 || day > maxLunarDay) {
      return {
        ok: false,
        error: `음력 ${year}년 ${isLeapMonth ? '윤' : ''}${month}월은 최대 ${maxLunarDay || 29}일까지입니다.`,
      };
    }
  }

  return {
    ok: true,
    input: {
      name: sanitizeText(raw.name, 20),
      gender,
      calendarType,
      year,
      month,
      day,
      isLeapMonth,
      hour,
      minute,
      unknownTime,
      useTrueSolarTime,
    },
  };
}

function formatChartShorthand(chart: SajuChart): string {
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

function rehydrateMemberSeeds(rawSeeds: unknown): RelationMember[] {
  if (!Array.isArray(rawSeeds)) return [];
  const list: RelationMember[] = [];

  for (const item of rawSeeds.slice(0, MAX_MEMBERS)) {
    if (!isPlainObject(item)) continue;
    const id = sanitizeText(item.id, 48) || `m-${list.length + 1}`;
    const name = sanitizeText(item.name, 20) || '무명';
    const shorthand = sanitizeText(item.shorthand, 24);
    const sourceRaw = item.source;
    const source: RelationMember['source'] =
      sourceRaw === 'birth' || sourceRaw === 'my-report' ? sourceRaw : 'manual';
    const isSample = Boolean(item.isSample);

    const parsed = parseManseryeokCode(shorthand, 'hour-first');
    if (parsed.ok) {
      list.push(buildRelationMemberFromRaw(id, name, parsed.raw, source, isSample));
    }
  }

  return list;
}

function sanitizeOrderMode(value: unknown): PillarOrderMode {
  return value === 'year-first' ? 'year-first' : 'hour-first';
}

// ---------- Framework-Agnostic Endpoint Handlers ----------

export interface ApiResult {
  status: number;
  payload: Record<string, unknown>;
}

export function handleReportRequest(body: unknown): ApiResult {
  if (!isPlainObject(body)) {
    return { status: 400, payload: { ok: false, error: '잘못된 요청 형식입니다.' } };
  }

  const validated = validateBirthInput(body.input);
  if (!validated.ok) {
    return { status: 400, payload: { ok: false, error: validated.error } };
  }

  try {
    const chart = calculateSajuChart(validated.input);
    const report = generateReadingReport(chart);
    const selfMember = createMemberFromSajuChart(chart);
    return {
      status: 200,
      payload: { ok: true, report, selfMember },
    };
  } catch (err) {
    return {
      status: 400,
      payload: {
        ok: false,
        error: err instanceof Error ? err.message : '리포트 계산 중 오류가 발생했습니다.',
      },
    };
  }
}

export function handleChartSummaryRequest(body: unknown): ApiResult {
  if (!isPlainObject(body)) {
    return { status: 400, payload: { ok: false, error: '잘못된 요청 형식입니다.' } };
  }

  const validated = validateBirthInput(body.input);
  if (!validated.ok) {
    return { status: 400, payload: { ok: false, error: validated.error } };
  }

  try {
    const input = validated.input;
    const chart = calculateSajuChart(input);
    const shorthand = formatChartShorthand(chart);
    const cleanName = input.name || `${chart.dayPillarCode}일주`;
    const calLabel =
      input.calendarType === 'lunar' ? (input.isLeapMonth ? '음력(윤)' : '음력') : '양력';
    const datePart = `${calLabel} ${input.year}.${String(input.month).padStart(2, '0')}.${String(input.day).padStart(2, '0')}`;
    const timePart = input.unknownTime
      ? '시간 미상'
      : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;
    const genderPart = input.gender === 'female' ? '여명' : '남명';

    const summary: ChartLedgerSummary = {
      cleanName,
      shorthand,
      dayPillarCode: chart.dayPillarCode,
      dayPillarHanja: chart.pillars.day.ganjiHanja,
      dayElement: chart.dayMaster.element,
      caption: `${datePart} · ${timePart} · ${genderPart}`,
    };

    return { status: 200, payload: { ok: true, summary } };
  } catch (err) {
    return {
      status: 400,
      payload: {
        ok: false,
        error: err instanceof Error ? err.message : '만세력 요약 계산 중 오류가 발생했습니다.',
      },
    };
  }
}

export function handleRelationshipRequest(body: unknown): ApiResult {
  if (!isPlainObject(body) || typeof body.action !== 'string') {
    return { status: 400, payload: { ok: false, error: '잘못된 관계도 요청입니다.' } };
  }

  const action = body.action;

  if (action === 'sample') {
    const members = createSampleRelationMembers();
    const groupReport = analyzeGroupChemistry(members);
    return {
      status: 200,
      payload: {
        ok: true,
        members,
        batchText: SAMPLE_RELATION_BATCH_TEXT,
        groupReport,
      },
    };
  }

  if (action === 'parse-single') {
    const existing = rehydrateMemberSeeds(body.existingMembers as MemberSeed[]);
    if (existing.length >= MAX_MEMBERS) {
      return {
        status: 400,
        payload: {
          ok: false,
          error: `한눈에 비교할 수 있도록 최대 ${MAX_MEMBERS}명까지 등록할 수 있습니다.`,
        },
      };
    }

    const id = sanitizeText(body.id, 48) || `m-${Date.now()}`;
    const fallbackLabel = String.fromCharCode(65 + (existing.length % 26));
    const name = sanitizeText(body.name, 16) || `친구 ${fallbackLabel}`;
    const code = sanitizeText(body.code, 40);
    const orderMode = sanitizeOrderMode(body.orderMode);

    const created = createMemberFromCode(id, name, code, orderMode);
    if (!created.ok) {
      return { status: 400, payload: { ok: false, error: created.error } };
    }

    const members = [...existing, created.member].slice(0, MAX_MEMBERS);
    const groupReport = analyzeGroupChemistry(members);
    return {
      status: 200,
      payload: {
        ok: true,
        members,
        addedMember: created.member,
        groupReport,
      },
    };
  }

  if (action === 'parse-batch') {
    const rawBatch = typeof body.batchText === 'string' ? body.batchText : '';
    if (rawBatch.length > MAX_BATCH_TEXT_LENGTH) {
      return {
        status: 400,
        payload: { ok: false, errors: ['일괄 입력 글자 수가 너무 깁니다. 8명 이내로 입력해 주세요.'] },
      };
    }

    const trimmedBatch = rawBatch
      .split(/\r?\n/)
      .slice(0, MAX_BATCH_LINES)
      .map((l) => sanitizeText(l, 80))
      .filter(Boolean)
      .join('\n');

    const orderMode = sanitizeOrderMode(body.orderMode);
    const { members: parsed, errors } = parseBatchMembersText(trimmedBatch, orderMode);

    if (parsed.length === 0) {
      return {
        status: 400,
        payload: {
          ok: false,
          errors:
            errors.length > 0
              ? errors
              : ['해석할 만세력 줄을 입력해 주세요. 예: 김봄 계병무경사술자술'],
        },
      };
    }

    const base = rehydrateMemberSeeds(body.baseMembers as MemberSeed[]);
    const members = [...base, ...parsed].slice(0, MAX_MEMBERS);
    const groupReport = analyzeGroupChemistry(members);
    return {
      status: 200,
      payload: {
        ok: true,
        members,
        parsedCount: parsed.length,
        errors,
        groupReport,
      },
    };
  }

  if (action === 'from-birth') {
    const existing = rehydrateMemberSeeds(body.existingMembers as MemberSeed[]);
    if (existing.length >= MAX_MEMBERS) {
      return {
        status: 400,
        payload: { ok: false, error: `최대 ${MAX_MEMBERS}명까지 등록할 수 있습니다.` },
      };
    }

    const validated = validateBirthInput(body.input);
    if (!validated.ok) {
      return { status: 400, payload: { ok: false, error: validated.error } };
    }

    const id = sanitizeText(body.id, 48) || `b-${Date.now()}`;
    const created = createMemberFromBirthInput(id, validated.input);
    if (!created.ok) {
      return { status: 400, payload: { ok: false, error: created.error } };
    }

    const members = [...existing, created.member].slice(0, MAX_MEMBERS);
    const groupReport = analyzeGroupChemistry(members);
    return {
      status: 200,
      payload: {
        ok: true,
        members,
        addedMember: created.member,
        groupReport,
      },
    };
  }

  if (action === 'from-ledger') {
    const existing = rehydrateMemberSeeds(body.existingMembers as MemberSeed[]);
    const rawEntries = Array.isArray(body.entries) ? body.entries.slice(0, MAX_MEMBERS) : [];
    const added: RelationMember[] = [];

    for (const item of rawEntries) {
      if (!isPlainObject(item)) continue;
      const entryId = sanitizeText(item.id, 48) || `${Date.now()}`;
      const name = sanitizeText(item.name, 20) || '무명';
      const shorthand = sanitizeText(item.shorthand, 24);
      const already = [...existing, ...added].some(
        (m) => m.name === name && m.shorthand === shorthand
      );
      if (already) continue;

      if (item.kind === 'birth' && item.birthInput) {
        const v = validateBirthInput(item.birthInput);
        if (v.ok) {
          const built = createMemberFromBirthInput(`ledger-${entryId}`, v.input);
          if (built.ok) {
            added.push(built.member);
            continue;
          }
        }
      }

      const fromCode = createMemberFromCode(`ledger-${entryId}`, name, shorthand, 'hour-first');
      if (fromCode.ok) {
        added.push(fromCode.member);
      }
    }

    const members = [...existing, ...added].slice(0, MAX_MEMBERS);
    const groupReport = analyzeGroupChemistry(members);
    return {
      status: 200,
      payload: {
        ok: true,
        members,
        groupReport,
      },
    };
  }

  if (action === 'analyze') {
    const members = rehydrateMemberSeeds(body.members as MemberSeed[]);
    const groupReport = analyzeGroupChemistry(members);
    return {
      status: 200,
      payload: {
        ok: true,
        members,
        groupReport,
      },
    };
  }

  return { status: 400, payload: { ok: false, error: '지원하지 않는 관계도 동작입니다.' } };
}
