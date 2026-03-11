/**
 * Arrow path generation utilities
 */

import { ARROW_SIZE, ARROW_BASE_LENGTH } from '../constants/graph';
import { getUnitVector, getPerpendicularVector } from './geometry';

/**
 * Generate SVG path string for a triangular arrow
 * @param tipX - X coordinate of arrow tip
 * @param tipY - Y coordinate of arrow tip
 * @param directionX - Unit vector X pointing from target toward source
 * @param directionY - Unit vector Y pointing from target toward source
 */
export function generateArrowPath(
  tipX: number,
  tipY: number,
  directionX: number,
  directionY: number
): string {
  const ux = directionX;
  const uy = directionY;
  const { px, py } = getPerpendicularVector(ux, uy);

  const backX = tipX + ux * ARROW_SIZE;
  const backY = tipY + uy * ARROW_SIZE;

  return `M ${tipX} ${tipY} L ${backX + px * ARROW_BASE_LENGTH} ${backY + py * ARROW_BASE_LENGTH} L ${backX - px * ARROW_BASE_LENGTH} ${backY - py * ARROW_BASE_LENGTH} Z`;
}

/**
 * Generate arrow path for a connection line (from source to target)
 */
export function generateConnectionArrowPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): string | null {
  const { x: ux, y: uy, distance } = getUnitVector(targetX, targetY, sourceX, sourceY);

  if (distance === 0) {
    return null;
  }

  // Arrow tip is at the target (cursor position)
  return generateArrowPath(targetX, targetY, ux, uy);
}

/**
 * Generate arrow path for an edge (with offset for node radius)
 */
export function generateEdgeArrowPath(
  sourceCenterX: number,
  sourceCenterY: number,
  targetCenterX: number,
  targetCenterY: number,
  nodeRadius: number
): string | null {
  const { x: ux, y: uy, distance } = getUnitVector(
    targetCenterX,
    targetCenterY,
    sourceCenterX,
    sourceCenterY
  );

  if (distance === 0) {
    return null;
  }

  // Arrow tip is at the edge of the target node
  const tipX = targetCenterX + ux * nodeRadius;
  const tipY = targetCenterY + uy * nodeRadius;

  return generateArrowPath(tipX, tipY, ux, uy);
}
