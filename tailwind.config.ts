import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lelampahan: {
          cream: '#FFF7ED',
          gold: '#D97706',
          brick: '#B45309',
          earth: '#431407',
        },
      },
    },
  },
  plugins: [],
};

export default config;
