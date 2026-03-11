/**
 * Geometry utilities for graph visualization
 */

/**
 * Calculate Euclidean distance between two points
 */
export function getDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate unit vector and distance from one point to another
 */
export function getUnitVector(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): { x: number; y: number; distance: number } {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return { x: 0, y: 0, distance: 0 };
  }

  return {
    x: dx / distance,
    y: dy / distance,
    distance,
  };
}

/**
 * Calculate a point along a line at a given offset from the start
 */
export function getEdgePoint(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  offset: number = 0
): { x: number; y: number } {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return { x: fromX, y: fromY };
  }

  const ratio = (distance - offset) / distance;
  return {
    x: fromX + dx * ratio,
    y: fromY + dy * ratio,
  };
}

/**
 * Calculate the perpendicular unit vector to a given direction
 */
export function getPerpendicularVector(ux: number, uy: number): { px: number; py: number } {
  return {
    px: -uy,
    py: ux,
  };
}
