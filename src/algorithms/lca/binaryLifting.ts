import type { GraphNode, GraphEdge, LCAResult } from '../../types/graph';

export function binaryLiftingLCA(
  nodes: GraphNode[],
  edges: GraphEdge[],
  queryNodes: string[]
): LCAResult | null {
  if (queryNodes.length < 2 || nodes.length === 0) return null;

  // Build adjacency list (treat as undirected for LCA)
  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
    adj.get(edge.target)?.push(edge.source);
  }

  // BFS to find depth and parent (root at first query node)
  const root = queryNodes[0];
  const depth = new Map<string, number>();
  const parent = new Map<string, string>();

  const queue: string[] = [root];
  const visited = new Set<string>([root]);
  depth.set(root, 0);
  parent.set(root, '');

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adj.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        depth.set(neighbor, depth.get(current)! + 1);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  // Check if all query nodes are in the same tree
  for (const nodeId of queryNodes) {
    if (!depth.has(nodeId)) return null;
  }

  // Binary lifting table
  const LOG = Math.ceil(Math.log2(nodes.length + 1)) + 1;
  const up = new Map<string, string[]>();

  for (const node of nodes) {
    up.set(node.id, new Array(LOG).fill(''));
    up.get(node.id)![0] = parent.get(node.id) || '';
  }

  for (let j = 1; j < LOG; j++) {
    for (const node of nodes) {
      const mid = up.get(node.id)![j - 1];
      up.get(node.id)![j] = mid ? up.get(mid)?.[j - 1] || '' : '';
    }
  }

  // LCA function
  const getLCA = (u: string, v: string): string => {
    // Make sure u is deeper
    if (depth.get(u)! < depth.get(v)!) {
      [u, v] = [v, u];
    }

    // Bring u to same depth as v
    const diff = depth.get(u)! - depth.get(v)!;
    for (let i = 0; i < LOG; i++) {
      if ((diff >> i) & 1) {
        u = up.get(u)![i];
      }
    }

    if (u === v) return u;

    // Binary search for LCA
    for (let i = LOG - 1; i >= 0; i--) {
      if (up.get(u)![i] !== up.get(v)![i]) {
        u = up.get(u)![i];
        v = up.get(v)![i];
      }
    }

    return parent.get(u) || u;
  };

  // Find LCA of all query nodes
  let lca = queryNodes[0];
  for (let i = 1; i < queryNodes.length; i++) {
    lca = getLCA(lca, queryNodes[i]);
  }

  return { lca, nodeIds: queryNodes };
}
