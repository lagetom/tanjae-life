import { useMemo } from 'react';
import {
  AstrologyChart,
  PlanetId,
  PlanetPlacement,
  WESTERN_ELEMENT_META,
  ZODIAC_SIGNS,
} from '../engine/astrology';

interface NatalWheelSvgProps {
  astrology: AstrologyChart;
  selectedPlanetId: PlanetId;
  onSelectPlanet: (id: PlanetId) => void;
}

const CX = 210;
const CY = 210;
const R_OUTER = 192;
const R_SIGN_INNER = 154;
const R_PLANET_TICK = 148;
const R_PLANET_LABEL = 124;
const R_ASPECT = 94;

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
}

/**
 * 경도(0° Aries = 0)를 천궁도 화면 각도로 변환
 * - 상승궁(ASC)이 있으면 ASC를 좌측 수평선(180°)에 배치 (전통 천궁도 표준)
 * - 출생 시간 미상 시 0° 양자리를 좌측(180°)에 배치
 * - 반시계 방향(Counter-clockwise)으로 황도 진행
 */
function lonToScreenAngle(lon: number, referenceLon: number): number {
  const rel = ((lon - referenceLon) % 360 + 360) % 360;
  return (180 + rel) % 360;
}

export function NatalWheelSvg({
  astrology,
  selectedPlanetId,
  onSelectPlanet,
}: NatalWheelSvgProps) {
  const referenceLon = astrology.ascendant ? astrology.ascendant.longitude : 0;

  // 행성 기호가 서로 겹치지 않도록 표시 각도만 미세 분산
  const displayPlacements = useMemo(() => {
    const items = astrology.placements
      .filter((p) => p.id !== 'ascendant')
      .map((p) => ({
        placement: p,
        exactAngle: lonToScreenAngle(p.longitude, referenceLon),
        displayAngle: lonToScreenAngle(p.longitude, referenceLon),
      }))
      .sort((a, b) => a.exactAngle - b.exactAngle);

    const minGap = 13;
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < items.length; i++) {
        const nextIdx = (i + 1) % items.length;
        let diff = items[nextIdx].displayAngle - items[i].displayAngle;
        if (nextIdx === 0) diff += 360;
        if (diff < minGap) {
          const push = (minGap - diff) / 2;
          items[i].displayAngle = (items[i].displayAngle - push + 360) % 360;
          items[nextIdx].displayAngle = (items[nextIdx].displayAngle + push) % 360;
        }
      }
    }
    return items;
  }, [astrology.placements, referenceLon]);

  const placementMap = useMemo(() => {
    const map = new Map<PlanetId, PlanetPlacement>();
    for (const p of astrology.placements) map.set(p.id, p);
    return map;
  }, [astrology.placements]);

  return (
    <svg
      viewBox="0 0 420 420"
      className="w-full max-w-[380px] mx-auto block select-none"
      role="img"
      aria-label="서양 점성술 네이탈 천궁도"
    >
      {/* Concentric Hairline Rings */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="#FFFFFF" stroke="#141414" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R_SIGN_INNER} fill="#FFFFFF" stroke="#D4D4D4" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R_ASPECT} fill="#FAFAFA" stroke="#E5E5E5" strokeWidth="1" />

      {/* 12 Zodiac Sign Divisions & Symbols */}
      {ZODIAC_SIGNS.map((sign) => {
        const startAngle = lonToScreenAngle(sign.index * 30, referenceLon);
        const midAngle = lonToScreenAngle(sign.index * 30 + 15, referenceLon);
        const pOuter = polarToCartesian(CX, CY, R_OUTER, startAngle);
        const pInner = polarToCartesian(CX, CY, R_SIGN_INNER, startAngle);
        const pText = polarToCartesian(CX, CY, (R_OUTER + R_SIGN_INNER) / 2, midAngle);
        const elColor = WESTERN_ELEMENT_META[sign.element].color;

        return (
          <g key={sign.index}>
            <line
              x1={pOuter.x}
              y1={pOuter.y}
              x2={pInner.x}
              y2={pInner.y}
              stroke="#E0E0E0"
              strokeWidth="1"
            />
            <text
              x={pText.x}
              y={pText.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={elColor}
              fontSize="14"
              fontFamily="serif"
            >
              {sign.symbol}
            </text>
          </g>
        );
      })}

      {/* Horizon ASC-DSC Line when birth time is known */}
      {astrology.ascendant && (
        <g>
          <line
            x1={CX - R_SIGN_INNER}
            y1={CY}
            x2={CX - R_ASPECT}
            y2={CY}
            stroke="#141414"
            strokeWidth="1.2"
          />
          <line
            x1={CX + R_ASPECT}
            y1={CY}
            x2={CX + R_SIGN_INNER}
            y2={CY}
            stroke="#CCCCCC"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <g
            onClick={() => onSelectPlanet('ascendant')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPlanet('ascendant');
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={selectedPlanetId === 'ascendant'}
            aria-label={`상승궁(ASC) ${astrology.ascendant.sign.nameKo} ${astrology.ascendant.degreeLabel} 풀이 보기`}
            className="cursor-pointer"
          >
            <rect
              x={CX - R_SIGN_INNER}
              y={CY - 16}
              width="38"
              height="32"
              fill="transparent"
            />
            <rect
              x={CX - R_SIGN_INNER + 4}
              y={CY - 9}
              width="28"
              height="18"
              rx="2"
              fill={selectedPlanetId === 'ascendant' ? '#141414' : '#FFFFFF'}
              stroke="#141414"
              strokeWidth="0.9"
            />
            <text
              x={CX - R_SIGN_INNER + 18}
              y={CY + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8.5"
              fontFamily="var(--font-mono)"
              fontWeight="500"
              fill={selectedPlanetId === 'ascendant' ? '#FFFFFF' : '#141414'}
            >
              ASC
            </text>
          </g>
        </g>
      )}

      {/* Aspect Chords inside inner circle */}
      {astrology.aspects.map((asp) => {
        const pA = placementMap.get(asp.planetA);
        const pB = placementMap.get(asp.planetB);
        if (!pA || !pB) return null;
        const posA = polarToCartesian(
          CX,
          CY,
          R_ASPECT,
          lonToScreenAngle(pA.longitude, referenceLon)
        );
        const posB = polarToCartesian(
          CX,
          CY,
          R_ASPECT,
          lonToScreenAngle(pB.longitude, referenceLon)
        );
        const isHighlighted =
          selectedPlanetId === asp.planetA || selectedPlanetId === asp.planetB;
        const isTension = asp.harmony === '긴장';

        return (
          <line
            key={asp.id}
            x1={posA.x}
            y1={posA.y}
            x2={posB.x}
            y2={posB.y}
            stroke={isTension ? '#9A3412' : '#1E3A8A'}
            strokeOpacity={isHighlighted ? 0.72 : 0.25}
            strokeWidth={isHighlighted ? 1.25 : 0.85}
            strokeDasharray={isTension ? '3 3' : undefined}
          />
        );
      })}

      {/* Center Minimalist Crosshair */}
      <circle cx={CX} cy={CY} r="2.2" fill="#141414" />

      {/* Planet Markers & Interactive Glyphs */}
      {displayPlacements.map(({ placement, exactAngle, displayAngle }) => {
        const tickOuter = polarToCartesian(CX, CY, R_SIGN_INNER, exactAngle);
        const tickInner = polarToCartesian(CX, CY, R_PLANET_TICK, exactAngle);
        const glyphPos = polarToCartesian(CX, CY, R_PLANET_LABEL, displayAngle);
        const aspectAnchor = polarToCartesian(CX, CY, R_ASPECT, exactAngle);
        const isSelected = selectedPlanetId === placement.id;

        return (
          <g
            key={placement.id}
            onClick={() => onSelectPlanet(placement.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectPlanet(placement.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${placement.nameKo} ${placement.sign.nameKo} ${placement.degreeLabel} 풀이 보기`}
            className="cursor-pointer"
          >
            {/* Expanded invisible touch target for mobile fingers */}
            <circle
              cx={glyphPos.x}
              cy={glyphPos.y}
              r={18}
              fill="transparent"
            />
            {/* Degree Tick */}
            <line
              x1={tickOuter.x}
              y1={tickOuter.y}
              x2={tickInner.x}
              y2={tickInner.y}
              stroke="#141414"
              strokeWidth={isSelected ? 1.5 : 1}
            />
            {/* Aspect circle dot */}
            <circle
              cx={aspectAnchor.x}
              cy={aspectAnchor.y}
              r={isSelected ? 2.5 : 1.6}
              fill={isSelected ? '#141414' : '#6E6E6E'}
            />
            {/* Interactive Glyph Circle */}
            <circle
              cx={glyphPos.x}
              cy={glyphPos.y}
              r={12}
              fill={isSelected ? '#141414' : '#FFFFFF'}
              stroke={isSelected ? '#141414' : '#D4D4D4'}
              strokeWidth="1"
            />
            <text
              x={glyphPos.x}
              y={glyphPos.y + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12.5"
              fill={isSelected ? '#FFFFFF' : '#141414'}
            >
              {placement.symbol}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
