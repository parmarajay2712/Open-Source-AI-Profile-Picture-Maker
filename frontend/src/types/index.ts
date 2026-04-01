export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

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
  category: StyleCategory;
}

export type StyleCategory = 'business' | 'artistic' | 'creative';

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

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface EditorState {
  jobId: string | null;
  originalUrl: string | null;
  resultUrl: string | null;
  status: JobStatus | 'idle';
  progress: number;
  error: string | null;
  selectedStyle: StylePresetId | null;
  backgroundOptions: BackgroundOptions | null;
}
