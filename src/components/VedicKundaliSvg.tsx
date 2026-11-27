import { KeyboardEvent } from 'react';
import {
  AstrologyChart,
  GrahaId,
  GrahaPlacement,
  VEDIC_ELEMENT_META,
  VEDIC_RASHIS,
} from '../engine/astrology';

interface VedicKundaliSvgProps {
  astrology: AstrologyChart;
  selectedGrahaId: GrahaId;
  onSelectGraha: (id: GrahaId) => void;
}

interface HouseGeometry {
  house: number;
  rashiLabelPos: { x: number; y: number };
  center: { x: number; y: number };
  polygon: string;
}

/**
 * 전통 북인도식 다이아몬드 쿤달리(North Indian Lagna/Chandra Kundali) 12하우스 좌표 (360×360)
 * 1하우스는 상단 중앙 다이아몬드에 고정되며, 반시계 방향으로 1~12하우스가 배치됩니다.
 */
const NORTH_INDIAN_HOUSES: readonly HouseGeometry[] = [
  { house: 1, rashiLabelPos: { x: 180, y: 150 }, center: { x: 180, y: 95 }, polygon: '180,12 264,96 180,180 96,96' },
  { house: 2, rashiLabelPos: { x: 96, y: 42 }, center: { x: 96, y: 66 }, polygon: '12,12 180,12 96,96' },
  { house: 3, rashiLabelPos: { x: 34, y: 96 }, center: { x: 54, y: 96 }, polygon: '12,12 96,96 12,180' },
  { house: 4, rashiLabelPos: { x: 146, y: 184 }, center: { x: 96, y: 180 }, polygon: '96,96 180,180 96,264 12,180' },
  { house: 5, rashiLabelPos: { x: 34, y: 268 }, center: { x: 54, y: 264 }, polygon: '12,180 96,264 12,348' },
  { house: 6, rashiLabelPos: { x: 96, y: 326 }, center: { x: 96, y: 298 }, polygon: '12,348 96,264 180,348' },
  { house: 7, rashiLabelPos: { x: 180, y: 214 }, center: { x: 180, y: 268 }, polygon: '180,180 264,264 180,348 96,264' },
  { house: 8, rashiLabelPos: { x: 264, y: 326 }, center: { x: 264, y: 298 }, polygon: '180,348 264,264 348,348' },
  { house: 9, rashiLabelPos: { x: 326, y: 268 }, center: { x: 306, y: 264 }, polygon: '348,180 348,348 264,264' },
  { house: 10, rashiLabelPos: { x: 214, y: 184 }, center: { x: 264, y: 180 }, polygon: '264,96 348,180 264,264 180,180' },
  { house: 11, rashiLabelPos: { x: 326, y: 96 }, center: { x: 306, y: 96 }, polygon: '348,12 348,180 264,96' },
  { house: 12, rashiLabelPos: { x: 264, y: 42 }, center: { x: 264, y: 66 }, polygon: '180,12 348,12 264,96' },
];

