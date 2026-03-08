import type { GraphNode, GraphEdge, ShortestPathResult } from '../../types/graph';

type AdjacencyList = Map<string, { neighbor: string; weight: number }[]>;

export function dijkstra(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  endId: string,
  directed: boolean
): ShortestPathResult | null {
  // Build adjacency list
  const adj: AdjacencyList = new Map();
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    const weight = edge.data?.weight ?? 1;
    adj.get(edge.source)?.push({ neighbor: edge.target, weight });
    if (!directed) {
      adj.get(edge.target)?.push({ neighbor: edge.source, weight });
    }
  }

  // Dijkstra's algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const visited = new Set<string>();

  for (const node of nodes) {
    distances.set(node.id, Infinity);
  }
  distances.set(startId, 0);

  // Simple priority queue (can be optimized with binary heap)
  const getMinNode = (): string | null => {
    let minDist = Infinity;
    let minNode: string | null = null;
    for (const [nodeId, dist] of distances) {
      if (!visited.has(nodeId) && dist < minDist) {
        minDist = dist;
        minNode = nodeId;
      }
    }
    return minNode;
  };

  while (true) {
    const current = getMinNode();
    if (current === null || distances.get(current) === Infinity) break;

    visited.add(current);
    if (current === endId) break;

    for (const { neighbor, weight } of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        const newDist = distances.get(current)! + weight;
        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
          previous.set(neighbor, current);
        }
      }
    }
  }

  // Reconstruct path
  const distance = distances.get(endId);
  if (distance === undefined || distance === Infinity) {
    return null;
  }

  const path: string[] = [];
  let current: string | undefined = endId;
  while (current !== undefined) {
    path.unshift(current);
    current = previous.get(current);
  }

  return { distance, path };
}

export function bfs(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  endId: string,
  directed: boolean
): ShortestPathResult | null {
  // Build adjacency list
  const adj: AdjacencyList = new Map();
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push({ neighbor: edge.target, weight: 1 });
    if (!directed) {
      adj.get(edge.target)?.push({ neighbor: edge.source, weight: 1 });
    }
  }

  // BFS
  const visited = new Set<string>();
  const previous = new Map<string, string>();
  const queue: string[] = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === endId) {
      // Reconstruct path
      const path: string[] = [];
      let node: string | undefined = endId;
      while (node !== undefined) {
        path.unshift(node);
        node = previous.get(node);
      }
      return { distance: path.length - 1, path };
    }

    for (const { neighbor } of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        previous.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null;
}
