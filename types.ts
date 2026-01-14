export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface VideoSettings {
  aspectRatio: AspectRatio;
  resolution: Resolution;
  enableSound: boolean;
}

export interface GenerationRequest {
  prompt: string;
  image: File | null;
  settings: VideoSettings;
}

export interface GeneratedVideo {
  url: string;
  mimeType: string;
}
