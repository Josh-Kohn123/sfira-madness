import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: "#1a1040",
          deep: "#0d0820",
          card: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.1)",
          muted: "#9b8ec4",
        },
        gold: {
          DEFAULT: "#f6d365",
          warm: "#fda085",
        },
        counting: "#6ee7a0",
        stopped: "#fbbf24",
      },
      fontFamily: {
        sans: ["var(--font-rubik)", "system-ui", "sans-serif"],
        display: ["var(--font-secular-one)", "sans-serif"],
      },
      backgroundImage: {
        "cosmos-gradient":
          "linear-gradient(135deg, #1a1040 0%, #2d1b69 30%, #1a1040 60%, #0f2027 100%)",
        "gold-gradient": "linear-gradient(135deg, #f6d365, #fda085)",
      },
    },
  },
  plugins: [],
};
export default config;
