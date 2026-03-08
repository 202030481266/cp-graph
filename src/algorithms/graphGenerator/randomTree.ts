import type { GraphNode, GraphEdge } from '../../types/graph';
import { generateNodeId, generateEdgeId } from '../../store/graphStore';

// Generate random tree using Prufer sequence
export function generateRandomTree(
  nodeCount: number,
  weighted: boolean,
  width: number,
  height: number
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (nodeCount <= 0) return { nodes: [], edges: [] };
  if (nodeCount === 1) {
    return {
      nodes: [{
        id: generateNodeId(),
        type: 'default',
        position: { x: width / 2, y: height / 2 },
        data: { label: '0' },
      }],
      edges: [],
    };
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Generate Prufer sequence
  const prufer: number[] = [];
  for (let i = 0; i < nodeCount - 2; i++) {
    prufer.push(Math.floor(Math.random() * nodeCount));
  }

  // Count occurrences in Prufer sequence
  const degree: number[] = new Array(nodeCount).fill(1);
  for (const p of prufer) {
    degree[p]++;
  }

  // Build tree from Prufer sequence
  const leafs: number[] = [];
  for (let i = 0; i < nodeCount; i++) {
    if (degree[i] === 1) leafs.push(i);
  }

  const adjacencyList: Map<number, number[]> = new Map();
  for (let i = 0; i < nodeCount; i++) {
    adjacencyList.set(i, []);
  }

  for (let i = 0; i < prufer.length; i++) {
    const leaf = leafs[0];
    leafs.shift();
    const parent = prufer[i];

    adjacencyList.get(leaf)!.push(parent);
    adjacencyList.get(parent)!.push(leaf);

    degree[leaf]--;
    degree[parent]--;

    if (degree[parent] === 1) {
      leafs.push(parent);
      leafs.sort((a, b) => a - b);
    }
  }

  // Connect last two nodes
  const lastTwo = leafs;
  if (lastTwo.length === 2) {
    adjacencyList.get(lastTwo[0])!.push(lastTwo[1]);
    adjacencyList.get(lastTwo[1])!.push(lastTwo[0]);
  }

  // Create nodes with tree layout
  const nodePositions = calculateTreeLayout(nodeCount, adjacencyList, width, height);
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `tree_node_${i}`,
      type: 'default',
      position: nodePositions[i],
      data: { label: `${i}` },
    });
  }

  // Create edges (avoid duplicates)
  const addedEdges = new Set<string>();
  for (let i = 0; i < nodeCount; i++) {
    for (const neighbor of adjacencyList.get(i)!) {
      const edgeKey = [i, neighbor].sort().join('-');
      if (!addedEdges.has(edgeKey)) {
        const weight = weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
        edges.push({
          id: generateEdgeId(`tree_node_${i}`, `tree_node_${neighbor}`),
          source: `tree_node_${i}`,
          target: `tree_node_${neighbor}`,
          data: { weight },
        });
        addedEdges.add(edgeKey);
      }
    }
  }

  return { nodes, edges };
}

function calculateTreeLayout(
  nodeCount: number,
  adjacencyList: Map<number, number[]>,
  width: number,
  height: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = new Array(nodeCount);
  const visited = new Set<number>();

  // BFS to assign levels
  const levels: number[][] = [];
  const queue: { node: number; level: number }[] = [{ node: 0, level: 0 }];
  visited.add(0);

  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    if (levels[level] === undefined) levels[level] = [];
    levels[level].push(node);

    for (const neighbor of adjacencyList.get(node)!) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, level: level + 1 });
      }
    }
  }

  // Assign positions based on levels
  const levelHeight = height / (levels.length + 1);
  for (let l = 0; l < levels.length; l++) {
    const levelWidth = width / (levels[l].length + 1);
    for (let i = 0; i < levels[l].length; i++) {
      positions[levels[l][i]] = {
        x: levelWidth * (i + 1),
        y: levelHeight * (l + 1),
      };
    }
  }

  return positions;
}
