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
        brand: {
          DEFAULT: "#0a1a3a",
          50: "#e8edf5",
          100: "#c5d0e5",
          200: "#9eafd2",
          300: "#778ebf",
          400: "#5975b1",
          500: "#3b5ca3",
          600: "#2d4a87",
          700: "#1f386b",
          800: "#142750",
          900: "#0a1a3a",
          950: "#050d1d",
        },
        borderColor: "#d9d9d9",
        // Backward compatibility alias
        primary: "#0a1a3a",
      },
      fontFamily: {
        sans: ["var(--font-primary)", "Ubuntu", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        script: ["var(--font-script)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
