export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  status: JobStatus;
  originalPath: string;
  resultPath: string | null;
  progress: number;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface JobStatusResponse {
  status: JobStatus;
  resultUrl: string | null;
  progress: number;
  error: string | null;
}

export interface UploadResponse {
  jobId: string;
  originalUrl: string;
}

export interface HealthResponse {
  status: 'ok';
  uptime: number;
  version: string;
}

export type StylePresetId =
  | 'professional'
  | 'linkedin'
  | 'fantasy'
  | 'anime'
  | 'cyberpunk'
  | 'oil-painting';

export interface StylePreset {
  id: StylePresetId;
  label: string;
  icon: string;
  prompt: string;
}

export type BackgroundType = 'color' | 'image' | 'blur';

export interface BackgroundOptions {
  type: BackgroundType;
  value: string;
}

export interface ApplyStyleRequest {
  preset: StylePresetId;
  prompt?: string;
}

export interface ReplaceBackgroundRequest {
  type: BackgroundType;
  value: string;
}

export interface AIService {
  removeBackground(inputPath: string): Promise<string>;
  enhanceFace(inputPath: string): Promise<string>;
  applyStyle(inputPath: string, preset: StylePreset): Promise<string>;
  replaceBackground(inputPath: string, options: BackgroundOptions): Promise<string>;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

export const STYLE_PRESETS: readonly StylePreset[] = [
  { id: 'professional', label: 'Professional', icon: '💼', prompt: 'professional headshot, studio lighting, business attire, clean background' },
  { id: 'linkedin', label: 'LinkedIn', icon: '🔵', prompt: 'LinkedIn profile photo, confident smile, modern office background' },
  { id: 'fantasy', label: 'Fantasy', icon: '🧙', prompt: 'fantasy portrait, magical aura, ethereal lighting, epic background' },
  { id: 'anime', label: 'Anime', icon: '✨', prompt: 'anime style portrait, vibrant colors, detailed illustration' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🤖', prompt: 'cyberpunk portrait, neon lights, futuristic city, rain' },
  { id: 'oil-painting', label: 'Oil Paint', icon: '🎨', prompt: 'oil painting portrait, classical style, rich colors, brushstrokes' },
] as const;
