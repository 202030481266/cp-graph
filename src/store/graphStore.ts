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
    nodeCount: 0,
    edgeCount: 0,
  },
  selectedNodes: [],
  algorithmResult: null,

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      config: { ...state.config, nodeCount: state.config.nodeCount + 1 },
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodes: state.selectedNodes.filter((id) => id !== nodeId),
      config: {
        ...state.config,
        nodeCount: state.config.nodeCount - 1,
        edgeCount: state.config.edgeCount -
          state.edges.filter((e) => e.source === nodeId || e.target === nodeId).length,
      },
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
      config: { ...state.config, edgeCount: state.config.edgeCount + 1 },
    })),

  removeEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      config: { ...state.config, edgeCount: state.config.edgeCount - 1 },
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

  clearGraph: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodes: [],
      algorithmResult: null,
      config: { directed: false, weighted: false, nodeCount: 0, edgeCount: 0 },
    }),

  resetHighlights: () =>
    set((state) => ({
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
    })),
}));

export const generateNodeId = () => `node_${nodeIdCounter++}`;
export const generateEdgeId = (source: string, target: string) =>
  `edge_${source}_${target}_${edgeIdCounter++}`;

export const resetCounters = () => {
  nodeIdCounter = 0;
  edgeIdCounter = 0;
};
