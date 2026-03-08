import { useState, useRef, useCallback, useEffect } from 'react';
import { useGraphStore, resetCounters } from '../../store/graphStore';
import {
  generateRandomGraph,
  generateRandomTree,
  generateStarGraph,
  generateCompleteGraph,
  generateChainGraph,
  generateGridGraph,
} from '../../algorithms/graphGenerator';
import { dijkstra, bfs } from '../../algorithms/shortestPath';
import { kosaraju } from '../../algorithms/scc';
import { dagLayout, applyDAGLayout } from '../../algorithms/topoSort';

export default function Toolbar() {
  const {
    nodes,
    edges,
    config,
    setNodes,
    setEdges,
    setConfig,
    clearGraph,
    setAlgorithmResult,
    resetHighlights,
  } = useGraphStore();

  const [nodeCount, setNodeCount] = useState(10);
  const [edgeProb, setEdgeProb] = useState(0.3);
  const [gridRows, setGridRows] = useState(4);
  const [gridCols, setGridCols] = useState(4);
  const [pathStart, setPathStart] = useState('');
  const [pathEnd, setPathEnd] = useState('');
  const [manualNodes, setManualNodes] = useState('');
  const [manualEdges, setManualEdges] = useState('');
  const [width, setWidth] = useState(260);
  const [isDragging, setIsDragging] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const canvasWidth = window.innerWidth - width - 50;
  const canvasHeight = window.innerHeight - 100;

  // Handle resize dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 450) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleGenerateRandomGraph = () => {
    resetCounters();
    resetHighlights();
    const result = generateRandomGraph(
      nodeCount,
      edgeProb,
      config.directed,
      config.weighted,
      canvasWidth,
      canvasHeight
    );
    setNodes(result.nodes);
    setEdges(result.edges);
  };

  const handleGenerateTree = () => {
    resetCounters();
    resetHighlights();
    const result = generateRandomTree(nodeCount, config.weighted, canvasWidth, canvasHeight);
    setNodes(result.nodes);
    setEdges(result.edges);
  };

  const handleGenerateStar = () => {
    resetCounters();
    resetHighlights();
    const result = generateStarGraph(nodeCount, config.weighted, canvasWidth, canvasHeight);
    setNodes(result.nodes);
    setEdges(result.edges);
  };

  const handleGenerateComplete = () => {
    resetCounters();
    resetHighlights();
    const result = generateCompleteGraph(nodeCount, config.weighted, canvasWidth, canvasHeight);
    setNodes(result.nodes);
    setEdges(result.edges);
  };

  const handleGenerateChain = () => {
    resetCounters();
    resetHighlights();
    const result = generateChainGraph(nodeCount, config.weighted, canvasWidth, canvasHeight);
    setNodes(result.nodes);
    setEdges(result.edges);
  };

  const handleGenerateGrid = () => {
    resetCounters();
    resetHighlights();
    const result = generateGridGraph(gridRows, gridCols, config.weighted, canvasWidth, canvasHeight);
    setNodes(result.nodes);
    setEdges(result.edges);
  };

  const handleManualInput = () => {
    resetCounters();
    resetHighlights();

    try {
      // Parse nodes: "0 1 2 3" or "0,1,2,3" or JSON array
      let nodeLabels: string[] = [];
      const nodesStr = manualNodes.trim();

      if (nodesStr.startsWith('[')) {
        nodeLabels = JSON.parse(nodesStr);
      } else {
        nodeLabels = nodesStr.split(/[\s,]+/).filter(s => s.length > 0);
      }

      // Parse edges: "0-1 1-2" or "0 1, 1 2" or "[[0,1],[1,2]]" or "0-1:5 1-2:3" (with weights)
      const edgePairs: { from: string; to: string; weight?: number }[] = [];
      const edgesStr = manualEdges.trim();

      if (edgesStr.startsWith('[')) {
        const parsed = JSON.parse(edgesStr);
        for (const e of parsed) {
          if (Array.isArray(e)) {
            edgePairs.push({ from: String(e[0]), to: String(e[1]), weight: e[2] });
          }
        }
      } else {
        // Support formats: "0-1", "0 1", "0-1:5" (with weight)
        const edgeParts = edgesStr.split(/[\s,]+/).filter(s => s.length > 0);
        for (const part of edgeParts) {
          if (part.includes('-')) {
            const withWeight = part.split(':');
            const [from, to] = withWeight[0].split('-');
            edgePairs.push({
              from,
              to,
              weight: withWeight[1] ? parseInt(withWeight[1]) : undefined
            });
          }
        }
      }

      // Create nodes
      const labelToId = new Map<string, string>();
      const newNodes: typeof nodes = [];

      for (const label of nodeLabels) {
        const id = `node_${label}`;
        labelToId.set(label, id);
        newNodes.push({
          id,
          type: 'default',
          position: {
            x: 100 + Math.random() * (canvasWidth - 200),
            y: 100 + Math.random() * (canvasHeight - 200),
          },
          data: { label },
        });
      }

      // Create edges
      const newEdges: typeof edges = [];
      for (const { from, to, weight } of edgePairs) {
        const sourceId = labelToId.get(from);
        const targetId = labelToId.get(to);
        if (sourceId && targetId) {
          newEdges.push({
            id: `edge_${sourceId}_${targetId}`,
            source: sourceId,
            target: targetId,
            data: { weight: config.weighted ? (weight ?? Math.floor(Math.random() * 20) + 1) : weight },
          });
        }
      }

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      alert('Invalid input format.\n\nNodes: space/comma separated labels\nEdges: "from-to" or "from-to:weight"');
      console.error(err);
    }
  };

  const handleShortestPath = () => {
    if (!pathStart || !pathEnd) {
      alert('Please enter start and end node labels');
      return;
    }

    const startNode = nodes.find((n) => n.data.label === pathStart);
    const endNode = nodes.find((n) => n.data.label === pathEnd);

    if (!startNode || !endNode) {
      alert('Node not found');
      return;
    }

    const result = config.weighted
      ? dijkstra(nodes, edges, startNode.id, endNode.id, config.directed)
      : bfs(nodes, edges, startNode.id, endNode.id, config.directed);

    if (result) {
      setAlgorithmResult({ type: 'shortestPath', data: result });

      // Highlight path
      const pathSet = new Set(result.path);
      const newNodes = nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isInPath: pathSet.has(node.id),
        },
      }));
      setNodes(newNodes);

      // Highlight edges in path
      const pathEdges = new Set<string>();
      for (let i = 0; i < result.path.length - 1; i++) {
        const edge = edges.find(
          (e) =>
            (e.source === result.path[i] && e.target === result.path[i + 1]) ||
            (!config.directed && e.source === result.path[i + 1] && e.target === result.path[i])
        );
        if (edge) pathEdges.add(edge.id);
      }

      const newEdges = edges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          isHighlighted: pathEdges.has(edge.id),
        },
      }));
      setEdges(newEdges);
    } else {
      alert('No path found');
    }
  };

  const handleSCC = () => {
    if (!config.directed) {
      alert('SCC is only applicable to directed graphs');
      return;
    }

    const result = kosaraju(nodes, edges);
    setAlgorithmResult({ type: 'scc', data: result });

    // Color nodes by SCC
    const newNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        sccId: result.nodeToComponent.get(node.id),
      },
    }));
    setNodes(newNodes);
  };

  const handleDAGLayout = () => {
    if (config.directed) {
      const result = dagLayout(nodes, edges);

      if (result.hasCycle) {
        alert('Graph has a cycle - not a DAG');
        return;
      }

      const positions = applyDAGLayout(nodes, result.levels, canvasWidth, canvasHeight);
      const newNodes = nodes.map((node) => ({
        ...node,
        position: positions.get(node.id) || node.position,
      }));
      setNodes(newNodes);
      setAlgorithmResult({ type: 'topoSort', data: result });
    } else {
      alert('DAG layout is only applicable to directed graphs');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #000',
    borderRadius: 0,
    fontSize: 13,
    fontFamily: 'Consolas, Monaco, monospace',
    outline: 'none',
  };

  const btnStyle = {
    padding: '6px 12px',
    border: '1px solid #000',
    borderRadius: 0,
    fontSize: 12,
    cursor: 'pointer',
    backgroundColor: '#fff',
    transition: 'all 0.15s',
  };

  const sectionTitle = {
    fontSize: 10,
    fontWeight: 600,
    color: '#000',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  return (
    <div
      ref={sidebarRef}
      style={{
        width: `${width}px`,
        minWidth: '200px',
        maxWidth: '450px',
        height: '100vh',
        backgroundColor: '#fff',
        borderRight: '1px solid #000',
        padding: '16px',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Resizer handle */}
      <div className="resizer" onMouseDown={handleMouseDown} />

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#000' }}>Graph Tool</h1>
        <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>ICPC Algorithm Visualizer</p>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>Settings</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.directed}
              onChange={(e) => setConfig({ directed: e.target.checked })}
              style={{ width: 14, height: 14, accentColor: '#000' }}
            />
            Directed
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.weighted}
              onChange={(e) => setConfig({ weighted: e.target.checked })}
              style={{ width: 14, height: 14, accentColor: '#000' }}
            />
            Weighted
          </label>
        </div>
      </div>

      {/* Manual Input */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>Manual Input</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={manualNodes}
            onChange={(e) => setManualNodes(e.target.value)}
            placeholder="Nodes: 0 1 2 3"
            style={{ ...inputStyle, height: 32, resize: 'none' }}
          />
          <textarea
            value={manualEdges}
            onChange={(e) => setManualEdges(e.target.value)}
            placeholder="Edges: 0-1 1-2:5"
            style={{ ...inputStyle, height: 32, resize: 'none' }}
          />
          <button
            onClick={handleManualInput}
            style={{ ...btnStyle, backgroundColor: '#000', color: '#fff', border: 'none', fontWeight: 500 }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
          >
            Create Graph
          </button>
        </div>
      </div>

      {/* Generate */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>Generate</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="number"
            value={nodeCount}
            onChange={(e) => setNodeCount(parseInt(e.target.value) || 0)}
            placeholder="n"
            style={{ ...inputStyle, width: 60 }}
            min="1"
            max="100"
          />
          <input
            type="number"
            value={Math.round(edgeProb * 100)}
            onChange={(e) => setEdgeProb((parseInt(e.target.value) || 0) / 100)}
            placeholder="p%"
            style={{ ...inputStyle, width: 60 }}
            min="0"
            max="100"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: 'Random', fn: handleGenerateRandomGraph },
            { label: 'Tree', fn: handleGenerateTree },
            { label: 'Star', fn: handleGenerateStar },
            { label: 'Complete', fn: handleGenerateComplete },
            { label: 'Chain', fn: handleGenerateChain },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              style={btnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>Grid Graph</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="number"
            value={gridRows}
            onChange={(e) => setGridRows(parseInt(e.target.value) || 1)}
            placeholder="rows"
            style={{ ...inputStyle, flex: 1 }}
            min="1"
            max="20"
          />
          <span style={{ lineHeight: '34px', color: '#9ca3af' }}>x</span>
          <input
            type="number"
            value={gridCols}
            onChange={(e) => setGridCols(parseInt(e.target.value) || 1)}
            placeholder="cols"
            style={{ ...inputStyle, flex: 1 }}
            min="1"
            max="20"
          />
        </div>
        <button
          onClick={handleGenerateGrid}
          style={{ ...btnStyle, width: '100%' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
        >
          Generate Grid
        </button>
      </div>

      {/* Algorithms */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionTitle}>Algorithms</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={pathStart}
            onChange={(e) => setPathStart(e.target.value)}
            placeholder="from"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="text"
            value={pathEnd}
            onChange={(e) => setPathEnd(e.target.value)}
            placeholder="to"
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={handleShortestPath}
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
          >
            Shortest Path
          </button>
          <button
            onClick={handleSCC}
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
          >
            SCC (Kosaraju)
          </button>
          <button
            onClick={handleDAGLayout}
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
          >
            DAG Layout
          </button>
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={() => {
          resetCounters();
          clearGraph();
        }}
        style={{
          ...btnStyle,
          width: '100%',
          color: '#000',
          borderColor: '#000',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
      >
        Clear Graph
      </button>

      {/* Help */}
      <div style={{ marginTop: 16, fontSize: 10, color: '#666', lineHeight: 1.6 }}>
        <div>Double-click: Add node</div>
        <div>Right-click: Delete</div>
        <div>Drag: Create edge</div>
        <div>Ctrl+click: Multi-select</div>
      </div>
    </div>
  );
}
