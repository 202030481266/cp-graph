import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';

interface EdgeData {
  weight?: number;
  isHighlighted?: boolean;
  directed?: boolean;
}

export const CustomEdge: React.FC<EdgeProps<EdgeData>> = ({
  id,
  source,
  target,
  data,
  style,
}) => {
  const { getNode } = useReactFlow();

  // 获取源节点和目标节点
  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  // 节点半径 (CustomNode 尺寸是 32x32px，边框 1px，可视填充区域半径约 15px)
  const nodeRadius = 15;
  // 箭头大小
  const arrowSize = 10;

  // 计算从节点中心到节点边缘的点
  const getEdgePoint = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    offset: number = 0
  ) => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: fromX, y: fromY };

    const ratio = (distance - offset) / distance;
    return {
      x: fromX + dx * ratio,
      y: fromY + dy * ratio,
    };
  };

  // 获取节点中心坐标（position 是左上角，需要加上偏移量）
  const nodeSize = 32;
  const halfSize = nodeSize / 2;

  const sourceCenterX = (sourceNode?.position?.x ?? 0) + halfSize;
  const sourceCenterY = (sourceNode?.position?.y ?? 0) + halfSize;
  const targetCenterX = (targetNode?.position?.x ?? 0) + halfSize;
  const targetCenterY = (targetNode?.position?.y ?? 0) + halfSize;

  // 计算边的起点（从源节点圆形边缘开始）
  const sourceEdgePoint = getEdgePoint(
    sourceCenterX,
    sourceCenterY,
    targetCenterX,
    targetCenterY,
    nodeRadius
  );

  // 有向图：边的终点在目标节点边缘预留箭头空间
  // 无向图：边的终点就在目标节点边缘
  const targetOffset = data?.directed ? nodeRadius + arrowSize : nodeRadius;
  const targetEdgePoint = getEdgePoint(
    targetCenterX,
    targetCenterY,
    sourceCenterX,
    sourceCenterY,
    targetOffset
  );

  // 直线路径
  const edgePath = `M ${sourceEdgePoint.x} ${sourceEdgePoint.y} L ${targetEdgePoint.x} ${targetEdgePoint.y}`;

  // 标签位置在边的中点
  const labelX = (sourceEdgePoint.x + targetEdgePoint.x) / 2;
  const labelY = (sourceEdgePoint.y + targetEdgePoint.y) / 2;

  // 颜色
  const strokeColor = data?.isHighlighted ? '#ff6b6b' : '#000000';
  const strokeWidth = data?.isHighlighted ? 2 : 1;

  // 计算箭头路径（手动绘制，确保尖端正好在目标节点边缘）
  const getArrowPath = () => {
    if (!data?.directed) return null;

    const dx = sourceCenterX - targetCenterX;
    const dy = sourceCenterY - targetCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return null;

    // 单位向量（从目标指向源）
    const ux = dx / distance;
    const uy = dy / distance;

    // 箭头尖端位置（正好在节点边缘）
    const tipX = targetCenterX + ux * nodeRadius;
    const tipY = targetCenterY + uy * nodeRadius;

    // 垂直于边的单位向量
    const px = -uy;
    const py = ux;

    // 箭头底部两点
    const baseLength = arrowSize * 0.6;
    const arrowBack = arrowSize;

    return `M ${tipX} ${tipY} L ${tipX + ux * arrowBack + px * baseLength} ${tipY + uy * arrowBack + py * baseLength} L ${tipX + ux * arrowBack - px * baseLength} ${tipY + uy * arrowBack - py * baseLength} Z`;
  };

  const arrowPath = getArrowPath();

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          transition: 'all 0.2s ease',
        }}
      />
      {arrowPath && (
        <path
          d={arrowPath}
          fill={strokeColor}
          stroke="none"
        />
      )}
      {data?.weight !== undefined && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: '#fff',
              padding: '1px 4px',
              fontSize: '10px',
              fontWeight: 400,
              color: '#000',
              pointerEvents: 'all',
            }}
          >
            {data.weight}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
