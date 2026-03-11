import { useCallback, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type ReactFlowState,
} from '@xyflow/react';
import type { GraphEdge } from '../../types/graph';
import { NODE_SIZE, NODE_INNER_RADIUS } from '../../constants/graph';
import { getEdgePoint } from '../../utils/geometry';
import { generateEdgeArrowPath } from '../../utils/arrow';
import { useGraphStore } from '../../store/graphStore';

const HALF_NODE_SIZE = NODE_SIZE / 2;
const EDGE_DEFAULT_COLOR = '#000000';
const EDGE_HIGHLIGHT_COLOR = '#ff6b6b';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  data,
  style,
}) => {
  // Subscribe to node positions for smooth dragging
  const nodePositions = useStore(
    useCallback(
      (store: ReactFlowState) => {
        const sourceNode = store.nodeLookup.get(source);
        const targetNode = store.nodeLookup.get(target);
        return {
          sourceX: sourceNode?.position?.x ?? 0,
          sourceY: sourceNode?.position?.y ?? 0,
          targetX: targetNode?.position?.x ?? 0,
          targetY: targetNode?.position?.y ?? 0,
        };
      },
      [source, target]
    )
  );

  // Type-safe edge data access
  const edgeData = (data as GraphEdge['data']) ?? {};
  const { weight, isHighlighted, directed } = edgeData;

  const { config, updateEdgeWeight } = useGraphStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      updateEdgeWeight(id, parsed);
    }
    setIsEditing(false);
  }, [editValue, id, updateEdgeWeight]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!config.weighted) return;
      setEditValue(weight !== undefined ? String(weight) : '');
      setIsEditing(true);
    },
    [config.weighted, weight]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        commitEdit();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [commitEdit]
  );

  // Calculate node centers
  const sourceCenterX = nodePositions.sourceX + HALF_NODE_SIZE;
  const sourceCenterY = nodePositions.sourceY + HALF_NODE_SIZE;
  const targetCenterX = nodePositions.targetX + HALF_NODE_SIZE;
  const targetCenterY = nodePositions.targetY + HALF_NODE_SIZE;

  // Calculate edge endpoints at node boundaries
  const sourceEdgePoint = getEdgePoint(
    sourceCenterX,
    sourceCenterY,
    targetCenterX,
    targetCenterY,
    NODE_INNER_RADIUS
  );
  const targetEdgePoint = getEdgePoint(
    targetCenterX,
    targetCenterY,
    sourceCenterX,
    sourceCenterY,
    NODE_INNER_RADIUS
  );

  // Edge path
  const edgePath = `M ${sourceEdgePoint.x} ${sourceEdgePoint.y} L ${targetEdgePoint.x} ${targetEdgePoint.y}`;

  // Label position at edge midpoint
  const labelX = (sourceEdgePoint.x + targetEdgePoint.x) / 2;
  const labelY = (sourceEdgePoint.y + targetEdgePoint.y) / 2;

  // Styling
  const strokeColor = isHighlighted ? EDGE_HIGHLIGHT_COLOR : EDGE_DEFAULT_COLOR;
  const strokeWidth = isHighlighted ? 2 : 1;

  // Arrow path for directed edges
  const arrowPath = directed
    ? generateEdgeArrowPath(
        sourceCenterX,
        sourceCenterY,
        targetCenterX,
        targetCenterY,
        NODE_INNER_RADIUS
      )
    : null;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          willChange: 'stroke',
          ...style,
        }}
      />
      {arrowPath && (
        <path
          d={arrowPath}
          fill={strokeColor}
          stroke="none"
          style={{ willChange: 'transform' }}
        />
      )}
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
    </>
  );
};

export default CustomEdge;
