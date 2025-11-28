import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      // Fantasy Typography
      fontFamily: {
        display: ['var(--font-cinzel)', 'Cinzel', 'serif'],
        heading: ['var(--font-cinzel-decorative)', 'Cinzel Decorative', 'serif'],
        body: ['var(--font-crimson)', 'Crimson Text', 'serif'],
        ui: ['var(--font-alegreya-sans)', 'Alegreya Sans', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'Fira Code', 'monospace'],
      },

      // Color System (CSS Variable based for dynamic theming)
      colors: {
        // Legacy purple colors (for backward compatibility)
        purple: {
          primary: '#ab47bc',
          dark: '#7b1fa2'
        },

        // shadcn/ui semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light: 'hsl(var(--primary-light))',
          dark: 'hsl(var(--primary-dark))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          light: 'hsl(var(--secondary-light))',
          dark: 'hsl(var(--secondary-dark))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },

        // Semantic status colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))'
        },

        // Surface colors
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          card: 'hsl(var(--surface-card))',
          elevated: 'hsl(var(--surface-elevated))',
        },

        // Fantasy-specific colors
        gold: 'hsl(var(--gold))',
        parchment: 'hsl(var(--parchment))',
        leather: 'hsl(var(--leather))',
        ink: 'hsl(var(--ink))',

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },

      // Background Images & Gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'purple-gradient': 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
        'primary-gradient': 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark)) 100%)',
        'gold-gradient': 'linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold) / 0.7) 100%)',
        'parchment-texture': 'var(--texture-parchment)',
        'leather-texture': 'var(--texture-leather)',
        'stone-texture': 'var(--texture-stone)',
      },

      // Fantasy Shadows
      boxShadow: {
        'fantasy-sm': '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'fantasy': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'fantasy-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'fantasy-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px hsl(var(--primary) / 0.4)',
        'glow-lg': '0 0 40px hsl(var(--primary) / 0.5)',
        'gold-glow': '0 0 20px hsl(var(--gold) / 0.4)',
        'inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },

      // Border Radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },

      // Fantasy Spacing
      spacing: {
        'scroll': '0.5rem',
        'tome': '1rem',
        'chapter': '1.5rem',
        'verse': '2rem',
      },

      // Typography Plugin Config
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary-light))',
              },
            },
            h1: {
              color: theme('colors.white'),
              fontFamily: 'var(--font-cinzel), Cinzel, serif',
            },
            h2: {
              color: theme('colors.white'),
              fontFamily: 'var(--font-cinzel), Cinzel, serif',
            },
            h3: {
              color: theme('colors.white'),
              fontFamily: 'var(--font-cinzel), Cinzel, serif',
            },
            h4: {
              color: theme('colors.white'),
            },
            code: {
              color: 'hsl(var(--primary))',
            },
            blockquote: {
              borderLeftColor: 'hsl(var(--primary))',
              color: theme('colors.gray.300'),
            },
            strong: {
              color: theme('colors.white'),
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
          },
        },
        // Fantasy variant for immersive content
        fantasy: {
          css: {
            '--tw-prose-body': theme('colors.gray.300'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': 'hsl(var(--primary))',
            fontFamily: 'var(--font-crimson), Crimson Text, serif',
            h1: {
              fontFamily: 'var(--font-cinzel-decorative), Cinzel Decorative, serif',
            },
            h2: {
              fontFamily: 'var(--font-cinzel), Cinzel, serif',
            },
          },
        },
      }),

      // Animations
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.4)' },
          '50%': { boxShadow: '0 0 30px hsl(var(--primary) / 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}

export default config
