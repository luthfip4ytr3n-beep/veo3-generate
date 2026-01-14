import React, { useEffect, useState } from 'react';
import VideoGenerator from './components/VideoGenerator';
import { KeyRound, ExternalLink, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // If the extension/environment isn't detected, we might default to false 
        // or handle it gracefully. Here we assume false to force selection flow 
        // if the API is present.
        setHasApiKey(false);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasApiKey(false);
    }
  };

  const handleSelectKey = async () => {
    if (!window.aistudio || !window.aistudio.openSelectKey) {
      alert("AI Studio environment not detected.");
      return;
    }

    setIsSelecting(true);
    try {
      await window.aistudio.openSelectKey();
      // Assume success after the dialog closes/promise resolves to mitigate race conditions
      setHasApiKey(true);
    } catch (e) {
      console.error("Failed to select key:", e);
      // In case of error (e.g. user cancelled), re-check
      await checkApiKey();
    } finally {
      setIsSelecting(false);
    }
  };

  // Loading state while checking initial key status
  if (hasApiKey === null) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-veo-500 animate-spin" />
      </div>
    );
  }

  // Not Authenticated View
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="z-10 max-w-md w-full bg-dark-card border border-gray-700 p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 bg-veo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-veo-700/50">
            <KeyRound className="w-8 h-8 text-veo-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to Veo 3</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            To generate high-quality AI videos, you need to connect a Google Cloud Project with a paid API key.
          </p>

          <button
            onClick={handleSelectKey}
            disabled={isSelecting}
            className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSelecting ? 'Waiting for selection...' : 'Select API Key'}
          </button>

          <div className="mt-6 flex justify-center">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-veo-400 transition-colors"
            >
              Learn more about billing <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-veo-500/30">
      <div className="fixed inset-0 z-[-1] pointer-events-none">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-veo-600/5 rounded-full blur-[100px]" />
      </div>
      <VideoGenerator />
    </div>
  );
};

export default App;