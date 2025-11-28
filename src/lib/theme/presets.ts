import { ThemePreset, ThemePresetConfig } from './types';

/**
 * Full theme presets
 * Each includes colors, patterns, border styles, and font preferences
 */
export const themePresets: Record<ThemePreset, ThemePresetConfig> = {
  default: {
    name: 'Purple Fantasy',
    description: 'Classic purple fantasy theme with parchment accents',
    primary: '#ab47bc',
    secondary: '#7b1fa2',
    accent: '#e91e63',
    backgroundPattern: 'parchment',
    fontAccent: 'Cinzel',
    gold: '#f5a623',
  },

  'dark-fantasy': {
    name: 'Dark Fantasy',
    description: 'Blood red and shadow - for grimdark campaigns',
    primary: '#8b0000',
    secondary: '#2d1b1b',
    accent: '#ff4444',
    backgroundPattern: 'leather',
    fontAccent: 'Cinzel Decorative',
    gold: '#8b6914',
  },

  'high-fantasy': {
    name: 'High Fantasy',
    description: 'Bright skies and silver - for epic adventures',
    primary: '#4fc3f7',
    secondary: '#0288d1',
    accent: '#00e5ff',
    backgroundPattern: 'stars',
    fontAccent: 'Playfair Display',
    gold: '#c0c0c0', // Silver instead of gold
  },

  gothic: {
    name: 'Gothic',
    description: 'Deep violet and midnight - for horror and mystery',
    primary: '#9c27b0',
    secondary: '#311b92',
    accent: '#ea80fc',
    backgroundPattern: 'stone',
    fontAccent: 'EB Garamond',
    gold: '#4a148c',
  },

  nature: {
    name: 'Nature',
    description: 'Forest greens - for wilderness and druid campaigns',
    primary: '#4caf50',
    secondary: '#2e7d32',
    accent: '#8bc34a',
    backgroundPattern: 'none',
    fontAccent: 'Alegreya',
    gold: '#cddc39',
  },
};

/**
 * Get a theme preset by name
 */
export function getThemePreset(preset: ThemePreset): ThemePresetConfig {
  return themePresets[preset] || themePresets.default;
}

/**
 * Get all available presets for UI selection
 */
export function getAllPresets(): Array<{ id: ThemePreset; config: ThemePresetConfig }> {
  return Object.entries(themePresets).map(([id, config]) => ({
    id: id as ThemePreset,
    config,
  }));
}
