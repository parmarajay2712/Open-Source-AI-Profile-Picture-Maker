import axios, { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import { AIService, StylePreset, BackgroundOptions, STYLE_PRESETS } from '../types';

const REMBG_URL = process.env.REMBG_SERVICE_URL || 'http://localhost:8001';
const GFPGAN_URL = process.env.GFPGAN_SERVICE_URL || 'http://localhost:8002';
const SD_URL = process.env.SD_SERVICE_URL || 'http://localhost:8003';
const TEMP_DIR = process.env.TEMP_DIR || './temp';

function generateOutputPath(suffix: string): string {
  return path.join(TEMP_DIR, `${uuidv4()}_${suffix}.png`);
}

async function callAIService(
  serviceUrl: string,
  endpoint: string,
  inputPath: string,
  extraFields?: Record<string, string>
): Promise<string> {
  const outputPath = generateOutputPath(endpoint.replace('/', '_'));

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(inputPath));

    if (extraFields) {
      for (const [key, value] of Object.entries(extraFields)) {
        formData.append(key, value);
      }
    }

    const response = await axios.post(`${serviceUrl}${endpoint}`, formData, {
      headers: formData.getHeaders(),
      responseType: 'arraybuffer',
      timeout: 120000,
      maxContentLength: 50 * 1024 * 1024,
    });

    fs.writeFileSync(outputPath, Buffer.from(response.data));
    return outputPath;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
      throw Object.assign(new Error(`AI service is unavailable. Please try again later.`), {
        statusCode: 503,
        code: 'SERVICE_UNAVAILABLE',
      });
    }
    if (axiosError.response?.status === 503) {
      throw Object.assign(new Error('AI service is currently overloaded. Please try again later.'), {
        statusCode: 503,
        code: 'SERVICE_OVERLOADED',
      });
    }
    throw Object.assign(new Error(`AI processing failed: ${axiosError.message}`), {
      statusCode: 502,
      code: 'AI_PROCESSING_FAILED',
    });
  }
}

export const aiService: AIService = {
  async removeBackground(inputPath: string): Promise<string> {
    return callAIService(REMBG_URL, '/remove-bg', inputPath);
  },

  async enhanceFace(inputPath: string): Promise<string> {
    return callAIService(GFPGAN_URL, '/enhance', inputPath);
  },

  async applyStyle(inputPath: string, preset: StylePreset): Promise<string> {
    return callAIService(SD_URL, '/apply-style', inputPath, {
      prompt: preset.prompt,
      preset_id: preset.id,
    });
  },

  async replaceBackground(inputPath: string, options: BackgroundOptions): Promise<string> {
    return callAIService(REMBG_URL, '/replace-bg', inputPath, {
      bg_type: options.type,
      bg_value: options.value,
    });
  },
};

export function getPresetById(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find((p) => p.id === id);
}
