# Edge Editing Features Design (v2)

Date: 2026-03-11

## Overview

本文档涵盖两个图编辑功能的设计与实施方案：

1. **Edge Weight Editing** — 双击边（或权重 label）进入内联编辑模式
2. **Connection Line from Edge** — 拖动连线时，起点从节点边缘出发，而非固定在 handle 位置

---

## Feature 1: Edge Weight Editing

### 用户交互

| 操作 | 触发条件 |
|------|----------|
| 双击边或权重 label | 进入编辑模式，label 变为 `<input>` |
| 按 Enter | 确认并保存新值 |
| 点击 input 以外区域（blur） | 确认并保存新值 |
| 按 Escape | 取消，恢复原值 |

> **前提**：仅当 `config.weighted === true` 时才响应双击事件；否则无任何效果。

---

### Data Layer — `src/store/graphStore.ts`

在 `GraphState` interface 中新增：

```typescript
updateEdgeWeight: (edgeId: string, weight: number | undefined) => void;
```

在 `create<GraphState>` 的实现中新增：

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

> 无需改动 `GraphEdge` 类型，`data.weight` 已是 `number | undefined`。

---

### UI Layer — `src/components/canvas/CustomEdge.tsx`

#### 新增 local state

```typescript
const [isEditing, setIsEditing] = useState(false);
const [editValue, setEditValue] = useState('');
```

#### 提交逻辑（封装为函数，Enter / blur 共用）

```typescript
const { updateEdgeWeight } = useGraphStore();

const commitEdit = () => {
  const parsed = parseFloat(editValue);
  if (!isNaN(parsed)) {
    updateEdgeWeight(id, parsed);
  }
  // 非数字 / 空字符串：保留原值，不写 store
  setIsEditing(false);
};
```

#### 双击进入编辑模式

```typescript
const handleDoubleClick = (e: React.MouseEvent) => {
  e.stopPropagation();          // 阻止冒泡，防止触发 ReactFlow canvas 级双击事件
  if (!config.weighted) return; // 非加权图不响应
  setEditValue(weight !== undefined ? String(weight) : '');
  setIsEditing(true);
};
```

#### input 事件处理

```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    commitEdit();
  } else if (e.key === 'Escape') {
    setIsEditing(false); // 直接关闭，不写 store
  }
};
```

#### Weight label 渲染（替换现有 `{weight !== undefined && ...}` 块）

```tsx
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

> **说明**：
> - 将原来的 `weight !== undefined` 判断改为 `config.weighted`，确保加权模式下始终渲染 label 区域（即使 weight 未设置），使双击区域可被发现。
> - `autoFocus` 替代手动 `ref.focus()`，`autoFocus` 在 `EdgeLabelRenderer` portal 中工作正常。
> - `input` 使用 `type="text"` 而非 `type="number"`，避免中文输入法兼容性问题，在 `commitEdit` 中手动用 `parseFloat` 验证。

---

### Edge Cases

| 场景 | 处理方式 |
|------|----------|
| 输入非数字（如 `abc`） | `parseFloat` 返回 `NaN`，不写 store，保留原值 |
| 输入空字符串 | `parseFloat('')` 返回 `NaN`，同上，保留原值 |
| 输入负数（如 `-3`） | 合法，允许（图论中边权可为负） |
| 输入小数（如 `1.5`） | 合法，存储为 `number`；**如需限制精度**，在 `commitEdit` 中改为 `Math.round(parsed * 100) / 100` |
| `config.weighted === false` | `handleDoubleClick` 提前 return，label 不渲染，无任何效果 |
| ReactFlow canvas 双击事件 | `e.stopPropagation()` 阻断冒泡，不会触发 canvas 级操作（如 zoom-to-fit） |

---

## Feature 2: Connection Line from Edge

### 问题描述

当前 `CustomConnectionLine` 直接使用 ReactFlow 传入的 `fromX / fromY`（即 handle 位置，固定为节点顶部中心）作为连线起点。而 `CustomEdge` 中边的起点是通过 `getEdgePoint()` 动态计算出的节点圆边交点，两者视觉不一致，拖动时有明显跳变。

### 解决方案

在 `CustomConnectionLine` 中，通过 store 查找 source node 的位置，计算节点圆心，再用 `getEdgePoint()` 计算鼠标方向上的圆边交点，以该交点作为连线起点。

---

### 坐标系确认（实施前必读）

`CustomConnectionLine` 的 props `fromX / fromY / toX / toY` 均为 **ReactFlow flow 坐标系**（已经过 viewport transform 的逆变换），与 `sourceNode.position` 的坐标系**一致**。可以直接混用，无需额外转换。

验证方式（可在开发时临时添加，确认后删除）：

```typescript
console.log('handle fromX/fromY:', fromX, fromY);
console.log('computed center:', sourceCenterX, sourceCenterY);
// 两者应非常接近（差值 ≈ HALF_NODE_SIZE）
```

---

### 除零保护

当鼠标与节点圆心距离极小（< 1px）时，`getEdgePoint` 内部已做处理（返回 `fromX / fromY`），但 `generateConnectionArrowPath` 可能接收到退化向量。建议在 `CustomConnectionLine` 中增加保护：

```typescript
const dx = toX - sourceCenterX;
const dy = toY - sourceCenterY;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance < 1) {
  // 距离过近，不渲染连线（避免退化路径）
  return null;
}
```

---

### Implementation — `src/components/canvas/CustomConnectionLine.tsx`

完整替换实现：

```typescript
import React, { useCallback } from 'react';
import type { ConnectionLineComponentProps } from '@xyflow/react';
import { useStore } from '@xyflow/react';
import type { ReactFlowState } from '@xyflow/react';
import { useGraphStore } from '../../store/graphStore';
import { generateConnectionArrowPath } from '../../utils/arrow';
import { getEdgePoint } from '../../utils/geometry';
import { NODE_SIZE, NODE_INNER_RADIUS } from '../../constants/graph';

