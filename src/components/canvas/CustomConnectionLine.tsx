import React, { useCallback } from 'react';
import type { ConnectionLineComponentProps } from '@xyflow/react';
import { useStore } from '@xyflow/react';
import type { ReactFlowState } from '@xyflow/react';
import { useGraphStore } from '../../store/graphStore';
import { generateConnectionArrowPath } from '../../utils/arrow';
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

  const dx = toX - sourceCenterX;
  const dy = toY - sourceCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < NODE_INNER_RADIUS) return null;

  const ratio = NODE_INNER_RADIUS / distance;
  const edgeStartX = sourceCenterX + dx * ratio;
  const edgeStartY = sourceCenterY + dy * ratio;

  const linePath = `M ${edgeStartX} ${edgeStartY} L ${toX} ${toY}`;

  const arrowPath = directed
    ? generateConnectionArrowPath(edgeStartX, edgeStartY, toX, toY)
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
