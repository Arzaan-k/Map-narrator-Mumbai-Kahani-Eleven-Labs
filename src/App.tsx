import { useState } from 'react';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import WorldMap from './components/Map/WorldMap';
import StoryCustomizer from './components/Story/StoryCustomizer';
import StoryPlayer from './components/Story/StoryPlayer';
import LoadingOverlay from './components/Story/LoadingOverlay';
import AuthHeader from './components/Auth/AuthHeader';
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
    <div className="w-screen h-screen bg-slate-50 text-slate-900 overflow-hidden relative selection:bg-cyan-500/30">
      {/* Beautiful Landing Page */}
      <SignedOut>
        <div className="w-full h-full relative overflow-hidden bg-[#0a0a1a] text-white">

          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-sm scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a1a] via-transparent to-[#0a0a1a]/50" />

          {/* Animated Particles/Orbs - simulated with CSS */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-700" />

          <div className="relative z-10 w-full h-full flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

              {/* Left Side: Hero Text */}
              <div className="space-y-8 text-center md:text-left">
                <div className="space-y-2">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium tracking-wider uppercase backdrop-blur-md">
                    Now with ElevenLabs v3 Alpha
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
                      Mumbai
                    </span>
                    <span className="block text-white mt-2">
                      Kahaani
                    </span>
                  </h1>
                </div>

                <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-lg mx-auto md:mx-0">
                  Experience the soul of the city through ultra-realistic AI composition.
                  Travel through time, listen to the streets, and converse with history.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4 max-w-md mx-auto md:mx-0">
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <span className="text-2xl">🎙️</span>
                    <span className="text-sm font-semibold text-gray-200">Authentic Voices</span>
                    <span className="text-xs text-gray-400">Deep Indian narration tones</span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <span className="text-2xl">⏳</span>
                    <span className="text-sm font-semibold text-gray-200">Time Travel</span>
                    <span className="text-xs text-gray-400">Explore 7 historical eras</span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <span className="text-2xl">🇮🇳</span>
                    <span className="text-sm font-semibold text-gray-200">Multilingual</span>
                    <span className="text-xs text-gray-400">Hindi, English, Hinglish</span>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <span className="text-2xl">🧠</span>
                    <span className="text-sm font-semibold text-gray-200">Fact-Based</span>
                    <span className="text-xs text-gray-400">Powered by Perplexity</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Login Card */}
              <div className="flex justify-center md:justify-end">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md w-full relative group">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 space-y-6 text-center">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                      <p className="text-sm text-gray-300">Sign in to access your saved journeys</p>
                    </div>

                    <div className="flex justify-center">
                      <SignIn
                        appearance={{
                          elements: {
                            rootBox: "w-full",
                            card: "bg-transparent shadow-none w-full p-0",
                            header: "hidden", // Hide default header as we built our own
                            formButtonPrimary: "bg-white text-black hover:bg-gray-100 transition-colors h-10 rounded-xl text-sm font-semibold",
                            footerActionLink: "text-blue-300 hover:text-blue-200",
                            formFieldLabel: "text-gray-300",
                            formFieldInput: "bg-black/30 border-white/10 text-white focus:border-blue-400 rounded-xl",
                            socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl",
                            dividerLine: "bg-white/10",
                            dividerText: "text-gray-400"
                          }
                        }}
                        routing="hash"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Stripe */}
          <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5 bg-[#0a0a1a]/90 backdrop-blur-md flex justify-between items-center text-xs text-gray-500">
            <div>
              &copy; 2024 Mumbai Kahaani. Designed with ❤️ for the city.
            </div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </SignedOut>

      {/* Show app when authenticated */}
      <SignedIn>
        <AuthHeader />

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
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl backdrop-blur-xl z-[700] shadow-2xl flex items-center gap-4">
            <span>{error}</span>
            <button onClick={reset} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 rounded transition-colors text-xs uppercase font-bold tracking-wider">Dismiss</button>
          </div>
        )}
      </SignedIn>
    </div>
  );
}

export default App;
