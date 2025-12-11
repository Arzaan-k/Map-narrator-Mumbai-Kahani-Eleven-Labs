import { useState } from 'react';
import WorldMap from './components/Map/WorldMap';
import StoryCustomizer from './components/Story/StoryCustomizer';
import StoryPlayer from './components/Story/StoryPlayer';
import LoadingOverlay from './components/Story/LoadingOverlay';
import { useStoryPipeline } from './hooks/useStoryPipeline';
import { LOCATIONS } from './data/locations';
import type { Location } from './data/locations';
import './index.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const { runPipeline, isLoading, loadingStep, storyData, error, reset } = useStoryPipeline();

  const handleLocationSelect = (loc: Location) => {
    setSelectedLocation(loc);
    setShowCustomizer(true);
    reset();
  };

  const startStory = async (prefs: any) => {
    setShowCustomizer(false);
    try {
      await runPipeline(selectedLocation, prefs);
      setShowPlayer(true);
    } catch (e) {
      // Error handled in hook/UI
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white text-slate-900 overflow-hidden relative selection:bg-indigo-500/30">
      <WorldMap
        locations={LOCATIONS}
        onSelect={handleLocationSelect}
        selectedId={selectedLocation?.id}
      />

      {showCustomizer && selectedLocation && (
        <StoryCustomizer
          location={selectedLocation}
          onStartStory={startStory}
          onClose={() => setShowCustomizer(false)}
        />
      )}

      {isLoading && <LoadingOverlay step={loadingStep} />}

      {showPlayer && storyData && selectedLocation && (
        <StoryPlayer
          location={selectedLocation}
          storyData={storyData}
          onClose={() => {
            setShowPlayer(false);
            reset();
          }}
        />
      )}

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 border border-red-200 text-red-700 px-8 py-4 rounded-2xl backdrop-blur-xl z-[700] shadow-2xl flex items-center gap-4 ring-1 ring-red-100">
          <span className="font-medium">{error}</span>
          <button onClick={reset} className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-xs uppercase font-bold tracking-wider">Dismiss</button>
        </div>
      )}
    </div>
  );
}

export default App;
