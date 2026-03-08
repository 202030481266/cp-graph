import React, { useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type ReactFlowState,
} from '@xyflow/react';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  data,
  style,
}) => {
  // 使用 useStore 订阅节点位置变化，实现更流畅的拖动效果
  const nodePositions = useStore(useCallback((store: ReactFlowState) => {
    const sourceNode = store.nodeLookup.get(source);
    const targetNode = store.nodeLookup.get(target);
    return {
      sourceX: (sourceNode?.position?.x as number) ?? 0,
      sourceY: (sourceNode?.position?.y as number) ?? 0,
      targetX: (targetNode?.position?.x as number) ?? 0,
      targetY: (targetNode?.position?.y as number) ?? 0,
    };
  }, [source, target]));

  // 节点半径 (CustomNode 尺寸是 32x32px，边框 1px，可视填充区域半径约 15px)
  const nodeRadius = 15;
  // 箭头大小 - 锐利细长设计
  const arrowSize = 12;                // 增加长度，让箭头更细长
  const baseLength = arrowSize * 0.35; // 3.5，更窄的底部，锐利效果

  // 提取 data 属性
  const edgeData = data as { weight?: number; isHighlighted?: boolean; directed?: boolean } | undefined;
  const weight = edgeData?.weight;
  const isHighlighted = edgeData?.isHighlighted;
  const directed = edgeData?.directed;

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

  const sourceCenterX = nodePositions.sourceX + halfSize;
  const sourceCenterY = nodePositions.sourceY + halfSize;
  const targetCenterX = nodePositions.targetX + halfSize;
  const targetCenterY = nodePositions.targetY + halfSize;

  // 计算边的起点（从源节点圆形边缘开始）
  const sourceEdgePoint = getEdgePoint(
    sourceCenterX,
    sourceCenterY,
    targetCenterX,
    targetCenterY,
    nodeRadius
  );

  // 有向图和无向图：边的终点都在目标节点边缘
  // 箭头是单独绘制的，不需要在边的终点预留额外空间
  const targetOffset = nodeRadius;
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
  const strokeColor = isHighlighted ? '#ff6b6b' : '#000000';
  const strokeWidth = isHighlighted ? 2 : 1;

  // 计算箭头路径（手动绘制，确保尖端正好在目标节点边缘）
  const getArrowPath = () => {
    if (!directed) return null;

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
          stroke: strokeColor,
          strokeWidth,
          willChange: 'stroke', // 优化边的绘制性能
          ...style,
        }}
      />
      {arrowPath && (
        <path
          d={arrowPath}
          fill={strokeColor}
          stroke="none"
          style={{ willChange: 'transform' }} // 优化箭头渲染性能
        />
      )}
      {weight !== undefined && (
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
            {weight}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
