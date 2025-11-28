// Theme types
export type {
  CampaignThemeConfig,
  ResolvedTheme,
  ThemeCSSVariables,
  ThemePreset,
  BackgroundPattern,
  ThemePresetConfig,
} from './types';

// Theme generation utilities
export {
  generateTheme,
  generateThemeFromColors,
  themeToCSSVariables,
  applyThemeToDOM,
  removeThemeFromDOM,
} from './generate-theme';

// Theme presets
export {
  themePresets,
  getThemePreset,
  getAllPresets,
} from './presets';

// React context and hooks
export {
  CampaignThemeProvider,
  useCampaignTheme,
  useApplyCampaignTheme,
} from './campaign-theme-provider';
