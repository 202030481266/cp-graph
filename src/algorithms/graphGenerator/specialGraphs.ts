import type { GraphNode, GraphEdge } from '../../types/graph';
import { generateNodeId, generateEdgeId } from '../../store/graphStore';

// Generate star graph (chrysanthemum graph / 菊花图)
export function generateStarGraph(
  nodeCount: number,
  weighted: boolean,
  width: number,
  height: number
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (nodeCount <= 0) return { nodes: [], edges: [] };

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  // Create center node
  const centerId = generateNodeId();
  nodes.push({
    id: centerId,
    type: 'default',
    position: { x: centerX, y: centerY },
    data: { label: '0' },
  });

  // Create peripheral nodes
  for (let i = 1; i < nodeCount; i++) {
    const angle = (2 * Math.PI * (i - 1)) / (nodeCount - 1);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const nodeId = generateNodeId();
    nodes.push({
      id: nodeId,
      type: 'default',
      position: { x, y },
      data: { label: `${i}` },
    });

    const weight = weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
    edges.push({
      id: generateEdgeId(centerId, nodeId),
      source: centerId,
      target: nodeId,
      data: { weight },
    });
  }

  return { nodes, edges };
}

// Generate complete graph
export function generateCompleteGraph(
  nodeCount: number,
  weighted: boolean,
  width: number,
  height: number
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (nodeCount <= 0) return { nodes: [], edges: [] };

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  // Create nodes in a circle
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    nodes.push({
      id: generateNodeId(),
      type: 'default',
      position: { x, y },
      data: { label: `${i}` },
    });
  }

  // Connect every pair of nodes
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const weight = weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
      edges.push({
        id: generateEdgeId(nodes[i].id, nodes[j].id),
        source: nodes[i].id,
        target: nodes[j].id,
        data: { weight },
      });
    }
  }

  return { nodes, edges };
}

// Generate chain graph (path graph)
export function generateChainGraph(
  nodeCount: number,
  weighted: boolean,
  width: number,
  height: number
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (nodeCount <= 0) return { nodes: [], edges: [] };

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const padding = 60;
  const spacing = (width - 2 * padding) / Math.max(1, nodeCount - 1);
  const y = height / 2;

  for (let i = 0; i < nodeCount; i++) {
    const x = nodeCount === 1 ? width / 2 : padding + i * spacing;
    nodes.push({
      id: generateNodeId(),
      type: 'default',
      position: { x, y },
      data: { label: `${i}` },
    });

    if (i > 0) {
      const weight = weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
      edges.push({
        id: generateEdgeId(nodes[i - 1].id, nodes[i].id),
        source: nodes[i - 1].id,
        target: nodes[i].id,
        data: { weight },
      });
    }
  }

  return { nodes, edges };
}

// Generate grid graph
export function generateGridGraph(
  rows: number,
  cols: number,
  weighted: boolean,
  width: number,
  height: number
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (rows <= 0 || cols <= 0) return { nodes: [], edges: [] };

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const padding = 60;
  const cellWidth = (width - 2 * padding) / Math.max(1, cols - 1);
  const cellHeight = (height - 2 * padding) / Math.max(1, rows - 1);

  // Create nodes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = cols === 1 ? width / 2 : padding + c * cellWidth;
      const y = rows === 1 ? height / 2 : padding + r * cellHeight;
      nodes.push({
        id: generateNodeId(),
        type: 'default',
        position: { x, y },
        data: { label: `${r * cols + c}` },
      });
    }
  }

  // Create edges
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      // Right edge
      if (c < cols - 1) {
        const weight = weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
        edges.push({
          id: generateEdgeId(nodes[idx].id, nodes[idx + 1].id),
          source: nodes[idx].id,
          target: nodes[idx + 1].id,
          data: { weight },
        });
      }
      // Down edge
      if (r < rows - 1) {
        const weight = weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
        edges.push({
          id: generateEdgeId(nodes[idx].id, nodes[idx + cols].id),
          source: nodes[idx].id,
          target: nodes[idx + cols].id,
          data: { weight },
        });
      }
    }
  }

  return { nodes, edges };
}