export function VedicKundaliSvg({
  astrology,
  selectedGrahaId,
  onSelectGraha,
}: VedicKundaliSvgProps) {
  const activeGraha =
    astrology.placements.find((p) => p.id === selectedGrahaId) ?? astrology.moon;

  // Group placements by house 1..12
  const byHouse = new Map<number, GrahaPlacement[]>();
  for (let h = 1; h <= 12; h++) byHouse.set(h, []);
  for (const p of astrology.placements) {
    byHouse.get(p.house)?.push(p);
  }

  const handleKeyDown = (e: KeyboardEvent<SVGGElement>, id: GrahaId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectGraha(id);
    }
  };

  return (
    <svg
      viewBox="0 0 360 360"
      className="w-full max-w-[360px] mx-auto h-auto select-none"
      role="img"
      aria-label="인도 베딕 점성술 북인도식 12하우스 다이아몬드 쿤달리 차트"
    >
      {/* Pure White Canvas */}
      <rect x={12} y={12} width={336} height={336} fill="#FFFFFF" />

      {/* Highlight Active House Polygon */}
      {NORTH_INDIAN_HOUSES.map((geom) => {
        const isActiveHouse = activeGraha.house === geom.house;
        const houseGrahas = byHouse.get(geom.house) ?? [];
        const firstGraha = houseGrahas[0];

        return (
          <polygon
            key={`poly-${geom.house}`}
            points={geom.polygon}
            fill={isActiveHouse ? '#F5F5F5' : 'transparent'}
            onClick={() => {
              if (firstGraha) onSelectGraha(firstGraha.id);
            }}
            className={firstGraha ? 'cursor-pointer transition-colors' : ''}
          />
        );
      })}

      {/* Outer Frame */}
      <rect
        x={12}
        y={12}
        width={336}
        height={336}
        fill="none"
        stroke="#141414"
        strokeWidth={1.5}
      />

      {/* Inscribed Diamond */}
      <polygon
        points="180,12 348,180 180,348 12,180"
        fill="none"
        stroke="#141414"
        strokeWidth={1.1}
      />

      {/* Two Diagonals */}
      <line x1={12} y1={12} x2={348} y2={348} stroke="#141414" strokeWidth={1} />
      <line x1={348} y1={12} x2={12} y2={348} stroke="#141414" strokeWidth={1} />

      {/* House Rashi Numbers & Graha Labels */}
      {NORTH_INDIAN_HOUSES.map((geom) => {
        const rashiIdx = (astrology.baseRashiIndex + geom.house - 1) % 12;
        const rashi = VEDIC_RASHIS[rashiIdx];
        const houseGrahas = byHouse.get(geom.house) ?? [];
        const isDiamond = geom.house === 1 || geom.house === 4 || geom.house === 7 || geom.house === 10;

        return (
          <g key={`house-${geom.house}`}>
            {/* Traditional Rashi Number (1..12) */}
            <text
              x={geom.rashiLabelPos.x}
              y={geom.rashiLabelPos.y}
              textAnchor="middle"
              fontSize={9.5}
              fontFamily="IBM Plex Mono, Noto Sans KR, monospace"
              fill="#767676"
            >
              {rashi.number}
            </text>

            {/* Graha items placed neatly inside each house */}
            {houseGrahas.map((g, idx) => {
              const isSelected = g.id === activeGraha.id;
              const elColor = VEDIC_ELEMENT_META[g.sign.element].color;

              // Arrange 1..N grahas cleanly without overlapping walls
              let gx = geom.center.x;
              let gy = geom.center.y;
              const total = houseGrahas.length;

              if (total === 1) {
                gx = geom.center.x;
                gy = geom.center.y;
              } else if (isDiamond) {
                const cols = total <= 2 ? 1 : 2;
                const rows = Math.ceil(total / cols);
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                gx = geom.center.x + (cols === 2 ? (col === 0 ? -24 : 24) : 0);
                gy = geom.center.y + (row - (rows - 1) / 2) * 19;
              } else {
                const spacing = total > 2 ? 14 : 16;
                gy = geom.center.y + (idx - (total - 1) / 2) * spacing;
              }

              return (
                <g
                  key={g.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${g.nameKo} (${g.sign.sanskritKo} ${g.house}하우스)`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectGraha(g.id)}
                  onKeyDown={(e) => handleKeyDown(e, g.id)}
                  className="cursor-pointer outline-none"
                >
                  {/* Generous invisible hit area for touch accessibility */}
                  <rect
                    x={gx - 22}
                    y={gy - 11}
                    width={44}
                    height={20}
                    fill="transparent"
                  />
                  {isSelected && (
                    <rect
                      x={gx - 20}
                      y={gy - 9}
                      width={40}
                      height={16}
                      rx={2}
                      fill="#141414"
                    />
                  )}
                  <text
                    x={gx}
                    y={gy + 3}
                    textAnchor="middle"
                    fontSize={10.5}
                    fontWeight={isSelected ? 600 : 500}
                    fill={isSelected ? '#FFFFFF' : g.id === 'lagna' ? '#141414' : elColor}
                  >
                    {g.shortLabel}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
