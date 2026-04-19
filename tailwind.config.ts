import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: {
          DEFAULT: "#111111",
          elevated: "#1A1A1A",
          border: "#1F1F1F",
        },
        accent: {
          cyan: "#00D4FF",
          green: "#7FFF00",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0A0",
          tertiary: "#666666",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "IBM Plex Mono", "monospace"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
