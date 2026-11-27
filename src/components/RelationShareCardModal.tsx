import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toPng } from 'html-to-image';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Images,
  Loader2,
  Share2,
  X,
} from 'lucide-react';
import { ELEMENT_META } from '../constants/uiMeta';
import type {
  GroupChemistryReport,
  PairCompatibility,
  RelationMember,
} from '../types/saju';
import { computeEdgeLabelPositions } from '../utils/graphLabelLayout';

export type RelationShareCardId = 'pair' | 'group';

interface RelationShareCardModalProps {
  open: boolean;
  members: RelationMember[];
  groupReport: GroupChemistryReport;
  activePair: PairCompatibility;
  initialCard: RelationShareCardId;
  onClose: () => void;
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

const CARD_DEFS = [
  { id: 'pair', num: '01', label: '1:1 궁합', fileSlug: '1대1궁합' },
  { id: 'group', num: '02', label: '모임 관계도', fileSlug: '모임관계도' },
] as const;

function formatDayPillar(member: RelationMember): string {
  return `${member.pillars.day.ganjiHangul}(${member.pillars.day.ganjiHanja})`;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strips member names from prose sentences when the privacy switch ("이름 넣기") is OFF,
 * replacing them cleanly with their Day Pillar label (e.g. "병술일주").
 */
function anonymizePairText(text: string, pair: PairCompatibility): string {
  let result = text;
  const replacements = [pair.a, pair.b]
    .map((m) => ({
      name: m.name.trim(),
      label: `${m.dayPillarCode}일주`,
    }))
    .filter((r) => r.name.length > 0 && r.name !== r.label)
    .sort((x, y) => y.name.length - x.name.length);

  for (const { name, label } of replacements) {
    const pattern = new RegExp(escapeRegExp(name), 'g');
    result = result.replace(pattern, label);
  }
  return result.replace(/일주일주/g, '일주');
}

function StaticGroupGraphSvg({
  members,
  pairs,
  includeNames,
}: {
  members: RelationMember[];
  pairs: PairCompatibility[];
  includeNames: boolean;
}) {
  const width = 760;
  const height = 470;
  const cx = width / 2;
  const cy = height / 2;
  const radius =
    members.length === 2
      ? 195
      : members.length <= 4
        ? 158
        : members.length <= 5
          ? 174
          : 182;
  const nodeRadius =
    members.length <= 4 ? 54 : members.length <= 5 ? 46 : members.length <= 6 ? 40 : 34;
  const labelW = members.length <= 5 ? 66 : members.length === 6 ? 56 : 48;
  const labelH = members.length <= 5 ? 28 : members.length === 6 ? 24 : 20;
  const labelFontSize = members.length <= 5 ? 14 : members.length === 6 ? 12.5 : 11;

  const positions = new Map<string, { x: number; y: number }>();
  const indexById = new Map<string, number>();
  const nodePositions: { x: number; y: number }[] = [];
  members.forEach((m, idx) => {
    const angle =
      members.length === 2
        ? idx === 0
          ? Math.PI
          : 0
        : -Math.PI / 2 + (idx * 2 * Math.PI) / members.length;
    const pt = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
    positions.set(m.id, pt);
    indexById.set(m.id, idx);
    nodePositions.push(pt);
  });

  const edgeInputs = pairs
    .map((pair) => {
      const pA = positions.get(pair.a.id);
      const pB = positions.get(pair.b.id);
      const aIndex = indexById.get(pair.a.id);
      const bIndex = indexById.get(pair.b.id);
      if (!pA || !pB || aIndex === undefined || bIndex === undefined) return null;
      return { key: pair.pairKey, aIndex, bIndex, pA, pB };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const labelPositions = computeEdgeLabelPositions({
    memberCount: members.length,
    nodePositions,
    nodeRadius,
    edges: edgeInputs,
    labelWidth: labelW,
    labelHeight: labelH,
    viewWidth: width,
    viewHeight: height,
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="모임 사주 관계도"
    >
      {members.length >= 3 && (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#EDEDED"
          strokeWidth={1.4}
        />
      )}

      {/* Draw all relationship lines first so score tags always render cleanly above crossing lines */}
      {pairs.map((pair) => {
        const pA = positions.get(pair.a.id);
        const pB = positions.get(pair.b.id);
        if (!pA || !pB) return null;

        const isHarmony = pair.score >= 76;
        const isTension = pair.score < 58;
        const strokeColor = isTension ? '#9A3412' : isHarmony ? '#141414' : '#A8A8A8';
        const strokeWidth = isHarmony ? 2.4 : 1.7;
        const dashArray = isTension ? '7 5' : undefined;

        return (
          <line
            key={`${pair.pairKey}-line`}
            x1={pA.x}
            y1={pA.y}
            x2={pB.x}
            y2={pB.y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
          />
        );
      })}

      {/* Draw non-overlapping score tags above lines */}
      {pairs.map((pair) => {
        const pt = labelPositions.get(pair.pairKey);
        if (!pt) return null;

        const isHarmony = pair.score >= 76;
        const isTension = pair.score < 58;

        return (
          <g key={`${pair.pairKey}-label`} transform={`translate(${pt.x}, ${pt.y})`}>
            <rect
              x={-labelW / 2}
              y={-labelH / 2}
              width={labelW}
              height={labelH}
              rx={4}
              fill="#FFFFFF"
              stroke={isTension ? '#D8B4A6' : isHarmony ? '#141414' : '#D4D4D4'}
              strokeWidth={1.3}
            />
            <text
              x={0}
              y={Math.round(labelFontSize * 0.36)}
              textAnchor="middle"
              fontSize={labelFontSize}
              fontFamily="IBM Plex Mono, Noto Sans KR, monospace"
              fontWeight={isHarmony ? 600 : 500}
              fill={isTension ? '#9A3412' : '#141414'}
            >
              {`${pair.score}점`}
            </text>
          </g>
        );
      })}

      {members.map((member) => {
        const pos = positions.get(member.id);
        if (!pos) return null;

        const elMeta = ELEMENT_META[member.dayMaster.element];
        const shortName =
          member.name.length > 5 ? `${member.name.slice(0, 4)}…` : member.name;
        const topText = includeNames ? shortName : member.dayPillarCode;
        const bottomText = includeNames
          ? `${member.dayPillarCode} · ${elMeta.hangul}`
          : `${elMeta.hangul}(${elMeta.hanja})`;

        return (
          <g key={member.id} transform={`translate(${pos.x}, ${pos.y})`}>
            <circle
              r={nodeRadius}
              fill="#FFFFFF"
              stroke={elMeta.color}
              strokeWidth={2.2}
            />
            <text
              x={0}
              y={members.length <= 6 ? -5 : -4}
              textAnchor="middle"
              fontSize={members.length <= 5 ? 19 : members.length === 6 ? 15.5 : 13.5}
              fontWeight={700}
              fill="#141414"
              fontFamily="Gowun Batang, Georgia, serif"
            >
              {topText}
            </text>
            <text
              x={0}
              y={members.length <= 6 ? 18 : 14}
              textAnchor="middle"
              fontSize={members.length <= 5 ? 14 : members.length === 6 ? 12 : 10.5}
              fontWeight={500}
              fill={elMeta.color}
              fontFamily="Noto Sans KR, sans-serif"
            >
              {bottomText}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface RelationShareCardCanvasProps {
  cardId: RelationShareCardId;
  members: RelationMember[];
  groupReport: GroupChemistryReport;
  activePair: PairCompatibility;
  includeNames: boolean;
}

const RelationShareCardCanvas = forwardRef<HTMLDivElement, RelationShareCardCanvasProps>(
  function RelationShareCardCanvas(
    { cardId, members, groupReport, activePair, includeNames },
    ref
  ) {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [shrinkStep, setShrinkStep] = useState(0);

    const cardDef = CARD_DEFS.find((d) => d.id === cardId) ?? CARD_DEFS[0];

    const pairDayPillarHeading = `${formatDayPillar(activePair.a)} × ${formatDayPillar(activePair.b)}`;
    const pairNamesLine = `${activePair.a.name} × ${activePair.b.name}`;

    const displayRelationTitle = useMemo(() => {
      return includeNames
        ? activePair.relationTitle
        : anonymizePairText(activePair.relationTitle, activePair);
    }, [activePair, includeNames]);

    const displayHarmonyPoints = useMemo(() => {
      return activePair.harmonyPoints
        .slice(0, 2)
        .map((pt) => (includeNames ? pt : anonymizePairText(pt, activePair)));
    }, [activePair, includeNames]);

    useLayoutEffect(() => {
      setShrinkStep(0);
    }, [cardId, activePair, groupReport, includeNames]);

    useLayoutEffect(() => {
      const el = contentRef.current;
      if (!el) return;
      if (shrinkStep < 4 && el.scrollHeight > el.clientHeight + 2) {
        setShrinkStep((prev) => prev + 1);
      }
    }, [shrinkStep, cardId, activePair, groupReport, includeNames]);

    const fontScale = [1, 0.92, 0.85, 0.78, 0.72][shrinkStep] ?? 0.72;
    const fs = (px: number) => `${Math.round(px * fontScale)}px`;

    const formatExtremePairPrimary = (pair: PairCompatibility) =>
      includeNames
        ? `${pair.a.name} × ${pair.b.name}`
        : `${formatDayPillar(pair.a)} × ${formatDayPillar(pair.b)}`;

    const formatExtremePairSub = (pair: PairCompatibility) =>
      includeNames
        ? `${pair.a.dayPillarCode} · ${pair.b.dayPillarCode} · ${pair.shortKeyword}`
        : pair.shortKeyword;

    return (
      <div
        ref={ref}
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          backgroundColor: '#FFFFFF',
          color: '#141414',
          fontFamily: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '76px 84px 62px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}
      >
        {/* Top Hairline Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '26px',
            borderBottom: '1px solid #E5E5E5',
            flexShrink: 0,
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '23px',
              color: '#595959',
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {cardDef.num} · {cardDef.label}
          </div>
          <div
            style={{
              fontSize: '22px',
              color: '#737373',
              fontFamily: '"Gowun Batang", Georgia, serif',
              textAlign: 'right',
            }}
          >
            {cardId === 'pair'
              ? includeNames
                ? pairNamesLine
                : `${activePair.a.dayPillarCode} × ${activePair.b.dayPillarCode}`
              : `${members.length}인 사주 관계도`}
          </div>
        </div>

        {/* Main Card Body */}
        <div
          ref={contentRef}
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '36px',
            paddingBottom: '36px',
          }}
        >
          {cardId === 'pair' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '38px' }}>
              {/* Pair Day Pillars & Optional Names */}
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: fs(24),
                    color: '#6E6E6E',
                    margin: '0 0 14px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {includeNames ? `${pairNamesLine} · 1:1 명리 궁합` : '1:1 명리 궁합'}
                </p>
                <h2
                  style={{
                    fontFamily: '"Gowun Batang", Georgia, serif',
                    fontSize: fs(56),
                    fontWeight: 700,
                    lineHeight: 1.24,
                    color: '#141414',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {pairDayPillarHeading}
                </h2>
              </div>

              {/* Large Score Block */}
              <div
                style={{
                  borderTop: '1px solid #141414',
                  borderBottom: '1px solid #E5E5E5',
                  padding: '38px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '10px',
                    lineHeight: 1,
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Gowun Batang", Georgia, serif',
                      fontSize: fs(122),
                      fontWeight: 700,
                      color: activePair.score < 58 ? '#9A3412' : '#141414',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {activePair.score}
                  </span>
                  <span
                    style={{
                      fontFamily: '"Gowun Batang", Georgia, serif',
                      fontSize: fs(42),
                      fontWeight: 700,
                      color: '#595959',
                    }}
                  >
                    점
                  </span>
                </div>

                <div
                  style={{
                    marginTop: '18px',
                    fontSize: fs(24),
                    fontWeight: 600,
                    color: '#525252',
                    letterSpacing: '0.02em',
                  }}
                >
                  {activePair.relationTier} · {activePair.aToB.tenGod}·{activePair.bToA.tenGod}
                </div>

                <p
                  style={{
                    marginTop: '22px',
                    marginBottom: 0,
                    fontFamily: '"Gowun Batang", Georgia, serif',
                    fontSize: fs(34),
                    lineHeight: 1.55,
                    color: '#141414',
                    maxWidth: '840px',
                  }}
                >
                  “{displayRelationTitle}”
                </p>
              </div>

              {/* 2 Harmony Points */}
              <div>
                <div
                  style={{
                    fontSize: fs(22),
                    fontWeight: 600,
                    color: '#14532D',
                    marginBottom: '20px',
                    letterSpacing: '0.01em',
                  }}
                >
                  잘 맞는 지점
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {displayHarmonyPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '18px',
                        padding: '22px 26px',
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #E5E5E5',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: fs(22),
                          color: '#737373',
                          lineHeight: 1.6,
                          flexShrink: 0,
                        }}
                      >
                        0{idx + 1}
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontSize: fs(25),
                          lineHeight: 1.6,
                          color: '#262626',
                        }}
                      >
                        {pt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {cardId === 'group' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Group Temperament Headline */}
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: fs(23),
                    color: '#6E6E6E',
                    margin: '0 0 12px',
                  }}
                >
                  {members.length}인 합산 오행 · 모임 성향
                </p>
                <h2
                  style={{
                    fontFamily: '"Gowun Batang", Georgia, serif',
                    fontSize: fs(46),
                    fontWeight: 700,
                    lineHeight: 1.32,
                    color: '#141414',
                    margin: 0,
                  }}
                >
                  {groupReport.groupTemperamentTitle}
                </h2>
              </div>

              {/* Relationship Graph Frame */}
              <div
                style={{
                  border: '1px solid #E5E5E5',
                  backgroundColor: '#FFFFFF',
                  padding: '20px 24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '100%', maxWidth: '760px' }}>
                  <StaticGroupGraphSvg
                    members={members}
                    pairs={groupReport.pairs}
                    includeNames={includeNames}
                  />
                </div>
                <div
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '28px',
                    fontSize: '18px',
                    color: '#6E6E6E',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '2.5px',
                        backgroundColor: '#141414',
                      }}
                    />
                    깊은 합 (76점↑)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '2px',
                        backgroundColor: '#A8A8A8',
                      }}
                    />
                    안정 (58~75점)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '24px',
                        borderTop: '2px dashed #9A3412',
                      }}
                    />
                    조율 필요 (57점↓)
                  </span>
                </div>
              </div>

              {/* Best Pair & Tension Pair Hairline Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderTop: '1px solid #141414',
                  borderBottom: '1px solid #E5E5E5',
                }}
              >
                <div
                  style={{
                    padding: '28px 28px 28px 0',
                    borderRight: '1px solid #E5E5E5',
                  }}
                >
                  <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                    최고 궁합 조합
                  </div>
                  {groupReport.bestPair ? (
                    <>
                      <div
                        style={{
                          fontFamily: '"Gowun Batang", Georgia, serif',
                          fontSize: fs(30),
                          fontWeight: 700,
                          color: '#141414',
                          lineHeight: 1.35,
                        }}
                      >
                        {formatExtremePairPrimary(groupReport.bestPair)}
                      </div>
                      <div
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: fs(24),
                            fontWeight: 600,
                            color: '#14532D',
                            fontVariantNumeric: 'tabular-nums',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            display: 'inline-block',
                          }}
                        >
                          {`${groupReport.bestPair.score}점`}
                        </span>
                        <span style={{ fontSize: fs(21), color: '#525252' }}>
                          {formatExtremePairSub(groupReport.bestPair)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: fs(24), color: '#525252' }}>—</div>
                  )}
                </div>

                <div style={{ padding: '28px 0 28px 28px' }}>
                  {groupReport.tensionPair ? (
                    <>
                      <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                        가장 노력이 필요한 조합
                      </div>
                      <div
                        style={{
                          fontFamily: '"Gowun Batang", Georgia, serif',
                          fontSize: fs(30),
                          fontWeight: 700,
                          color: '#141414',
                          lineHeight: 1.35,
                        }}
                      >
                        {formatExtremePairPrimary(groupReport.tensionPair)}
                      </div>
                      <div
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: fs(24),
                            fontWeight: 600,
                            color: '#9A3412',
                            fontVariantNumeric: 'tabular-nums',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            display: 'inline-block',
                          }}
                        >
                          {`${groupReport.tensionPair.score}점`}
                        </span>
                        <span style={{ fontSize: fs(21), color: '#525252' }}>
                          {formatExtremePairSub(groupReport.tensionPair)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                        모임 중심 · 보완 오행
                      </div>
                      <div
                        style={{
                          fontFamily: '"Gowun Batang", Georgia, serif',
                          fontSize: fs(30),
                          fontWeight: 700,
                          color: '#141414',
                          lineHeight: 1.35,
                        }}
                      >
                        중심 {ELEMENT_META[groupReport.strongestGroupElement].hangul}(
                        {ELEMENT_META[groupReport.strongestGroupElement].hanja}) · 희소{' '}
                        {ELEMENT_META[groupReport.weakestGroupElement].hangul}(
                        {ELEMENT_META[groupReport.weakestGroupElement].hanja})
                      </div>
                      <div style={{ marginTop: '10px', fontSize: fs(21), color: '#525252' }}>
                        3인 이상 시 조합 비교 표시
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Common Bottom Brand Line */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <img
            src="/favicon.svg"
            alt=""
            width={28}
            height={28}
            crossOrigin="anonymous"
            style={{ width: '28px', height: '28px', display: 'block', flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: '23px',
              color: '#6E6E6E',
              letterSpacing: '0.01em',
            }}
          >
            차사 재(災) 명리 · chasaju.web.app
          </span>
        </div>
      </div>
    );
  }
);

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function waitForNodeAssets(node: HTMLElement): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    })
  );
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

export function RelationShareCardModal({
  open,
  members,
  groupReport,
  activePair,
  initialCard,
  onClose,
}: RelationShareCardModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialCard === 'group' ? 1 : 0);
  const [includeNames, setIncludeNames] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [busyMode, setBusyMode] = useState<null | 'single' | 'all' | 'share'>(null);
  const [busyProgress, setBusyProgress] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [previewWidth, setPreviewWidth] = useState(360);

  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const exportRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function'
      ) {
        const probeFile = new File([new Uint8Array([0])], 'probe.png', {
          type: 'image/png',
        });
        setCanShareFiles(navigator.canShare({ files: [probeFile] }));
      } else {
        setCanShareFiles(false);
      }
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(initialCard === 'group' ? 1 : 0);
    setStatusMessage('');
  }, [open, initialCard]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev < CARD_DEFS.length - 1 ? prev + 1 : prev));
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = previewFrameRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setPreviewWidth(rect.width);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  const getCardFilename = useCallback(
    (idx: number) => {
      const def = CARD_DEFS[idx] ?? CARD_DEFS[0];
      if (def.id === 'pair') {
        return `차사재명리_${activePair.a.dayPillarCode}x${activePair.b.dayPillarCode}_${def.fileSlug}.png`;
      }
      return `차사재명리_${members.length}인_${def.fileSlug}.png`;
    },
    [activePair.a.dayPillarCode, activePair.b.dayPillarCode, members.length]
  );

  const renderCardToPngDataUrl = useCallback(async (idx: number): Promise<string> => {
    const node = exportRefs.current[idx];
    if (!node) {
      throw new Error('카드를 준비하는 중입니다. 잠시 후 다시 시도해 주세요.');
    }
    await waitForNodeAssets(node);
    return toPng(node, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      pixelRatio: 1,
      backgroundColor: '#FFFFFF',
      cacheBust: true,
    });
  }, []);

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCurrent = async () => {
    if (busyMode) return;
    setBusyMode('single');
    setStatusMessage('');
    try {
      const dataUrl = await renderCardToPngDataUrl(activeIndex);
      const filename = getCardFilename(activeIndex);
      triggerDownload(dataUrl, filename);
      setStatusMessage(`${CARD_DEFS[activeIndex].label} 카드를 저장했습니다.`);
    } catch {
      setStatusMessage('이미지 생성 중 잠시 문제가 생겼습니다. 다시 시도해 주세요.');
    } finally {
      setBusyMode(null);
    }
  };

  const handleDownloadAll = async () => {
    if (busyMode) return;
    setBusyMode('all');
    setStatusMessage('');
    try {
      for (let i = 0; i < CARD_DEFS.length; i += 1) {
        setBusyProgress(`${i + 1}/${CARD_DEFS.length}`);
        const dataUrl = await renderCardToPngDataUrl(i);
        triggerDownload(dataUrl, getCardFilename(i));
        if (i < CARD_DEFS.length - 1) {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 260));
        }
      }
      setStatusMessage('2장의 관계도 공유 카드를 모두 저장했습니다.');
    } catch {
      setStatusMessage('이미지 저장 중 일부가 중단되었습니다. 다시 시도해 주세요.');
    } finally {
      setBusyMode(null);
      setBusyProgress('');
    }
  };

  const handleWebShare = async () => {
    if (busyMode || !canShareFiles) return;
    setBusyMode('share');
    setStatusMessage('');
    try {
      const dataUrl = await renderCardToPngDataUrl(activeIndex);
      const filename = getCardFilename(activeIndex);
      const blob = dataUrlToBlob(dataUrl);
      const file = new File([blob], filename, { type: 'image/png' });
      if (!navigator.canShare({ files: [file] })) {
        triggerDownload(dataUrl, filename);
        setStatusMessage('공유 창을 지원하지 않아 이미지 파일로 저장했습니다.');
        return;
      }
      await navigator.share({
        files: [file],
        title: `차사 재(災) 명리 · ${CARD_DEFS[activeIndex].label}`,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setStatusMessage('공유 중 문제가 발생했습니다. 이미지 저장을 이용해 주세요.');
    } finally {
      setBusyMode(null);
    }
  };

  if (!open) return null;

  const activeDef = CARD_DEFS[activeIndex] ?? CARD_DEFS[0];
  const previewScale = previewWidth / CARD_WIDTH;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5 no-print"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="relation-share-card-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[94vh] overflow-y-auto bg-white border border-[#141414] p-5 sm:p-7 shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFEFEF]">
          <div>
            <p className="text-xs text-[#6E6E6E] tabular-nums">
              사주 관계도 공유 카드 · 1080×1350 (4:5)
            </p>
            <h2
              id="relation-share-card-modal-title"
              className="mt-0.5 font-editorial text-lg sm:text-xl font-bold text-[#141414]"
            >
              {activeDef.id === 'pair'
                ? `${activePair.a.dayPillarCode} × ${activePair.b.dayPillarCode} 1:1 궁합 카드`
                : `${members.length}인 모임 관계도 카드`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="공유 카드 창 닫기"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 inline-flex items-center justify-center text-[#6E6E6E] hover:text-[#141414] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Selector Tabs (2 Cards) */}
        <div
          role="tablist"
          aria-label="관계도 공유 카드 선택"
          className="mt-4 grid grid-cols-2 border-t border-l border-[#E5E5E5]"
        >
          {CARD_DEFS.map((card, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={card.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveIndex(idx)}
                className={`min-h-[44px] px-3 py-2 text-center border-r border-b border-[#E5E5E5] transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#141414] text-white'
                    : 'bg-white text-[#595959] hover:bg-[#FAFAFA] hover:text-[#141414]'
                }`}
              >
                <span
                  className={`block font-mono text-[10px] tabular-nums ${
                    isSelected ? 'text-[#D4D4D4]' : 'text-[#737373]'
                  }`}
                >
                  {card.num}
                </span>
                <span className="block text-xs font-medium truncate">{card.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live 4:5 Scaled Preview Carousel */}
        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeIndex === 0}
            aria-label="이전 카드 보기"
            className="min-h-[40px] min-w-[36px] sm:min-w-[40px] inline-flex items-center justify-center border border-[#E5E5E5] bg-white text-[#141414] rounded-md hover:border-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={previewFrameRef}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
              const diff = touchStartX.current - endX;
              touchStartX.current = null;
              if (Math.abs(diff) < 40) return;
              if (diff > 0 && activeIndex < CARD_DEFS.length - 1) {
                setActiveIndex((prev) => prev + 1);
              } else if (diff < 0 && activeIndex > 0) {
                setActiveIndex((prev) => prev - 1);
              }
            }}
            className="w-full max-w-[340px] sm:max-w-[360px] aspect-[4/5] border border-[#E5E5E5] bg-white overflow-hidden relative select-none"
          >
            <div
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
            >
              <RelationShareCardCanvas
                cardId={activeDef.id}
                members={members}
                groupReport={groupReport}
                activePair={activePair}
                includeNames={includeNames}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => Math.min(CARD_DEFS.length - 1, prev + 1))
            }
            disabled={activeIndex === CARD_DEFS.length - 1}
            aria-label="다음 카드 보기"
            className="min-h-[40px] min-w-[36px] sm:min-w-[40px] inline-flex items-center justify-center border border-[#E5E5E5] bg-white text-[#141414] rounded-md hover:border-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy Toggle Row ("이름 넣기" OFF by default; birth dates NEVER shown) */}
        <div className="mt-4 py-3 border-y border-[#EFEFEF] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span
              id="relation-share-privacy-label"
              className="text-xs font-medium text-[#141414]"
            >
              이름 넣기
            </span>
            <p className="text-[11px] text-[#6E6E6E]">
              기본으로 꺼져 있어 일주만 표시됩니다. 생년월일은 어떤 카드에도 들어가지 않습니다.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={includeNames}
            aria-labelledby="relation-share-privacy-label"
            onClick={() => setIncludeNames((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
              includeNames ? 'bg-[#141414]' : 'bg-[#D4D4D4]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeNames ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Export & Share Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {canShareFiles && (
            <button
              type="button"
              disabled={busyMode !== null}
              onClick={handleWebShare}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              {busyMode === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{busyMode === 'share' ? '준비 중…' : '공유하기'}</span>
            </button>
          )}

          <button
            type="button"
            disabled={busyMode !== null}
            onClick={handleDownloadCurrent}
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-md disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap ${
              canShareFiles
                ? 'text-[#141414] bg-white border border-[#141414] hover:bg-[#141414] hover:text-white'
                : 'text-white bg-[#141414] hover:bg-[#2E2E2E]'
            }`}
          >
            {busyMode === 'single' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{busyMode === 'single' ? '저장 중…' : '이미지 저장'}</span>
          </button>

          <button
            type="button"
            disabled={busyMode !== null}
            onClick={handleDownloadAll}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#141414] bg-[#FAFAFA] border border-[#D4D4D4] rounded-md hover:border-[#141414] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
          >
            {busyMode === 'all' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Images className="w-3.5 h-3.5" />
            )}
            <span>
              {busyMode === 'all' ? `저장 중 (${busyProgress})` : '2장 모두 저장'}
            </span>
          </button>
        </div>

        {statusMessage && (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 text-center text-xs text-[#525252]"
          >
            {statusMessage}
          </p>
        )}
      </div>

      {/* Off-screen Full-Resolution 1080×1350 Export Canvases */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        {CARD_DEFS.map((card, idx) => (
          <RelationShareCardCanvas
            key={card.id}
            ref={(el) => {
              exportRefs.current[idx] = el;
            }}
            cardId={card.id}
            members={members}
            groupReport={groupReport}
            activePair={activePair}
            includeNames={includeNames}
          />
        ))}
      </div>
    </div>
  );
}
