import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v4 configuration
 * Most configuration is now done via @theme in globals.css
 * This file only contains content paths and plugins
 */
const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],

  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
