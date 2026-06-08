import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Scube brand
        scube: {
          cyan:    '#00BFFF',
          blue:    '#0066CC',
          dark:    '#0A0E1A',
          surface: '#0D1426',
          card:    '#111827',
          border:  '#1E3A5F',
          muted:   '#64748B',
          text:    '#E2E8F0',
        },
        // Cyberpunk accents
        neon: {
          cyan:   '#00FFFF',
          green:  '#00FF88',
          orange: '#FF6600',
          pink:   '#FF0080',
          yellow: '#FFD700',
        },
        // Legacy support
        fifa: {
          blue:  '#003F7D',
          gold:  '#C8A84B',
          red:   '#D22B2B',
          green: '#006B3F',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon-cyan':   '0 0 10px rgba(0,191,255,0.5), 0 0 20px rgba(0,191,255,0.2)',
        'neon-green':  '0 0 10px rgba(0,255,136,0.5), 0 0 20px rgba(0,255,136,0.2)',
        'neon-orange': '0 0 10px rgba(255,102,0,0.5), 0 0 20px rgba(255,102,0,0.2)',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,191,255,0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(0,191,255,0.03) 1px, transparent 1px)`,
        'cyber-gradient': 'linear-gradient(135deg, #0A0E1A 0%, #0D1426 50%, #0A0E1A 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,191,255,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0,191,255,0.8), 0 0 40px rgba(0,191,255,0.3)' },
        },
        'scan': {
          '0%': { backgroundPosition: '0 -100vh' },
          '100%': { backgroundPosition: '0 100vh' },
        },
      },
    },
  },
  plugins: [],
}
export default config
