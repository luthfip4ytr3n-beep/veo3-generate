import { GoogleGenAI } from "@google/genai";
import { VideoSettings } from "../types";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateVeoVideo = async (
  prompt: string,
  imageFile: File | null,
  settings: VideoSettings
): Promise<string> => {
  // Always create a new instance to ensure we capture the latest selected API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare configuration
  // Note: Sound enabling is currently a prompting/model capability. 
  // We append to prompt if enabled as the config doesn't strictly support an 'audio' boolean yet in all versions.
  let finalPrompt = prompt;
  if (settings.enableSound) {
    finalPrompt += ". Include high quality sound design and audio.";
  }

  const config: any = {
    numberOfVideos: 1,
    resolution: settings.resolution,
    aspectRatio: settings.aspectRatio,
  };

  let operation;

  try {
    if (imageFile) {
      const imageBase64 = await fileToBase64(imageFile);
      
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        image: {
          imageBytes: imageBase64,
          mimeType: imageFile.type,
        },
        config: config
      });
    } else {
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: finalPrompt,
        config: config
      });
    }

    // Polling Loop
    while (!operation.done) {
      // Wait 5 seconds before checking again (Veo is fast but video takes time)
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!videoUri) {
      throw new Error("No video URI returned from the API.");
    }

    // Fetch the actual video bytes using the API key
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};