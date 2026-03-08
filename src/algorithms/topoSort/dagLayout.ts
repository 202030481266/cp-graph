import type { GraphNode, GraphEdge, DAGLayoutResult } from '../../types/graph';

export function dagLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): DAGLayoutResult {
  if (nodes.length === 0) {
    return { levels: [], hasCycle: false };
  }

  // Build adjacency list and in-degree count
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  // Kahn's algorithm for topological sort
  const queue: string[] = [];
  const topoOrder: string[] = [];

  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    topoOrder.push(current);

    for (const neighbor of adj.get(current) || []) {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check for cycle
  const hasCycle = topoOrder.length !== nodes.length;

  if (hasCycle) {
    return { levels: [], hasCycle: true };
  }

  // Assign levels using longest path from any source
  const level = new Map<string, number>();

  for (const nodeId of topoOrder) {
    let maxParentLevel = -1;
    for (const [parentId, children] of adj) {
      if (children.includes(nodeId)) {
        maxParentLevel = Math.max(maxParentLevel, level.get(parentId) || 0);
      }
    }
    level.set(nodeId, maxParentLevel + 1);
  }

  // Alternative: use longest path approach
  // Reset and recalculate levels properly
  level.clear();

  const getLevel = (nodeId: string): number => {
    if (level.has(nodeId)) return level.get(nodeId)!;

    let maxParentLevel = -1;
    for (const [parentId, children] of adj) {
      if (children.includes(nodeId)) {
        maxParentLevel = Math.max(maxParentLevel, getLevel(parentId));
      }
    }

    level.set(nodeId, maxParentLevel + 1);
    return maxParentLevel + 1;
  };

  for (const node of nodes) {
    getLevel(node.id);
  }

  // Group nodes by level
  const maxLevel = Math.max(...level.values());
  const levels: string[][] = [];

  for (let l = 0; l <= maxLevel; l++) {
    levels[l] = [];
  }

  for (const [nodeId, nodeLevel] of level) {
    levels[nodeLevel].push(nodeId);
  }

  return { levels, hasCycle: false };
}

export function applyDAGLayout(
  _nodes: GraphNode[],
  levels: string[][],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (levels.length === 0) return positions;

  const padding = 60;
  const levelHeight = (height - 2 * padding) / Math.max(1, levels.length - 1);

  for (let l = 0; l < levels.length; l++) {
    const levelWidth = (width - 2 * padding) / Math.max(1, levels[l].length);

    for (let i = 0; i < levels[l].length; i++) {
      const x = levels[l].length === 1
        ? width / 2
        : padding + i * levelWidth + levelWidth / 2;
      const y = levels.length === 1
        ? height / 2
        : padding + l * levelHeight;

      positions.set(levels[l][i], { x, y });
    }
  }

  return positions;
}
