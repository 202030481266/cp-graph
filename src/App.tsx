import GraphCanvas from './components/canvas/GraphCanvas';
import Toolbar from './components/ui/Toolbar';
import InfoPanel from './components/ui/InfoPanel';

function App() {
  return (
    <div className="flex h-screen w-screen bg-white">
      <Toolbar />
      <div className="flex-1 relative">
        <GraphCanvas />
        <InfoPanel />
      </div>
    </div>
  );
}

export default App;
