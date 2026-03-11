import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { GraphNodeData } from '../../types/graph';
import { NODE_SIZE, getSccColor } from '../../constants/graph';

interface CustomNodeProps {
  data: GraphNodeData;
  selected?: boolean;
}

const targetHandleStyle = {
  width: NODE_SIZE,
  height: NODE_SIZE,
  borderRadius: '50%',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'transparent',
  border: 'none',
  opacity: 0,
} as const;

const sourceHandleStyle = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'transparent',
  border: 'none',
  cursor: 'crosshair',
  zIndex: 1,
} as const;

const labelStyle = {
  fontSize: 12,
  fontWeight: 400,
  fontFamily: 'Arial, Helvetica, sans-serif',
  lineHeight: 1,
  userSelect: 'none',
  pointerEvents: 'none',
} as const;

const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  let bgColor: string = '#ffffff';
  const borderColor: string = '#000000';
  let textColor: string = '#000000';

  // Algorithm highlight colors
  if (data.isLCA) {
    bgColor = '#ff6b6b';
    textColor = '#ffffff';
  } else if (data.isInPath) {
    bgColor = '#4dabf7';
    textColor = '#ffffff';
  }

  // SCC coloring (takes precedence)
  if (data.sccId !== undefined) {
    bgColor = getSccColor(data.sccId);
    textColor = '#ffffff';
  }

  return (
    <div
      className="custom-node"
      style={{
        width: NODE_SIZE,
        height: NODE_SIZE,
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
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
        style={targetHandleStyle}
      />
      <Handle
        type="source"
        position={Position.Top}
        style={sourceHandleStyle}
      />

      <span style={{ ...labelStyle, color: textColor }}>
        {data.label}
      </span>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
