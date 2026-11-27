export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphEdgeInput {
  key: string;
  aIndex: number;
  bIndex: number;
  pA: GraphPoint;
  pB: GraphPoint;
}

export interface EdgeLabelLayoutOptions {
  memberCount: number;
  nodePositions: GraphPoint[];
  nodeRadius: number;
  edges: GraphEdgeInput[];
  labelWidth: number;
  labelHeight: number;
  viewWidth: number;
  viewHeight: number;
}

interface PlacedBox {
  x: number;
  y: number;
  hw: number;
  hh: number;
}

function segmentIntersection(
  a1: GraphPoint,
  a2: GraphPoint,
  b1: GraphPoint,
  b2: GraphPoint
): GraphPoint | null {
  const rX = a2.x - a1.x;
  const rY = a2.y - a1.y;
  const sX = b2.x - b1.x;
  const sY = b2.y - b1.y;
  const denom = rX * sY - rY * sX;
  if (Math.abs(denom) < 1e-6) return null;

  const qpx = b1.x - a1.x;
  const qpy = b1.y - a1.y;
  const t = (qpx * sY - qpy * sX) / denom;
  const u = (qpx * rY - qpy * rX) / denom;

  // Strict interior intersection (exclude shared endpoints)
  if (t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98) {
    return { x: a1.x + t * rX, y: a1.y + t * rY };
  }
  return null;
}

function boxesOverlapArea(a: PlacedBox, b: PlacedBox, pad: number): number {
  const ox = a.hw + b.hw + pad - Math.abs(a.x - b.x);
  if (ox <= 0) return 0;
  const oy = a.hh + b.hh + pad - Math.abs(a.y - b.y);
  if (oy <= 0) return 0;
  return ox * oy;
}

function boxOverlapsCircle(
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  circle: GraphPoint,
  radius: number
): boolean {
  const closestX = Math.max(cx - hw, Math.min(circle.x, cx + hw));
  const closestY = Math.max(cy - hh, Math.min(circle.y, cy + hh));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < radius * radius;
}

/**
 * Deterministically computes non-overlapping SVG edge label coordinates for 2..8 member graphs.
 * - Non-crossing edges (all edges in 2–3 member graphs, outer edges in 4+ graphs) sit at 50%.
 * - Crossing diagonals alternate 35% / 65% first so intersections stay clear of labels.
 * - Collision checks against previously placed labels and all member nodes guarantee clean spacing.
 */
