# ICPC Graph Tool

An interactive graph visualization tool for competitive programming practice. Built with React, TypeScript, and React Flow.

English | [简体中文](./README_zh.md)

## Features

### Graph Generation
- **Random Graphs** - Erdos-Renyi model with configurable node count and edge probability
- **Random Trees** - Using Prufer sequence for uniform random tree generation
- **Special Graphs** - Star, Complete, Chain, and Grid graphs
- **Force-directed Layout** - Automatic node positioning with physics simulation
- **Manual Input** - Flexible node/edge format for custom graphs

### Graph Configuration
- Toggle between **directed** and **undirected** graphs
- Toggle between **weighted** and **unweighted** edges
- Configurable edge probability for random graphs
- **Inline weight editing** - Double-click on edge labels to edit weights

### Graph Algorithms
- **Shortest Path** - Dijkstra (weighted) or BFS (unweighted)
- **Strongly Connected Components (SCC)** - Kosaraju's algorithm
- **DAG Layout** - Topological sort with level-based visualization
- **LCA** - Binary Lifting algorithm

### Interactive Canvas
- Double-click on canvas to add nodes
- Right-click to delete nodes/edges
- Drag from node edge to create connections
- Ctrl+click for multi-select nodes
- Pan and zoom controls
- Mini-map navigation

### Visual Feedback
- Path highlighting (blue) for shortest path results
- SCC coloring with 8 distinct colors
- LCA highlighting (red)
- Real-time node/edge counts and algorithm results

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cp-graph.git
cd cp-graph

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Lint

```bash
# Run ESLint
npm run lint
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Flow** - Graph visualization library
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Project Structure

```
src/
├── algorithms/           # Graph algorithms
│   ├── graphGenerator/   # Random graph, tree, special graphs, force layout
│   ├── lca/              # Binary Lifting LCA
│   ├── scc/              # Kosaraju's SCC
│   ├── shortestPath/     # Dijkstra and BFS
│   └── topoSort/         # DAG topological sort
├── components/
│   ├── canvas/           # GraphCanvas, CustomNode, CustomEdge
│   └── ui/               # Toolbar, InfoPanel
├── constants/            # Graph constants (colors, sizes)
├── store/                # Zustand store
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Architecture

### State Management
The application uses a centralized Zustand store (`src/store/graphStore.ts`) that manages:
- Nodes and edges
- Graph configuration (directed/weighted)
- Selected nodes
- Algorithm results
- Counter-based ID generation

### Type System
- `GraphNode` extends React Flow's `Node` with custom data properties
- `GraphEdge` extends React Flow's `Edge` with optional weight
- Typed result objects for each algorithm

### Algorithm Pattern
All algorithms follow a functional pattern:
- Input: `GraphNode[]` and `GraphEdge[]`
- Output: Typed result object
- Each category has an `index.ts` for clean re-exports

## Usage Tips

1. **Adding Nodes**: Double-click anywhere on the canvas
2. **Creating Edges**: Drag from a node's edge to another node
3. **Deleting**: Right-click on any node or edge
4. **Multi-select**: Hold Ctrl and click to select multiple nodes
5. **Editing Weights**: Double-click on edge labels (when weighted mode is enabled)
6. **Running Algorithms**: Select source/target nodes first, then click the algorithm button

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
