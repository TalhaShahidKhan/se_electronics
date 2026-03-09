import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#3E4175",
        // "red": "#FF5858",
        // "red-2": "#ffe9e9",
        "borderColor": "#d9d9d9",
        'primary-blue': '#10b981', // Emerald Green for a clean, trustworthy feel
        'secondary-gray': '#f3f4f6',
        'accent-yellow': '#fbbf24',
      }
    },
  },
  plugins: [],
};
export default config;
