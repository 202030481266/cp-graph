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
import type { Connection, NodeTypes, EdgeTypes, NodeChange, EdgeChange, Node } from '@xyflow/react';
import type { GraphNode } from '../../types/graph';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { useGraphStore, generateNodeId, generateEdgeId } from '../../store/graphStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = {
  default: CustomNode as any,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: EdgeTypes = {
  default: CustomEdge as any,
};

function GraphCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    config,
    setNodes: setStoreNodes,
    addNode,
    addEdge: addStoreEdge,
    removeNode,
    toggleNodeSelection,
    resetHighlights,
  } = useGraphStore();

  // Add directed flag to edge data for CustomEdge to use
  const edgesWithMarkers = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      // CustomEdge 组件已经手动绘制箭头，不需要使用 markerEnd
      data: { ...edge.data, directed: config.directed },
    }));
  }, [edges, config.directed]);

  // Handle node changes (drag, select, etc.) - sync directly to store
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes as Node[]);
      setStoreNodes(newNodes as GraphNode[]);
    },
    [nodes, setStoreNodes]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      useGraphStore.getState().setEdges(newEdges);
    },
    [edges]
  );

  // Handle pane click
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.detail === 2) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const id = generateNodeId();
        const newNode = {
          id,
          type: 'default',
          position,
          data: { label: `${nodes.length}` },
        };

        addNode(newNode);
      } else {
        resetHighlights();
      }
    },
    [screenToFlowPosition, addNode, nodes.length, resetHighlights]
  );

  // Handle edge creation
  const onConnect = useCallback(
    (connection: Connection) => {
      const source = connection.source!;
      const target = connection.target!;

      const exists = edges.some(
        (e) =>
          (e.source === source && e.target === target) ||
          (!config.directed && e.source === target && e.target === source)
      );

      if (!exists) {
        const weight = config.weighted ? Math.floor(Math.random() * 20) + 1 : undefined;
        const newEdge = {
          id: generateEdgeId(source, target),
          source,
          target,
          data: { weight, directed: config.directed },
        };
        addStoreEdge(newEdge);
      }
    },
    [addStoreEdge, edges, config.directed, config.weighted]
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
      useGraphStore.getState().removeEdge(edge.id);
    },
    []
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
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={4}
        deleteKeyCode={null}
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        proOptions={{ hideAttribution: true }}
        // 优化拖动体验
        elevateNodesOnSelect={false}
        nodeDragThreshold={0}
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
