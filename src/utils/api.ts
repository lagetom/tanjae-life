import type {
  BirthInput,
  ChartLedgerSummary,
  GroupChemistryReport,
  MemberSeed,
  PillarOrderMode,
  ReadingReport,
  RelationMember,
} from '../types/saju';

export interface LedgerRelationSeed {
  id: string;
  name: string;
  kind: 'birth' | 'shorthand';
  shorthand: string;
  birthInput?: BirthInput;
}

export type RelationshipApiRequest =
  | { action: 'sample' }
  | {
      action: 'parse-single';
      id: string;
      name: string;
      code: string;
      orderMode: PillarOrderMode;
      existingMembers: MemberSeed[];
    }
  | {
      action: 'parse-batch';
      batchText: string;
      orderMode: PillarOrderMode;
      baseMembers: MemberSeed[];
    }
  | {
      action: 'from-birth';
      id: string;
      input: BirthInput;
      existingMembers: MemberSeed[];
    }
  | {
      action: 'from-ledger';
      entries: LedgerRelationSeed[];
      existingMembers: MemberSeed[];
    }
  | {
      action: 'analyze';
      members: MemberSeed[];
    };

export interface RelationshipApiSuccess {
  ok: true;
  members: RelationMember[];
  groupReport: GroupChemistryReport;
  addedMember?: RelationMember;
  parsedCount?: number;
  errors?: string[];
  batchText?: string;
}

export interface RelationshipApiFailure {
  ok: false;
  error?: string;
  errors?: string[];
}

export type RelationshipApiResponse = RelationshipApiSuccess | RelationshipApiFailure;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'ChasaJaeClient',
    },
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    throw new Error('서버 응답을 읽는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (!res.ok) {
    const errObj = data as { error?: string; errors?: string[] } | null;
    if (res.status === 429) {
      throw new Error(
        errObj?.error || '요청이 잠시 몰렸습니다. 몇 초 뒤 다시 시도해 주세요.'
      );
    }
    if (errObj?.errors && errObj.errors.length > 0) {
      return data as T;
    }
    throw new Error(errObj?.error || '분석 요청을 처리하지 못했습니다.');
  }

  return data as T;
}

export async function fetchReadingReport(
  input: BirthInput
): Promise<{ report: ReadingReport; selfMember: RelationMember }> {
  const res = await postJson<
    | { ok: true; report: ReadingReport; selfMember: RelationMember }
    | { ok: false; error: string }
  >('/api/report', { input });

  if (!res.ok) {
    throw new Error(res.error || '리포트를 생성하지 못했습니다.');
  }
  return { report: res.report, selfMember: res.selfMember };
}

export async function fetchChartSummary(input: BirthInput): Promise<ChartLedgerSummary> {
  const res = await postJson<
    | { ok: true; summary: ChartLedgerSummary }
    | { ok: false; error: string }
  >('/api/chart-summary', { input });

  if (!res.ok) {
    throw new Error(res.error || '명부 정보를 계산하지 못했습니다.');
  }
  return res.summary;
}

export async function fetchRelationshipAction(
  payload: RelationshipApiRequest
): Promise<RelationshipApiResponse> {
  return postJson<RelationshipApiResponse>('/api/relationship', payload);
}

export function toMemberSeeds(members: RelationMember[]): MemberSeed[] {
  return members.map((m) => ({
    id: m.id,
    name: m.name,
    shorthand: m.shorthand,
    source: m.source,
    isSample: m.isSample,
  }));
}
