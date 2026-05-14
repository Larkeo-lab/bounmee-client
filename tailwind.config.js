import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lao: ["Nuanta", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#0ea5e9",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: "#028dfd",
            info: "#425fae",
            secondary: "#8b3d8f",
            success: "#6dc1c9",
            warning: "#ec612c",
            danger: "#e20f1a",
            purple: "#8b3d8f",
            teal: "#6dc1c9",
            background: "#ffffff",
            foreground: "#111827",
            "primary-foreground": "#ffffff",
            "secondary-foreground": "#ffffff",
            "success-foreground": "#ffffff",
            "warning-foreground": "#ffffff",
            "danger-foreground": "#ffffff",
            "info-foreground": "#ffffff",
          },
        },
        dark: {
          colors: {
            primary: "#028dfd",
            secondary: "#c084fc",
            success: "#24924c",
            warning: "#f59e0b",
            danger: "#ef4444",
            background: "#0B1220",
            foreground: "#E5E7EB",
            "primary-foreground": "#ffffff",
            "secondary-foreground": "#ffffff",
            "success-foreground": "#ffffff",
            "warning-foreground": "#ffffff",
            "danger-foreground": "#ffffff",
          },
        },
      },
    }),
  ],
}
