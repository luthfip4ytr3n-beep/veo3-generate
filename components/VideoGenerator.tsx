import React, { useState, useRef, useEffect } from 'react';
import { VideoSettings, AspectRatio, Resolution } from '../types';
import { generateVeoVideo } from '../services/api';
import { 
  Film, 
  Image as ImageIcon, 
  Settings, 
  Download, 
  Play, 
  Loader2, 
  AlertCircle,
  X,
  Music,
  Maximize2
} from 'lucide-react';

const VideoGenerator: React.FC = () => {
  // State
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<VideoSettings>({
    aspectRatio: '16:9',
    resolution: '720p',
    enableSound: false,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const parseJsonPrompt = () => {
    try {
      const parsed = JSON.parse(prompt);
      // Attempt to extract prompt text if it's a structured object
      if (parsed.prompt && typeof parsed.prompt === 'string') {
        setPrompt(parsed.prompt);
      } else if (parsed.text && typeof parsed.text === 'string') {
        setPrompt(parsed.text);
      } else {
        // If it's just a JSON object but we can't find a standard key, pretty print it back
        setPrompt(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      // Not JSON, do nothing
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleGenerate = async () => {
    if (!prompt && !imageFile) {
      setError("Please provide at least a text prompt or an image.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setProgressMessage("Initializing Veo 3 model...");

    try {
      // Simulate progress messages since the API is polling
      const progressInterval = setInterval(() => {
        setProgressMessage(prev => {
          if (prev === "Initializing Veo 3 model...") return "Processing inputs...";
          if (prev === "Processing inputs...") return "Generating frames...";
          if (prev === "Generating frames...") return "Rendering video...";
          if (prev === "Rendering video...") return "Finalizing output...";
          return prev;
        });
      }, 4000);

      const url = await generateVeoVideo(prompt, imageFile, settings);
      
      clearInterval(progressInterval);
      setGeneratedVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
      
      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-veo-400 to-purple-400 bg-clip-text text-transparent">
          Veo 3 Studio
        </h1>
        <p className="text-gray-400">Next-generation cinematic video generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Prompt Input */}
          <div className="bg-dark-card p-6 rounded-2xl border border-gray-700 shadow-xl">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Film className="w-4 h-4 text-veo-400" />
              Video Prompt
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                onBlur={parseJsonPrompt}
                placeholder="Describe your video in detail, or paste a JSON configuration..."
                className="w-full h-40 bg-dark-input text-gray-100 border border-gray-600 rounded-xl p-4 focus:ring-2 focus:ring-veo-500 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                Supports String / JSON
              </div>
            </div>
          </div>

          {/* Reference Image */}
          <div className="bg-dark-card p-6 rounded-2xl border border-gray-700 shadow-xl">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-veo-400" />
              Reference Image (Optional)
            </label>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer hover:bg-dark-input transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-veo-400 transition-colors mb-2" />
                  <p className="text-xs text-gray-400">Click to upload reference frame</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-gray-600">
                <img src={imagePreview} alt="Reference" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={clearImage}
                    className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-dark-card p-6 rounded-2xl border border-gray-700 shadow-xl">
            <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-veo-400" />
              Configuration
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Aspect Ratio */}
              <div>
                <span className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Aspect Ratio</span>
                <div className="flex gap-2">
                  {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setSettings(s => ({ ...s, aspectRatio: ratio }))}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        settings.aspectRatio === ratio
                          ? 'bg-veo-600 text-white shadow-lg shadow-veo-900/50'
                          : 'bg-dark-input text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <span className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Resolution</span>
                <div className="flex gap-2">
                  {(['720p', '1080p'] as Resolution[]).map((res) => (
                    <button
                      key={res}
                      onClick={() => setSettings(s => ({ ...s, resolution: res }))}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        settings.resolution === res
                          ? 'bg-veo-600 text-white shadow-lg shadow-veo-900/50'
                          : 'bg-dark-input text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="mt-6 flex items-center justify-between p-3 bg-dark-input rounded-lg border border-gray-600">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${settings.enableSound ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-gray-200">Generate Sound</div>
               </div>
               <button 
                  onClick={() => setSettings(s => ({ ...s, enableSound: !s.enableSound }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableSound ? 'bg-veo-500' : 'bg-gray-600'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.enableSound ? 'left-7' : 'left-1'}`} />
               </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
              isGenerating
                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-veo-600 to-purple-600 hover:from-veo-500 hover:to-purple-500 text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Generate Video
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-7">
          <div className={`h-full min-h-[500px] bg-dark-card rounded-2xl border border-gray-700 shadow-xl overflow-hidden relative flex flex-col ${settings.aspectRatio === '9:16' ? 'items-center' : ''}`}>
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-mono text-gray-300">
                <Maximize2 className="w-3 h-3" />
                {settings.resolution} • {settings.aspectRatio}
              </div>
              {generatedVideoUrl && (
                <a 
                  href={generatedVideoUrl} 
                  download={`veo-video-${Date.now()}.mp4`}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-veo-600 hover:bg-veo-500 text-white text-xs font-bold transition-colors shadow-lg"
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full h-full flex items-center justify-center bg-black/40 p-4">
              {isGenerating ? (
                <div className="text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-veo-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-veo-500 border-t-transparent animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-veo-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Creating Magic</h3>
                    <p className="text-veo-300 animate-pulse">{progressMessage}</p>
                    <p className="text-xs text-gray-500 mt-4 max-w-xs mx-auto">This may take a minute or two. The Veo model is synthesizing video frames.</p>
                  </div>
                </div>
              ) : generatedVideoUrl ? (
                <video 
                  src={generatedVideoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className={`max-h-full shadow-2xl rounded-lg ${
                    settings.aspectRatio === '9:16' 
                      ? 'w-auto h-full aspect-[9/16]' 
                      : 'w-full h-auto aspect-[16/9]'
                  }`}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="w-20 h-20 bg-dark-input rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                    <Film className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-lg font-medium text-gray-400">Ready to Generate</p>
                  <p className="text-sm text-gray-600 mt-2">Configure your settings and click generate</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;