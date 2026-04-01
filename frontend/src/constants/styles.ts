import { StylePreset, StyleCategory } from '../types';

export const STYLE_PRESETS: readonly StylePreset[] = [
  {
    id: 'professional',
    label: 'Professional',
    icon: '💼',
    prompt: 'professional headshot, studio lighting, business attire, clean background',
    category: 'business',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '🔵',
    prompt: 'LinkedIn profile photo, confident smile, modern office background',
    category: 'business',
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    icon: '🧙',
    prompt: 'fantasy portrait, magical aura, ethereal lighting, epic background',
    category: 'creative',
  },
  {
    id: 'anime',
    label: 'Anime',
    icon: '✨',
    prompt: 'anime style portrait, vibrant colors, detailed illustration',
    category: 'creative',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    icon: '🤖',
    prompt: 'cyberpunk portrait, neon lights, futuristic city, rain',
    category: 'creative',
  },
  {
    id: 'oil-painting',
    label: 'Oil Paint',
    icon: '🎨',
    prompt: 'oil painting portrait, classical style, rich colors, brushstrokes',
    category: 'artistic',
  },
] as const;

export const STYLE_CATEGORIES: { id: StyleCategory; label: string }[] = [
  { id: 'business', label: 'Business' },
  { id: 'artistic', label: 'Artistic' },
  { id: 'creative', label: 'Creative' },
];

export const BACKGROUND_COLORS = [
  '#FFFFFF',
  '#000000',
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#e94560',
  '#7C3AED',
  '#EC4899',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#6366F1',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
] as const;
