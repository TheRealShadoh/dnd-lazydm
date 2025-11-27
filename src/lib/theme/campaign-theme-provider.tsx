'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  CampaignThemeConfig,
  ResolvedTheme,
} from './types';
import {
  generateTheme,
  applyThemeToDOM,
  removeThemeFromDOM,
} from './generate-theme';

interface CampaignThemeContextValue {
  /** Current resolved theme (null if using defaults) */
  theme: ResolvedTheme | null;
  /** Original config that generated the theme */
  config: CampaignThemeConfig | null;
  /** Apply a new campaign theme */
  setTheme: (config: CampaignThemeConfig) => void;
  /** Clear campaign theme and reset to defaults */
  clearTheme: () => void;
  /** Whether a campaign theme is currently active */
  isCustomTheme: boolean;
}

const CampaignThemeContext = createContext<CampaignThemeContextValue | null>(null);

interface CampaignThemeProviderProps {
  children: ReactNode;
  /** Initial theme config to apply on mount */
  initialTheme?: CampaignThemeConfig;
}

/**
 * Campaign Theme Provider
 *
 * Manages campaign-specific theming throughout the application.
 * Applies CSS variables to the document root for dynamic theming.
 *
 * Usage:
 * ```tsx
 * // In root layout
 * <CampaignThemeProvider>
 *   {children}
 * </CampaignThemeProvider>
 *
 * // In a campaign page
 * const { setTheme } = useCampaignTheme();
 * useEffect(() => {
 *   setTheme({ primary: '#ab47bc', secondary: '#7b1fa2' });
 * }, []);
 * ```
 */
export function CampaignThemeProvider({
  children,
  initialTheme,
}: CampaignThemeProviderProps) {
  const [config, setConfig] = useState<CampaignThemeConfig | null>(initialTheme || null);
  const [theme, setResolvedTheme] = useState<ResolvedTheme | null>(null);

  // Apply theme when config changes
  useEffect(() => {
    if (config) {
      const resolved = generateTheme(config);
      setResolvedTheme(resolved);
      applyThemeToDOM(resolved);
    } else {
      setResolvedTheme(null);
      removeThemeFromDOM();
    }
  }, [config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeThemeFromDOM();
    };
  }, []);

  const setTheme = useCallback((newConfig: CampaignThemeConfig) => {
    setConfig(newConfig);
  }, []);

  const clearTheme = useCallback(() => {
    setConfig(null);
  }, []);

  const value: CampaignThemeContextValue = {
    theme,
    config,
    setTheme,
    clearTheme,
    isCustomTheme: config !== null,
  };

  return (
    <CampaignThemeContext.Provider value={value}>
      {children}
    </CampaignThemeContext.Provider>
  );
}

/**
 * Hook to access campaign theme context
 */
export function useCampaignTheme(): CampaignThemeContextValue {
  const context = useContext(CampaignThemeContext);
  if (!context) {
    throw new Error('useCampaignTheme must be used within a CampaignThemeProvider');
  }
  return context;
}

/**
 * Hook to apply a campaign theme on mount
 * Automatically clears theme on unmount
 */
export function useApplyCampaignTheme(config: CampaignThemeConfig | null) {
  const { setTheme, clearTheme } = useCampaignTheme();

  useEffect(() => {
    if (config) {
      setTheme(config);
    }

    return () => {
      clearTheme();
    };
  }, [config, setTheme, clearTheme]);
}