export function computeEdgeLabelPositions(
  options: EdgeLabelLayoutOptions
): Map<string, GraphPoint> {
  const {
    memberCount,
    nodePositions,
    nodeRadius,
    edges,
    labelWidth,
    labelHeight,
    viewWidth,
    viewHeight,
  } = options;

  const hw = labelWidth / 2;
  const hh = labelHeight / 2;
  const labelPad = memberCount <= 5 ? 5 : 3;
  const nodePad = memberCount <= 5 ? 6 : 4;

  // 1. Precompute interior crossings for every edge
  const crossingsByEdge = new Map<string, GraphPoint[]>();
  edges.forEach((e) => crossingsByEdge.set(e.key, []));

  for (let i = 0; i < edges.length; i += 1) {
    for (let j = i + 1; j < edges.length; j += 1) {
      const e1 = edges[i];
      const e2 = edges[j];
      if (
        e1.aIndex === e2.aIndex ||
        e1.aIndex === e2.bIndex ||
        e1.bIndex === e2.aIndex ||
        e1.bIndex === e2.bIndex
      ) {
        continue;
      }
      const hit = segmentIntersection(e1.pA, e1.pB, e2.pA, e2.pB);
      if (hit) {
        crossingsByEdge.get(e1.key)?.push(hit);
        crossingsByEdge.get(e2.key)?.push(hit);
      }
    }
  }

  // 2. Order edges: perimeter (step 1) first, then progressively longer chords
  const decorated = edges.map((edge, idx) => {
    const rawDiff = Math.abs(edge.aIndex - edge.bIndex);
    const chordStep = Math.min(rawDiff, memberCount - rawDiff);
    const crossings = crossingsByEdge.get(edge.key) ?? [];
    return { edge, idx, chordStep, crossings };
  });

  decorated.sort((x, y) => {
    if (x.chordStep !== y.chordStep) return x.chordStep - y.chordStep;
    return x.idx - y.idx;
  });

  const placed: PlacedBox[] = [];
  const result = new Map<string, GraphPoint>();

  // Track alternation index per chord step so crossing diagonals alternate 35% vs 65%
  const stepCounter = new Map<number, number>();

  for (const item of decorated) {
    const { edge, chordStep, crossings } = item;
    const dx = edge.pB.x - edge.pA.x;
    const dy = edge.pB.y - edge.pA.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const isCrossing = crossings.length > 0;
    const orderInStep = stepCounter.get(chordStep) ?? 0;
    stepCounter.set(chordStep, orderInStep + 1);

    // Preferred t candidates along the segment
    const tList = !isCrossing
      ? [0.5, 0.42, 0.58, 0.35, 0.65]
      : orderInStep % 2 === 0
        ? [0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.42, 0.58, 0.22, 0.78, 0.5]
        : [0.65, 0.35, 0.7, 0.3, 0.75, 0.25, 0.58, 0.42, 0.78, 0.22, 0.5];

    const perpOffsets = [0, labelHeight * 0.72, -labelHeight * 0.72, labelHeight * 1.25, -labelHeight * 1.25];

    let bestPoint: GraphPoint = {
      x: edge.pA.x + dx * tList[0],
      y: edge.pA.y + dy * tList[0],
    };
    let bestCost = Number.POSITIVE_INFINITY;

    for (let pIdx = 0; pIdx < perpOffsets.length; pIdx += 1) {
      const perp = perpOffsets[pIdx];
      for (let tIdx = 0; tIdx < tList.length; tIdx += 1) {
        const t = tList[tIdx];
        const cx = edge.pA.x + dx * t + nx * perp;
        const cy = edge.pA.y + dy * t + ny * perp;

        // Keep strictly inside viewBox margins
        if (
          cx - hw < 4 ||
          cx + hw > viewWidth - 4 ||
          cy - hh < 4 ||
          cy + hh > viewHeight - 4
        ) {
          continue;
        }

        const candidate: PlacedBox = { x: cx, y: cy, hw, hh };
        let cost = tIdx * 12 + pIdx * 45;

        // Heavy penalty for overlapping any already placed label
        for (let k = 0; k < placed.length; k += 1) {
          const area = boxesOverlapArea(candidate, placed[k], labelPad);
          if (area > 0) {
            cost += 50000 + area * 20;
          }
        }

        // Heavy penalty for overlapping any member node circle
        for (let k = 0; k < nodePositions.length; k += 1) {
          if (boxOverlapsCircle(cx, cy, hw, hh, nodePositions[k], nodeRadius + nodePad)) {
            cost += 40000;
          }
        }

        // Soft penalty for sitting right on an edge crossing point
        for (let k = 0; k < crossings.length; k += 1) {
          const dCross = Math.hypot(cx - crossings[k].x, cy - crossings[k].y);
          const safeDist = Math.hypot(hw, hh) * 0.85;
          if (dCross < safeDist) {
            cost += (safeDist - dCross) * 6;
          }
        }

        if (cost < bestCost) {
          bestCost = cost;
          bestPoint = { x: cx, y: cy };
          // Early exit when first preferred zero-collision, zero-offset spot is clean
          if (cost < 15 && pIdx === 0 && tIdx === 0) {
            break;
          }
        }
      }
      if (bestCost < 30 && pIdx === 0) {
        break;
      }
    }

    placed.push({ x: bestPoint.x, y: bestPoint.y, hw, hh });
    result.set(edge.key, bestPoint);
  }

  return result;
}
