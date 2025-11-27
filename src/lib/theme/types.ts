/**
 * Campaign Theme Configuration Types
 * Defines the full palette system for campaign customization
 */

export type ThemePreset = 'default' | 'dark-fantasy' | 'high-fantasy' | 'gothic' | 'nature';

export type BackgroundPattern = 'none' | 'parchment' | 'leather' | 'stone' | 'stars';

/**
 * Campaign theme configuration stored in campaign.json
 */
export interface CampaignThemeConfig {
  /** Primary brand color (hex) */
  primary: string;
  /** Secondary brand color (hex) */
  secondary: string;
  /** Optional accent color (hex) - auto-derived if not set */
  accent?: string;
  /** Fantasy preset - includes colors, patterns, borders, fonts */
  preset?: ThemePreset;
  /** Background pattern - set by preset or overridden */
  backgroundPattern?: BackgroundPattern;
}

/**
 * Full resolved theme with all derived values
 * Generated from CampaignThemeConfig
 */
export interface ResolvedTheme {
  // Core colors (HSL values as "h s% l%" strings)
  primary: string;
  primaryForeground: string;
  primaryLight: string;
  primaryDark: string;

  secondary: string;
  secondaryForeground: string;
  secondaryLight: string;
  secondaryDark: string;

  accent: string;
  accentForeground: string;

  // Auto-derived semantic colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;

  // Fantasy accent
  gold: string;

  // Preset metadata
  preset: ThemePreset;
  backgroundPattern: BackgroundPattern;
  fontAccent?: string;
}

/**
 * Theme preset definitions
 */
export interface ThemePresetConfig {
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent?: string;
  backgroundPattern: BackgroundPattern;
  fontAccent: string;
  gold?: string;
}

/**
 * CSS variable map for applying theme to DOM
 */
export type ThemeCSSVariables = Record<string, string>;
