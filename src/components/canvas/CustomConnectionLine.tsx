import React from 'react';
import type { ConnectionLineComponentProps } from '@xyflow/react';
import { useGraphStore } from '../../store/graphStore';

export const CustomConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
}) => {
  const { config } = useGraphStore();
  const directed = config.directed;

  // 绘制直线
  const linePath = `M ${fromX} ${fromY} L ${toX} ${toY}`;

  // 计算箭头（如果有向图）
  const getArrowPath = () => {
    if (!directed) return null;

    const dx = fromX - toX;
    const dy = fromY - toY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return null;

    // 单位向量（从目标指向源）
    const ux = dx / distance;
    const uy = dy / distance;

    // 箭头参数 - 与 CustomEdge 保持一致
    const arrowSize = 12;
    const baseLength = arrowSize * 0.35;

    // 箭头尖端位置（在鼠标位置/目标点）
    const tipX = toX;
    const tipY = toY;

    // 垂直于边的单位向量
    const px = -uy;
    const py = ux;

    // 箭头底部两点
    const backX = tipX + ux * arrowSize;
    const backY = tipY + uy * arrowSize;

    return `M ${tipX} ${tipY} L ${backX + px * baseLength} ${backY + py * baseLength} L ${backX - px * baseLength} ${backY - py * baseLength} Z`;
  };

  const arrowPath = getArrowPath();

  return (
    <g>
      {/* 连接线 */}
      <path
        d={linePath}
        fill="none"
        stroke="#000000"
        strokeWidth={1}
      />
      {/* 箭头（如果有向图） */}
      {arrowPath && (
        <path
          d={arrowPath}
          fill="#000000"
          stroke="none"
        />
      )}
    </g>
  );
};

export default CustomConnectionLine;
