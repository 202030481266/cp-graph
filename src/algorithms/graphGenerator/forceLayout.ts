import type { GraphNode, GraphEdge } from '../../types/graph';

/**
 * Force-directed layout algorithm
 * Simulates repulsion between nodes and attraction along edges
 */
export function applyForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations: number = 100
): GraphNode[] {
  if (nodes.length === 0) return nodes;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const padding = 60;

  // Initialize velocities
  const velocities = new Map<string, { x: number; y: number }>();
  nodes.forEach(n => velocities.set(n.id, { x: 0, y: 0 }));

  // Parameters
  const repulsionStrength = 5000;
  const attractionStrength = 0.01;
  const damping = 0.85;
  const minDistance = 50;

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { x: number; y: number }>();
    nodes.forEach(n => forces.set(n.id, { x: 0, y: 0 }));

    // Calculate repulsion between all pairs of nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        const dx = nodeB.position.x - nodeA.position.x;
        const dy = nodeB.position.y - nodeA.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        distance = Math.max(distance, minDistance);

        const force = repulsionStrength / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        const forceA = forces.get(nodeA.id)!;
        const forceB = forces.get(nodeB.id)!;
        forceA.x -= fx;
        forceA.y -= fy;
        forceB.x += fx;
        forceB.y += fy;
      }
    }

    // Calculate attraction along edges
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;

      const dx = target.position.x - source.position.x;
      const dy = target.position.y - source.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) continue;

      const force = distance * attractionStrength;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      const forceSource = forces.get(source.id)!;
      const forceTarget = forces.get(target.id)!;
      forceSource.x += fx;
      forceSource.y += fy;
      forceTarget.x -= fx;
      forceTarget.y -= fy;
    }

    // Apply forces and update positions
    for (const node of nodes) {
      const vel = velocities.get(node.id)!;
      const force = forces.get(node.id)!;

      vel.x = (vel.x + force.x) * damping;
      vel.y = (vel.y + force.y) * damping;

      node.position.x += vel.x;
      node.position.y += vel.y;
    }
  }

  // Center the graph and ensure it's within bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of nodes) {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x);
    maxY = Math.max(maxY, node.position.y);
  }

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;
  const centerX = (width - graphWidth) / 2 - minX + padding;
  const centerY = (height - graphHeight) / 2 - minY + padding;

  return nodes.map(node => ({
    ...node,
    position: {
      x: Math.max(padding, Math.min(width - padding, node.position.x + centerX)),
      y: Math.max(padding, Math.min(height - padding, node.position.y + centerY)),
    }
  }));
}

/**
 * Circular layout - evenly distributes nodes in a circle
 */
export function applyCircularLayout(
  nodes: GraphNode[],
  width: number,
  height: number,
  radius?: number
): GraphNode[] {
  if (nodes.length === 0) return nodes;

  const centerX = width / 2;
  const centerY = height / 2;
  const r = radius || Math.min(width, height) / 3;

  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return {
      ...node,
      position: {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      }
    };
  });
}