const HALF_NODE_SIZE = NODE_SIZE / 2;
const EDGE_COLOR = '#000000';

export const CustomConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  fromNode,   // ReactFlow 提供，包含 source node id
  toX,
  toY,
}) => {
  const { config } = useGraphStore();
  const { directed } = config;

  // 从 ReactFlow store 中读取 source node 的实时位置（与 CustomEdge 保持一致）
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

  // 计算圆边起点（与 CustomEdge 中 sourceEdgePoint 计算方式完全一致）
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

> **关键变更**：
> - 不再使用 `fromX / fromY`（固定 handle 位置），改用 store 中 source node 的实时 position 计算圆心
> - `getEdgePoint(sourceCenterX, sourceCenterY, toX, toY, NODE_INNER_RADIUS)` 与 `CustomEdge` 中 `sourceEdgePoint` 的计算方式完全镜像，保证视觉一致
> - `generateConnectionArrowPath` 的入参也同步改为 `edgeStart`，而非圆心

---

### `NODE_INNER_RADIUS` 与 `NODE_SIZE` 对齐说明

两个常量均来自 `src/constants/graph.ts`，与 `CustomNode` 实际渲染的圆半径保持一致。如果 `CustomNode` 的圆有 border，需确认 `NODE_INNER_RADIUS` 指的是**视觉边缘**（含 border）还是**内径**。

- 若 border 宽度为 `b`px，视觉边缘半径 = `NODE_INNER_RADIUS + b/2`
- 当前 `CustomEdge` 也使用同一常量，因此两者误差相同，视觉上一致

---

### Edge Cases

| 场景 | 处理方式 |
|------|----------|
| 鼠标与圆心距离 < 1px | `return null`，不渲染连线 |
| `fromNode` 为 undefined | `sourcePosition` 为 null，`return null` |
| 快速拖动 | 读取 ReactFlow store（`nodeLookup`）而非 graphStore，与 `CustomEdge` 同源，实时性一致 |
| viewport 缩放 / 平移 | `toX / toY` 与 `sourcePosition` 均为 flow 坐标系，不受影响 |

---

## Files to Modify

| 文件 | 改动内容 |
|------|----------|
| `src/store/graphStore.ts` | 新增 `updateEdgeWeight` action（interface + 实现） |
| `src/components/canvas/CustomEdge.tsx` | 新增 `isEditing` / `editValue` state，双击编辑逻辑，重构 weight label 渲染 |
| `src/components/canvas/CustomConnectionLine.tsx` | 从 store 读取 source node position，使用 `getEdgePoint` 计算起点 |

不需要修改 `src/utils/geometry.ts`（`getEdgePoint` 现有实现已满足需求）。

---

## Implementation Order

1. **`graphStore.ts`** — 纯 store 改动，风险最低，先做
2. **`CustomConnectionLine.tsx`** — 独立组件，不影响现有边渲染，先实施并验证坐标系
3. **`CustomEdge.tsx`** — 涉及交互逻辑最复杂，最后实施

### 验证 Checklist

**Feature 2（先验证）**
- [ ] 拖动时连线起点跟随鼠标方向贴合圆边
- [ ] 缩放 / 平移画布后拖动，起点无偏移
- [ ] 鼠标贴近源节点中心时，连线消失（不渲染）而非崩溃
- [ ] 有向图模式下，箭头方向和起点一致

**Feature 1（后验证）**
- [ ] 双击 weight label，进入编辑模式，input 自动获焦
- [ ] 输入合法数字后 Enter 确认，label 更新
- [ ] blur 确认，行为与 Enter 一致
- [ ] Escape 取消，label 恢复原值
- [ ] 输入非数字后确认，label 恢复原值
- [ ] `config.weighted === false` 时，双击无任何反应
- [ ] 双击不触发 ReactFlow canvas 层面的事件（如 zoom-to-fit）