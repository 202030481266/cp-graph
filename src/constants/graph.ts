/**
 * Graph visualization constants
 */

// Node dimensions
export const NODE_SIZE = 32;
export const NODE_RADIUS = NODE_SIZE / 2;
export const NODE_INNER_RADIUS = 15; // For edge offset calculation (accounts for border)

// Arrow dimensions
export const ARROW_SIZE = 12;
export const ARROW_BASE_LENGTH = ARROW_SIZE * 0.35;

// SCC component colors
export const SCC_COLORS: readonly string[] = [
  '#ff6b6b',
  '#4dabf7',
  '#51cf66',
  '#fcc419',
  '#cc5de8',
  '#ff922b',
  '#20c997',
  '#f06595',
] as const;

/**
 * Get color for SCC component by ID
 */
export function getSccColor(sccId: number): string {
  return SCC_COLORS[sccId % SCC_COLORS.length];
}
