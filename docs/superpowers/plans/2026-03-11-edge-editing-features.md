# Edge Editing Features Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement edge weight editing via double-click and connection line starting from node edge

**Architecture:** Modify Zustand store for weight updates, update CustomConnectionLine to calculate edge start point, add editing state to CustomEdge

**Tech Stack:** React, TypeScript, Zustand, React Flow (@xyflow/react)

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/store/graphStore.ts` | Add `updateEdgeWeight` action |
| `src/components/canvas/CustomConnectionLine.tsx` | Calculate edge start point instead of using handle position |
| `src/components/canvas/CustomEdge.tsx` | Add editing state and inline input for weight |

---

## Chunk 1: Store Layer - updateEdgeWeight Action

### Task 1: Add updateEdgeWeight to graphStore

**Files:**
- Modify: `src/store/graphStore.ts`

- [ ] **Step 1: Add updateEdgeWeight to GraphState interface**

Add after line 22 (after `setAlgorithmResult`):

```typescript
  updateEdgeWeight: (edgeId: string, weight: number | undefined) => void;
```

- [ ] **Step 2: Add updateEdgeWeight implementation**

Add after line 87 (after `setAlgorithmResult` implementation):

```typescript
  updateEdgeWeight: (edgeId, weight) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, weight } }
          : edge
      ),
    })),
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/store/graphStore.ts
git commit -m "feat(store): add updateEdgeWeight action for edge weight editing"
```

---

## Chunk 2: CustomConnectionLine - Edge Start Point

### Task 2: Rewrite CustomConnectionLine to use edge start point

**Files:**
- Modify: `src/components/canvas/CustomConnectionLine.tsx`

- [ ] **Step 1: Update imports**

Replace entire import section with:

```typescript
import React, { useCallback } from 'react';
import type { ConnectionLineComponentProps } from '@xyflow/react';
import { useStore } from '@xyflow/react';
import type { ReactFlowState } from '@xyflow/react';
import { useGraphStore } from '../../store/graphStore';
import { generateConnectionArrowPath } from '../../utils/arrow';
import { getEdgePoint } from '../../utils/geometry';
import { NODE_SIZE, NODE_INNER_RADIUS } from '../../constants/graph';
```

- [ ] **Step 2: Add constants and rewrite component**

Replace entire component with:

```typescript
const HALF_NODE_SIZE = NODE_SIZE / 2;
const EDGE_COLOR = '#000000';

export const CustomConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  fromNode,
  toX,
  toY,
}) => {
  const { config } = useGraphStore();
  const { directed } = config;

  // 从 ReactFlow store 中读取 source node 的实时位置
  const sourcePosition = useStore(
    useCallback(
      (store: ReactFlowState) => {
        const node = store.nodeLookup.get(fromNode?.id ?? '');
        return node?.position ?? null;
      },
      [fromNode?.id]
    )
  );

  if (!sourcePosition) return null;

  const sourceCenterX = sourcePosition.x + HALF_NODE_SIZE;
  const sourceCenterY = sourcePosition.y + HALF_NODE_SIZE;

  // 除零保护
  const dx = toX - sourceCenterX;
  const dy = toY - sourceCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 1) return null;

  // 计算圆边起点
  const edgeStart = getEdgePoint(
    sourceCenterX,
    sourceCenterY,
    toX,
    toY,
    NODE_INNER_RADIUS
  );

  const linePath = `M ${edgeStart.x} ${edgeStart.y} L ${toX} ${toY}`;

  const arrowPath = directed
    ? generateConnectionArrowPath(edgeStart.x, edgeStart.y, toX, toY)
    : null;

  return (
    <g>
      <path
        d={linePath}
        fill="none"
        stroke={EDGE_COLOR}
        strokeWidth={1}
      />
      {arrowPath && (
        <path
          d={arrowPath}
          fill={EDGE_COLOR}
          stroke="none"
        />
      )}
    </g>
  );
};

