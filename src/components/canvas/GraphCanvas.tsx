import { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import type {
  Connection,
  NodeTypes,
  EdgeTypes,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import type { GraphNode, GraphEdge } from '../../types/graph';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import CustomConnectionLine from './CustomConnectionLine';
import { useGraphStore, generateNodeId, generateEdgeId } from '../../store/graphStore';

// Node and edge types
const nodeTypes: NodeTypes = {
  default: CustomNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};

function GraphCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    config,
    addNode,
    addEdge: addStoreEdge,
    removeNode,
    removeEdge,
    toggleNodeSelection,
    resetHighlights,
  } = useGraphStore();

  // Add directed flag to edge data for CustomEdge to use
  const edgesWithMarkers = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      data: { ...edge.data, directed: config.directed },
    }));
  }, [edges, config.directed]);

  // Handle node changes - use store getter to avoid stale closure
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const currentNodes = useGraphStore.getState().nodes;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newNodes = applyNodeChanges(changes, currentNodes as any);
    useGraphStore.getState().setNodes(newNodes as GraphNode[]);
  }, []);

  // Handle edge changes - use store getter to avoid stale closure
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    const currentEdges = useGraphStore.getState().edges;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newEdges = applyEdgeChanges(changes, currentEdges as any);
    useGraphStore.getState().setEdges(newEdges as GraphEdge[]);
  }, []);

  // Handle pane click
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.detail === 2) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const id = generateNodeId();
        const currentNodes = useGraphStore.getState().nodes;
        const newNode: GraphNode = {
          id,
          type: 'default',
          position,
          data: { label: `${currentNodes.length}` },
        };

        addNode(newNode);
      } else {
        resetHighlights();
      }
    },
    [screenToFlowPosition, addNode, resetHighlights]
  );

  // Handle edge creation
  const onConnect = useCallback(
    (connection: Connection) => {
      const source = connection.source!;
      const target = connection.target!;
      const { edges: currentEdges, config: currentConfig } = useGraphStore.getState();

      const exists = currentEdges.some(
        (e) =>
          (e.source === source && e.target === target) ||
          (!currentConfig.directed && e.source === target && e.target === source)
      );

      if (!exists) {
        const weight = currentConfig.weighted
          ? Math.floor(Math.random() * 20) + 1
          : undefined;
        const newEdge: GraphEdge = {
          id: generateEdgeId(source, target),
          source,
          target,
          data: { weight, directed: currentConfig.directed },
        };
        addStoreEdge(newEdge);
      }
    },
    [addStoreEdge]
  );

  // Handle node right click to delete
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      event.preventDefault();
      removeNode(node.id);
    },
    [removeNode]
  );

  // Handle Ctrl+click for multi-select
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      if (event.ctrlKey || event.metaKey) {
        toggleNodeSelection(node.id);
      }
    },
    [toggleNodeSelection]
  );

  // Handle edge right click to delete
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: { id: string }) => {
      event.preventDefault();
      removeEdge(edge.id);
    },
    [removeEdge]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edgesWithMarkers}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={CustomConnectionLine}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={4}
        deleteKeyCode={null}
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        proOptions={{ hideAttribution: true }}
        elevateNodesOnSelect={false}
        nodeDragThreshold={0}
        connectionRadius={20}
      >
        <Background color="#e5e5e5" gap={20} size={0.5} />
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          style={{ gap: 2 }}
        />
      </ReactFlow>
    </div>
  );
}

export default function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  );
}
