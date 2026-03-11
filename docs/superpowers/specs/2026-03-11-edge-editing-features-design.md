# Edge Editing Features Design

Date: 2026-03-11

## Overview

This design covers two graph editing features:
1. **Edge Weight Editing** - Allow users to edit edge weights by double-clicking
2. **Connection Line from Edge** - Make the connection preview line start from the node edge instead of the handle position

## Feature 1: Edge Weight Editing

### User Interaction

- **Trigger**: Double-click on an edge (or weight label)
- **UI**: The weight label becomes an inline input field
- **Confirm**: Press Enter or click outside (blur)
- **Cancel**: Press Escape

### Data Layer Changes

**File**: `src/store/graphStore.ts`

Add new action:

```typescript
updateEdgeWeight: (edgeId: string, weight: number | undefined) => void
```

Implementation:

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

### UI Layer Changes

**File**: `src/components/canvas/CustomEdge.tsx`

- Add local state: `isEditing` (boolean), `editValue` (string)
- Add `onDoubleClick` handler on the edge/label
- When editing: render `<input>` instead of `<div>` for weight label
- Input styling matches current label styling
- Auto-focus and select text when entering edit mode
- Handle Enter/Escape/Blur events

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Non-numeric input | Revert to original value |
| Empty input | Keep original value or set to undefined |
| Negative numbers | Allow (edge weights can be negative in graph theory) |
| Non-weighted graph | Hide weight label, double-click has no effect |

## Feature 2: Connection Line from Edge

### Problem

Currently, when dragging to create an edge:
- The preview line starts from the handle position (top of node)
- The final edge starts from the node edge (in direction toward target)
- This creates a visual disconnect

### Solution

**File**: `src/components/canvas/CustomConnectionLine.tsx`

1. Get source node position from store
2. Calculate source node center: `position.x + HALF_NODE_SIZE, position.y + HALF_NODE_SIZE`
3. Use `getEdgePoint()` to calculate edge start point (in direction toward mouse)
4. Draw line from edge point to mouse position

### Implementation Details

```typescript
// Get source node from store
const sourceNode = useStore(/* lookup by source id */);

// Calculate edge start point
const sourceCenterX = sourceNode.position.x + HALF_NODE_SIZE;
const sourceCenterY = sourceNode.position.y + HALF_NODE_SIZE;

const edgeStartPoint = getEdgePoint(
  sourceCenterX,
  sourceCenterY,
  toX,  // target is mouse position
  toY,
  NODE_INNER_RADIUS
);

// Line from edgeStartPoint to toX, toY
```

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Mouse at node center (distance = 0) | Handle division by zero in `getEdgePoint` |
| Fast dragging | Use store node positions for real-time updates |

## Files to Modify

1. `src/store/graphStore.ts` - Add `updateEdgeWeight` action
2. `src/components/canvas/CustomEdge.tsx` - Add double-click editing
3. `src/components/canvas/CustomConnectionLine.tsx` - Calculate edge start point

## Implementation Order

1. Add `updateEdgeWeight` to store
2. Implement double-click editing in CustomEdge
3. Update CustomConnectionLine to start from edge point
