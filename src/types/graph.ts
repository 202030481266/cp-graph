import type { Node, Edge } from '@xyflow/react';

export interface GraphNodeData {
  label: string;
  weight?: number;
  isLCA?: boolean;
  sccId?: number;
  isHighlighted?: boolean;
  isInPath?: boolean;
  [key: string]: unknown;
}

export interface GraphNode extends Node {
  data: GraphNodeData;
}

export interface GraphEdge extends Edge {
  data?: {
    weight?: number;
    isHighlighted?: boolean;
    directed?: boolean;
  };
}

export interface GraphConfig {
  directed: boolean;
  weighted: boolean;
}

export interface AlgorithmResult {
  type: 'shortestPath' | 'lca' | 'scc' | 'topoSort';
  data: unknown;
}

export interface ShortestPathResult {
  distance: number;
  path: string[];
}

export interface LCAResult {
  lca: string;
  nodeIds: string[];
}

export interface SCCResult {
  components: string[][];
  nodeToComponent: Map<string, number>;
}

export interface DAGLayoutResult {
  levels: string[][];
  hasCycle: boolean;
}
