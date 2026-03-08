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

  // Handle 覆盖整个节点，放在中心位置
  const handleStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 32,
    height: 32,
    borderRadius: '50%',
    opacity: 0,
    border: 'none',
  };

  return (
    <div
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
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Top} style={handleStyle} />
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
