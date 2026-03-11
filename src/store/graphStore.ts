import { create } from 'zustand';
import type { GraphNode, GraphEdge, GraphConfig, AlgorithmResult } from '../types/graph';

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  config: GraphConfig;
  selectedNodes: string[];
  algorithmResult: AlgorithmResult | null;

  // Actions
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  addNode: (node: GraphNode) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: GraphEdge) => void;
  removeEdge: (edgeId: string) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  setConfig: (config: Partial<GraphConfig>) => void;
  setSelectedNodes: (nodeIds: string[]) => void;
  toggleNodeSelection: (nodeId: string) => void;
  setAlgorithmResult: (result: AlgorithmResult | null) => void;
  updateEdgeWeight: (edgeId: string, weight: number | undefined) => void;
  clearGraph: () => void;
  resetHighlights: () => void;
}

let nodeIdCounter = 0;
let edgeIdCounter = 0;

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  config: {
    directed: false,
    weighted: false,
  },
  selectedNodes: [],
  algorithmResult: null,

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodes: state.selectedNodes.filter((id) => id !== nodeId),
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  removeEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    })),

  updateNodePosition: (nodeId, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, position: { x, y } } : node
      ),
    })),

  setConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),

  setSelectedNodes: (nodeIds) => set({ selectedNodes: nodeIds }),

  toggleNodeSelection: (nodeId) =>
    set((state) => ({
      selectedNodes: state.selectedNodes.includes(nodeId)
        ? state.selectedNodes.filter((id) => id !== nodeId)
        : [...state.selectedNodes, nodeId],
    })),

  setAlgorithmResult: (result) => set({ algorithmResult: result }),

  updateEdgeWeight: (edgeId, weight) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, weight } }
          : edge
      ),
    })),

  clearGraph: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodes: [],
      algorithmResult: null,
      config: { directed: false, weighted: false },
    }),

  resetHighlights: () =>
    set((state) => {
      // Check if there's anything to reset (optimization)
      const hasHighlights =
        state.nodes.some(
          (n) => n.data.isLCA || n.data.isHighlighted || n.data.isInPath || n.data.sccId !== undefined
        ) ||
        state.edges.some((e) => e.data?.isHighlighted);

      if (!hasHighlights && !state.algorithmResult) {
        return state; // No change needed
      }

      return {
        nodes: state.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isLCA: false,
            sccId: undefined,
            isHighlighted: false,
            isInPath: false,
          },
        })),
        edges: state.edges.map((edge) => ({
          ...edge,
          data: { ...edge.data, isHighlighted: false },
        })),
        algorithmResult: null,
      };
    }),
}));

export const generateNodeId = () => `node_${nodeIdCounter++}`;
export const generateEdgeId = (source: string, target: string) =>
  `edge_${source}_${target}_${edgeIdCounter++}`;

export const resetCounters = () => {
  nodeIdCounter = 0;
  edgeIdCounter = 0;
};