export default CustomConnectionLine;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 4: Manual verification - Feature 2**

Run: `npm run dev`

Verify:
- [ ] Drag from node - line starts from edge, not top
- [ ] Line direction follows mouse movement
- [ ] Zoom/pan canvas, drag again - no offset
- [ ] Directed mode - arrow direction matches line

- [ ] **Step 5: Commit**

```bash
git add src/components/canvas/CustomConnectionLine.tsx
git commit -m "feat(canvas): connection line starts from node edge instead of handle"
```

---

## Chunk 3: CustomEdge - Weight Editing

### Task 3: Add weight editing to CustomEdge

**Files:**
- Modify: `src/components/canvas/CustomEdge.tsx`

- [ ] **Step 1: Add useState import and useGraphStore**

Update imports at top of file:

```typescript
import { useCallback, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type ReactFlowState,
} from '@xyflow/react';
import type { GraphEdge } from '../../types/graph';
import { NODE_SIZE, NODE_INNER_RADIUS } from '../../constants/graph';
import { getEdgePoint } from '../../utils/geometry';
import { generateEdgeArrowPath } from '../../utils/arrow';
import { useGraphStore } from '../../store/graphStore';
```

- [ ] **Step 2: Add editing state and handlers**

Add after `const edgeData = ...` line (around line 44):

```typescript
  const { config, updateEdgeWeight } = useGraphStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      updateEdgeWeight(id, parsed);
    }
    setIsEditing(false);
  }, [editValue, id, updateEdgeWeight]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!config.weighted) return;
      setEditValue(weight !== undefined ? String(weight) : '');
      setIsEditing(true);
    },
    [config.weighted, weight]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        commitEdit();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [commitEdit]
  );
```

- [ ] **Step 3: Replace weight label rendering**

Replace the existing `{weight !== undefined && (...)}` block (lines 110-127) with:

```typescript
      {config.weighted && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                style={{
                  width: '48px',
                  fontSize: '10px',
                  fontWeight: 400,
                  textAlign: 'center',
                  padding: '1px 4px',
                  border: '1px solid #000',
                  borderRadius: '2px',
                  outline: 'none',
                  background: '#fff',
                }}
              />
            ) : (
              <div
                style={{
                  background: '#fff',
                  padding: '1px 4px',
                  fontSize: '10px',
                  fontWeight: 400,
                  color: '#000',
                  cursor: 'text',
                  minWidth: '16px',
                  textAlign: 'center',
                }}
              >
                {weight ?? ''}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 5: Manual verification - Feature 1**

Run: `npm run dev`

Verify:
- [ ] Enable weighted mode
- [ ] Double-click weight label - input appears, auto-focused
- [ ] Type number, press Enter - value saved
- [ ] Double-click, type number, click outside - value saved
- [ ] Double-click, press Escape - value unchanged
- [ ] Double-click, type "abc", press Enter - value unchanged
- [ ] Disable weighted mode - no label visible, no editing

- [ ] **Step 6: Commit**

```bash
git add src/components/canvas/CustomEdge.tsx
git commit -m "feat(canvas): add inline weight editing via double-click on edges"
```

---

## Final Steps

- [ ] **Step 7: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 8: Run linter**

Run: `npm run lint`
Expected: No lint errors

- [ ] **Step 9: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: resolve build/lint issues for edge editing features"
```

---

## Verification Checklist

**Feature 2: Connection Line from Edge**
- [ ] Drag from node - line starts from edge
- [ ] Line follows mouse direction
- [ ] Zoom/pan - no offset issues
- [ ] Directed mode - arrow correct

**Feature 1: Edge Weight Editing**
- [ ] Double-click enters edit mode
- [ ] Enter confirms
- [ ] Blur confirms
- [ ] Escape cancels
- [ ] Invalid input preserves original
- [ ] Non-weighted mode - no interaction
