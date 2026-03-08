import { useGraphStore } from '../../store/graphStore';

export default function InfoPanel() {
  const { nodes, edges, algorithmResult, selectedNodes } = useGraphStore();

  return (
    <div className="absolute bottom-4 right-4 bg-white border border-black p-3 text-sm font-mono max-w-xs" style={{ boxShadow: 'none' }}>
      <div className="text-gray-600 mb-2">
        <span className="text-black">Nodes:</span> {nodes.length} |
        <span className="text-black ml-2">Edges:</span> {edges.length}
      </div>

      {selectedNodes.length > 0 && (
        <div className="text-gray-600 mb-2">
          <span className="text-black">Selected:</span>{' '}
          {selectedNodes
            .map((id) => nodes.find((n) => n.id === id)?.data.label)
            .join(', ')}
        </div>
      )}

      {algorithmResult && (
        <div className="border-t border-black pt-2 mt-2">
          {algorithmResult.type === 'shortestPath' && (
            <div>
              <div className="text-black mb-1">Shortest Path:</div>
              <div className="text-gray-600">
                Distance:{' '}
                <span className="text-black font-semibold">
                  {(algorithmResult.data as { distance: number; path: string[] }).distance}
                </span>
              </div>
              <div className="text-gray-600">
                Path:{' '}
                <span className="text-black font-semibold">
                  {(algorithmResult.data as { distance: number, path: string[] }).path
                    .map((id: string) => nodes.find((n) => n.id === id)?.data.label)
                    .join(' -> ')}
                </span>
              </div>
            </div>
          )}

          {algorithmResult.type === 'lca' && (
            <div>
              <div className="text-black mb-1">LCA Result:</div>
              <div className="text-gray-600">
                LCA:{' '}
                <span className="text-black font-semibold">
                  {nodes.find((n) => n.id === (algorithmResult.data as { lca: string; nodeIds: string[] }).lca)?.data.label}
                </span>
              </div>
            </div>
          )}

          {algorithmResult.type === 'scc' && (
            <div>
              <div className="text-black mb-1">SCC Result:</div>
              <div className="text-gray-600">
                Components:{' '}
                <span className="text-black font-semibold">
                  {(algorithmResult.data as { components: string[][], nodeToComponent: Map<string, number> }).components.length}
                </span>
              </div>
            </div>
          )}

          {algorithmResult.type === 'topoSort' && (
            <div>
              <div className="text-black mb-1">Topological Sort:</div>
              <div className="text-gray-600">
                Levels:{' '}
                <span className="text-black font-semibold">
                  {(algorithmResult.data as { levels: string[][], hasCycle: boolean }).levels.length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
