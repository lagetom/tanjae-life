import { ELEMENT_META, getPairKey } from '../constants/uiMeta';
import type { PairCompatibility, RelationMember } from '../types/saju';
import { computeEdgeLabelPositions } from '../utils/graphLabelLayout';

interface RelationshipGraphSvgProps {
  members: RelationMember[];
  pairs: PairCompatibility[];
  selectedPairKey: string | null;
  onSelectPair: (pairKey: string) => void;
}

export function RelationshipGraphSvg({
  members,
  pairs,
  selectedPairKey,
  onSelectPair,
}: RelationshipGraphSvgProps) {
  const width = 560;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const radius =
    members.length === 2
      ? 155
      : members.length <= 4
        ? 132
        : members.length <= 5
          ? 148
          : 154;
  const nodeRadius = members.length <= 5 ? 36 : members.length === 6 ? 30 : 27;
  const labelW = members.length <= 5 ? 52 : members.length === 6 ? 44 : 40;
  const labelH = members.length <= 5 ? 22 : members.length === 6 ? 19 : 17;
  const labelFontSize = members.length <= 5 ? 10.5 : members.length === 6 ? 9.5 : 8.5;

  // Position nodes evenly around circle (for 2 members, horizontal left/right; for 3+, start at top -90deg)
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
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[560px] h-auto select-none"
        role="img"
        aria-label="사주 관계도 연결망"
      >
        {/* Subtle outer guide circle */}
        {members.length >= 3 && (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth={1}
          />
        )}

        {/* Relationship Edge Lines (drawn beneath score tags) */}
        {pairs.map((pair) => {
          const pA = positions.get(pair.a.id);
          const pB = positions.get(pair.b.id);
          if (!pA || !pB) return null;

          const isSelected = pair.pairKey === selectedPairKey;
          const isHarmony = pair.score >= 76;
          const isTension = pair.score < 58;

          const strokeColor = isSelected
            ? '#141414'
            : isTension
              ? '#9A3412'
              : isHarmony
                ? '#262626'
                : '#B5B5B5';

          const strokeWidth = isSelected ? 2.5 : isHarmony ? 1.6 : 1.2;
          const dashArray = isTension ? '5 4' : undefined;

          return (
            <g
              key={`${pair.pairKey}-line`}
              onClick={() => onSelectPair(pair.pairKey)}
              className="cursor-pointer"
            >
              {/* Invisible wide hit area for easy clicking/tapping */}
              <line
                x1={pA.x}
                y1={pA.y}
                x2={pB.x}
                y2={pB.y}
                stroke="transparent"
                strokeWidth={22}
              />
              {/* Visible editorial hairline */}
              <line
                x1={pA.x}
                y1={pA.y}
                x2={pB.x}
                y2={pB.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                opacity={selectedPairKey && !isSelected ? 0.45 : 1}
              />
            </g>
          );
        })}

        {/* Non-overlapping Interactive Score Tags (rendered above lines) */}
        {pairs.map((pair) => {
          const pt = labelPositions.get(pair.pairKey);
          if (!pt) return null;

          const isSelected = pair.pairKey === selectedPairKey;
          const isTension = pair.score < 58;

          return (
            <g
              key={`${pair.pairKey}-label`}
              transform={`translate(${pt.x}, ${pt.y})`}
              onClick={() => onSelectPair(pair.pairKey)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`${pair.a.name}와 ${pair.b.name} 관계: ${pair.relationTier} (${pair.score}점)`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPair(pair.pairKey);
                }
              }}
            >
              <rect
                x={-labelW / 2}
                y={-labelH / 2}
                width={labelW}
                height={labelH}
                rx={3}
                fill={isSelected ? '#141414' : '#FFFFFF'}
                stroke={isSelected ? '#141414' : isTension ? '#D8B4A6' : '#D4D4D4'}
                strokeWidth={1}
              />
              <text
                x={0}
                y={Math.round(labelFontSize * 0.38)}
                textAnchor="middle"
                fontSize={labelFontSize}
                fontFamily="IBM Plex Mono, Noto Sans KR, monospace"
                fontWeight={isSelected ? 600 : 500}
                fill={isSelected ? '#FFFFFF' : isTension ? '#9A3412' : '#262626'}
              >
                {`${pair.score}점`}
              </text>
            </g>
          );
        })}

        {/* Member Nodes */}
        {members.map((member) => {
          const pos = positions.get(member.id);
          if (!pos) return null;

          const elMeta = ELEMENT_META[member.dayMaster.element];
          const isPartOfSelected = selectedPairKey
            ? selectedPairKey.split('__').includes(member.id)
            : false;

          const displayName =
            member.name.length > 5 ? `${member.name.slice(0, 4)}…` : member.name;

          const selectTopPairForMember = () => {
            const related = pairs
              .filter((p) => p.a.id === member.id || p.b.id === member.id)
              .sort((a, b) => b.score - a.score);
            if (related[0]) {
              onSelectPair(getPairKey(related[0].a.id, related[0].b.id));
            }
          };

          return (
            <g
              key={member.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={selectTopPairForMember}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectTopPairForMember();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${member.name} (${member.dayPillarCode}일주) 대표 관계 선택`}
              className="cursor-pointer"
            >
              {/* Expanded transparent touch target */}
              <circle r={Math.max(nodeRadius + 6, 36)} fill="transparent" />

              {/* Outer highlight ring if selected */}
              {isPartOfSelected && (
                <circle
                  r={nodeRadius + 4}
                  fill="none"
                  stroke="#141414"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              )}

              {/* Crisp white node body with subtle element border */}
              <circle
                r={nodeRadius}
                fill="#FFFFFF"
                stroke={isPartOfSelected ? '#141414' : elMeta.color}
                strokeWidth={isPartOfSelected ? 2 : 1.3}
              />

              {/* Member Name */}
              <text
                x={0}
                y={members.length <= 6 ? -5 : -4}
                textAnchor="middle"
                fontSize={members.length <= 5 ? 12.5 : members.length === 6 ? 11 : 10}
                fontWeight={700}
                fill="#141414"
                fontFamily="Gowun Batang, serif"
              >
                {displayName}
              </text>

              {/* Day Pillar + Element */}
              <text
                x={0}
                y={members.length <= 6 ? 12 : 10}
                textAnchor="middle"
                fontSize={members.length <= 5 ? 10 : 8.5}
                fontWeight={500}
                fill={elMeta.color}
                fontFamily="Noto Sans KR, sans-serif"
              >
                {member.dayPillarCode} · {elMeta.hangul}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Clean Legend (explicit text paired with line styles, never hue-only) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-[#666666]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-5 h-[2px] bg-[#141414]" aria-hidden="true" />
          <span>깊은 합 · 76점 이상</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-5 h-[1.5px] bg-[#B5B5B5]" aria-hidden="true" />
          <span>안정 · 58~75점</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-5 border-t border-dashed border-[#9A3412]"
            aria-hidden="true"
          />
          <span>자극 · 조율 필요 (57점 이하)</span>
        </span>
      </div>
    </div>
  );
}
