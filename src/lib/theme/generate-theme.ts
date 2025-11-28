import Color from 'color';
import {
  CampaignThemeConfig,
  ResolvedTheme,
  ThemeCSSVariables,
  ThemePreset,
  BackgroundPattern,
} from './types';
import { getThemePreset } from './presets';

/**
 * Convert hex color to HSL string format "h s% l%"
 */
function hexToHSL(hex: string): string {
  try {
    const color = Color(hex);
    const hsl = color.hsl().array();
    return `${Math.round(hsl[0])} ${Math.round(hsl[1])}% ${Math.round(hsl[2])}%`;
  } catch {
    // Fallback to default purple if invalid
    return '291 47% 51%';
  }
}

/**
 * Lighten a hex color by a percentage
 */
function lighten(hex: string, amount: number): string {
  try {
    return Color(hex).lighten(amount).hex();
  } catch {
    return hex;
  }
}

/**
 * Darken a hex color by a percentage
 */
function darken(hex: string, amount: number): string {
  try {
    return Color(hex).darken(amount).hex();
  } catch {
    return hex;
  }
}

/**
 * Determine if a color is dark (for foreground contrast)
 */
function isDark(hex: string): boolean {
  try {
    return Color(hex).isDark();
  } catch {
    return true;
  }
}

/**
 * Get a contrasting foreground color
 */
function getForeground(hex: string): string {
  return isDark(hex) ? '0 0% 100%' : '0 0% 0%';
}

/**
 * Generate complementary semantic colors based on primary
 */
function generateSemanticColors(primary: string): {
  success: string;
  warning: string;
  info: string;
} {
  try {
    const baseColor = Color(primary);
    const hue = baseColor.hue();

    // Generate complementary colors that work well with the primary
    // Success: Green-ish (aim for ~120 hue)
    const successHue = (hue + 120) % 360;
    const success = Color.hsl(
      successHue > 90 && successHue < 150 ? successHue : 142,
      70,
      45
    );

    // Warning: Yellow/Orange (aim for ~38 hue)
    const warningHue = (hue + 180) % 360;
    const warning = Color.hsl(
      warningHue > 20 && warningHue < 60 ? warningHue : 38,
      92,
      50
    );

    // Info: Blue (aim for ~217 hue)
    const infoHue = (hue + 240) % 360;
    const info = Color.hsl(
      infoHue > 200 && infoHue < 240 ? infoHue : 217,
      91,
      60
    );

    return {
      success: success.hex(),
      warning: warning.hex(),
      info: info.hex(),
    };
  } catch {
    // Fallback to standard colors
    return {
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#3b82f6',
    };
  }
}

/**
 * Generate a full resolved theme from campaign config
 */
export function generateTheme(config: CampaignThemeConfig): ResolvedTheme {
  const preset = config.preset || 'default';
  const presetConfig = getThemePreset(preset);

  // Use config colors or fall back to preset
  const primary = config.primary || presetConfig.primary;
  const secondary = config.secondary || presetConfig.secondary;
  const accent = config.accent || presetConfig.accent || lighten(primary, 0.3);
  const gold = presetConfig.gold || '#f5a623';

  // Generate derived colors
  const primaryLight = lighten(primary, 0.2);
  const primaryDark = darken(primary, 0.2);
  const secondaryLight = lighten(secondary, 0.2);
  const secondaryDark = darken(secondary, 0.2);

  // Generate semantic colors
  const semanticColors = generateSemanticColors(primary);

  return {
    primary: hexToHSL(primary),
    primaryForeground: getForeground(primary),
    primaryLight: hexToHSL(primaryLight),
    primaryDark: hexToHSL(primaryDark),

    secondary: hexToHSL(secondary),
    secondaryForeground: getForeground(secondary),
    secondaryLight: hexToHSL(secondaryLight),
    secondaryDark: hexToHSL(secondaryDark),

    accent: hexToHSL(accent),
    accentForeground: getForeground(accent),

    success: hexToHSL(semanticColors.success),
    successForeground: getForeground(semanticColors.success),
    warning: hexToHSL(semanticColors.warning),
    warningForeground: getForeground(semanticColors.warning),
    info: hexToHSL(semanticColors.info),
    infoForeground: getForeground(semanticColors.info),

    gold: hexToHSL(gold),

    preset,
    backgroundPattern: config.backgroundPattern || presetConfig.backgroundPattern,
    fontAccent: presetConfig.fontAccent,
  };
}

/**
 * Convert resolved theme to CSS variables for DOM application
 */
export function themeToCSSVariables(theme: ResolvedTheme): ThemeCSSVariables {
  return {
    '--campaign-primary': theme.primary,
    '--campaign-primary-foreground': theme.primaryForeground,
    '--campaign-primary-light': theme.primaryLight,
    '--campaign-primary-dark': theme.primaryDark,

    '--campaign-secondary': theme.secondary,
    '--campaign-secondary-foreground': theme.secondaryForeground,
    '--campaign-secondary-light': theme.secondaryLight,
    '--campaign-secondary-dark': theme.secondaryDark,

    '--campaign-accent': theme.accent,
    '--campaign-accent-foreground': theme.accentForeground,

    '--campaign-success': theme.success,
    '--campaign-warning': theme.warning,
    '--campaign-info': theme.info,

    '--campaign-gold': theme.gold,
  };
}

/**
 * Apply theme CSS variables to the document root
 */
export function applyThemeToDOM(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  const variables = themeToCSSVariables(theme);
  const root = document.documentElement;

  // Set campaign theme attribute to activate CSS overrides
  root.setAttribute('data-campaign-theme', 'true');

  // Apply all CSS variables
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Apply background pattern if set
  if (theme.backgroundPattern && theme.backgroundPattern !== 'none') {
    root.setAttribute('data-bg-pattern', theme.backgroundPattern);
  } else {
    root.removeAttribute('data-bg-pattern');
  }
}

/**
 * Remove campaign theme from DOM (reset to defaults)
 */
export function removeThemeFromDOM(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.removeAttribute('data-campaign-theme');
  root.removeAttribute('data-bg-pattern');

  // Remove campaign-specific CSS variables
  const campaignVars = [
    '--campaign-primary',
    '--campaign-primary-foreground',
    '--campaign-primary-light',
    '--campaign-primary-dark',
    '--campaign-secondary',
    '--campaign-secondary-foreground',
    '--campaign-secondary-light',
    '--campaign-secondary-dark',
    '--campaign-accent',
    '--campaign-accent-foreground',
    '--campaign-success',
    '--campaign-warning',
    '--campaign-info',
    '--campaign-gold',
  ];

  campaignVars.forEach((varName) => {
    root.style.removeProperty(varName);
  });
}

/**
 * Generate theme from hex colors (simplified API)
 */
export function generateThemeFromColors(
  primary: string,
  secondary: string,
  options?: {
    accent?: string;
    preset?: ThemePreset;
    backgroundPattern?: BackgroundPattern;
  }
): ResolvedTheme {
  return generateTheme({
    primary,
    secondary,
    accent: options?.accent,
    preset: options?.preset,
    backgroundPattern: options?.backgroundPattern,
  });
}
