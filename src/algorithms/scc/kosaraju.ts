import type { GraphNode, GraphEdge, SCCResult } from '../../types/graph';

export function kosaraju(
  nodes: GraphNode[],
  edges: GraphEdge[]
): SCCResult {
  if (nodes.length === 0) {
    return { components: [], nodeToComponent: new Map() };
  }

  // Build adjacency lists
  const adj = new Map<string, string[]>();
  const reverseAdj = new Map<string, string[]>();

  for (const node of nodes) {
    adj.set(node.id, []);
    reverseAdj.set(node.id, []);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
    reverseAdj.get(edge.target)?.push(edge.source);
  }

  // First DFS to get finish order
  const visited = new Set<string>();
  const finishOrder: string[] = [];

  const dfs1 = (node: string) => {
    visited.add(node);
    for (const neighbor of adj.get(node) || []) {
      if (!visited.has(neighbor)) {
        dfs1(neighbor);
      }
    }
    finishOrder.push(node);
  };

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs1(node.id);
    }
  }

  // Second DFS on reverse graph in reverse finish order
  visited.clear();
  const components: string[][] = [];
  const nodeToComponent = new Map<string, number>();

  const dfs2 = (node: string, component: string[]) => {
    visited.add(node);
    component.push(node);
    for (const neighbor of reverseAdj.get(node) || []) {
      if (!visited.has(neighbor)) {
        dfs2(neighbor, component);
      }
    }
  };

  for (let i = finishOrder.length - 1; i >= 0; i--) {
    const node = finishOrder[i];
    if (!visited.has(node)) {
      const component: string[] = [];
      dfs2(node, component);
      const componentId = components.length;
      for (const nodeId of component) {
        nodeToComponent.set(nodeId, componentId);
      }
      components.push(component);
    }
  }

  return { components, nodeToComponent };
}
