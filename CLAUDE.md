# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ICPC Graph Tool - An interactive graph visualization tool for competitive programming practice. Built with React, TypeScript, and React Flow (@xyflow/react).

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production (runs tsc -b && vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### State Management
- **Zustand store** (`src/store/graphStore.ts`) manages all graph state: nodes, edges, configuration (directed/weighted), selected nodes, and algorithm results
- Use `useGraphStore()` hook to access state and actions
- `generateNodeId()` and `generateEdgeId()` functions create unique IDs; call `resetCounters()` when clearing the graph

### Types (`src/types/graph.ts`)
- `GraphNode` extends React Flow's `Node` with custom data (label, weight, isLCA, sccId, isHighlighted, isInPath)
- `GraphEdge` extends React Flow's `Edge` with optional weight and highlight state
- Algorithm result types: `ShortestPathResult`, `LCAResult`, `SCCResult`, `DAGLayoutResult`

### Algorithm Organization (`src/algorithms/`)
Algorithms are organized by category, each with an `index.ts` that re-exports:
- `graphGenerator/` - Random graphs, trees, special graphs (star, complete, chain, grid)
- `shortestPath/` - Dijkstra (weighted) and BFS (unweighted)
- `lca/` - Binary Lifting LCA algorithm
- `scc/` - Kosaraju's strongly connected components
- `topoSort/` - DAG topological sort and layout

All algorithm functions take `GraphNode[]` and `GraphEdge[]` as inputs and return typed results.

### Component Structure
- `GraphCanvas` - Main canvas using React Flow; handles node/edge interactions, syncing with store
- `CustomNode` / `CustomEdge` - Custom renderers with styling for highlights and SCC coloring
- `Toolbar` - Graph generation controls and algorithm triggers
- `InfoPanel` - Displays node/edge counts and algorithm results

### Key Patterns
- Algorithms should reset highlights via `resetHighlights()` before running
- Node/edge highlighting is done by updating node/edge data properties and re-rendering
- The store maintains the source of truth; local React Flow state syncs from it via `useEffect`
