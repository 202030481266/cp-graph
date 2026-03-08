import type { GraphNode, GraphEdge } from '../../types/graph';
import { generateNodeId, generateEdgeId } from '../../store/graphStore';
import { applyForceLayout } from './forceLayout';

export function generateRandomGraph(
  nodeCount: number,
  edgeProbability: number,
  directed: boolean,
  weighted: boolean,
  width: number,
  height: number
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const existingEdges = new Set<string>();

  // Generate nodes with circular initial layout for better starting positions
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  for (let i = 0; i < nodeCount; i++) {
    const id = generateNodeId();
    // Use circular distribution as initial positions
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    const r = radius * (0.5 + Math.random() * 0.5); // 50-100% of radius
    nodes.push({
      id,
      type: 'default',
      position: {
        x: centerX + r * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: centerY + r * Math.sin(angle) + (Math.random() - 0.5) * 50,
      },
      data: { label: `${i}` },
    });
  }

  // Generate edges based on probability (Erdos-Renyi model)
  for (let i = 0; i < nodeCount; i++) {
    const startJ = directed ? 0 : i + 1;
    for (let j = startJ; j < nodeCount; j++) {
      if (i === j) continue;

      if (Math.random() < edgeProbability) {
        const source = nodes[i].id;
        const target = nodes[j].id;
        const edgeKey = `${source}-${target}`;
        const reverseKey = `${target}-${source}`;

        if (!existingEdges.has(edgeKey) && (directed || !existingEdges.has(reverseKey))) {
          const weight = weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
          edges.push({
            id: generateEdgeId(source, target),
            source,
            target,
            data: { weight },
          });
          existingEdges.add(edgeKey);
        }
      }
    }
  }

  // Apply force-directed layout to improve node positions
  const layoutedNodes = applyForceLayout(nodes, edges, width, height, 80);

  return { nodes: layoutedNodes, edges };
}
