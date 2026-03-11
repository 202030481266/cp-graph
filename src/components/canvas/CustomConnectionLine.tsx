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
