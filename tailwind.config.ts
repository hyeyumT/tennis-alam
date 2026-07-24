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
        chalkboard: {
          dark: "#123024",
          DEFAULT: "#1b4332",
          light: "#2d5e48",
          border: "#8b5cf6",
        },
        chalk: {
          white: "#f8fafc",
          yellow: "#fef08a",
          pink: "#fbcfe8",
          green: "#bbf7d0",
          blue: "#bae6fd",
        },
        wood: {
          DEFAULT: "#854d0e",
          light: "#a16207",
          dark: "#713f12",
        }
      },
      fontFamily: {
        dodum: ["var(--font-gowun-dodum)", "sans-serif"],
        pen: ["var(--font-nanum-pen)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
