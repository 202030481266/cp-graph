import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  weight?: number;
  isLCA?: boolean;
  sccId?: number;
  isHighlighted?: boolean;
  isInPath?: boolean;
}

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
}

const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  let bgColor = '#ffffff';
  let borderColor = '#000000';
  let textColor = '#000000';

  // Keep original colors for algorithm highlights
  if (data.isLCA) {
    bgColor = '#ff6b6b';
    textColor = '#ffffff';
  } else if (data.isInPath) {
    bgColor = '#4dabf7';
    textColor = '#ffffff';
  }

  if (data.sccId !== undefined) {
    const colors = ['#ff6b6b', '#4dabf7', '#51cf66', '#fcc419', '#cc5de8', '#ff922b', '#20c997', '#f06595'];
    bgColor = colors[data.sccId % colors.length];
    textColor = '#ffffff';
  }

  // Handle 样式 - 使用较小的尺寸，放置在节点边缘
  const handleStyle = {
    width: 8,
    height: 8,
    backgroundColor: 'transparent',
    border: 'none',
    opacity: 0,
  };

  return (
    <div
      className="custom-node"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selected ? '0 0 0 2px rgba(0, 0, 0, 0.15)' : 'none',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      {/* 四个方向的 Handle - target (输入) */}
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="target" position={Position.Bottom} style={handleStyle} />
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="target" position={Position.Right} style={handleStyle} />

      {/* 四个方向的 Handle - source (输出) */}
      <Handle type="source" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="source" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />

      <span style={{
        fontSize: 12,
        fontWeight: 400,
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: textColor,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {data.label}
      </span>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
