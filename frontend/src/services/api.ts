import axios, { AxiosError } from 'axios';
import {
  UploadResponse,
  JobStatusResponse,
  ApplyStyleRequest,
  ReplaceBackgroundRequest,
  ApiError,
  StylePresetId,
  BackgroundType,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) {
      throw new Error(data.message);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    if (!error.response) {
      throw new Error('Cannot connect to server. Please check your connection.');
    }
    throw new Error(`Server error (${error.response.status}). Please try again.`);
  }
  throw error instanceof Error ? error : new Error('An unexpected error occurred.');
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });

    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  try {
    const response = await api.get<JobStatusResponse>(`/status/${jobId}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function removeBackground(jobId: string): Promise<void> {
  try {
    await api.post(`/remove-bg/${jobId}`);
  } catch (error) {
    handleError(error);
  }
}

export async function applyStyle(
  jobId: string,
  preset: StylePresetId,
  prompt?: string
): Promise<void> {
  try {
    const body: ApplyStyleRequest = { preset, prompt };
    await api.post(`/apply-style/${jobId}`, body);
  } catch (error) {
    handleError(error);
  }
}

export async function enhanceFace(jobId: string): Promise<void> {
  try {
    await api.post(`/enhance/${jobId}`);
  } catch (error) {
    handleError(error);
  }
}

export async function replaceBackground(
  jobId: string,
  type: BackgroundType,
  value: string
): Promise<void> {
  try {
    const body: ReplaceBackgroundRequest = { type, value };
    await api.post(`/replace-bg/${jobId}`, body);
  } catch (error) {
    handleError(error);
  }
}

export function getResultImageUrl(jobId: string): string {
  return `${API_BASE}/result/${jobId}`;
}

export function getOriginalImageUrl(jobId: string): string {
  return `${API_BASE}/result/${jobId}?type=original`;
}

export async function deleteJob(jobId: string): Promise<void> {
  try {
    await api.delete(`/job/${jobId}`);
  } catch (error) {
    handleError(error);
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.data?.status === 'ok';
  } catch {
    return false;
  }
}
