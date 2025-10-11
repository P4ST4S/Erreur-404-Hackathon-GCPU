import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v4 configuration
 * Most configuration is now done via @theme in globals.css
 * This file only contains content paths and plugins
 */
const config: Config = {
  // Scan all component and page files for class names
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],

  // Include tailwindcss-animate plugin for additional animations
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
