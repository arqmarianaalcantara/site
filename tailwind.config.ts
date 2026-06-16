import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2.5rem",
        xl: "3rem",
      },
      screens: {
        xs: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    extend: {
      screens: {
        xs: "400px",
      },
      colors: {
        bone: "#F7F4EE",
        stone: {
          50: "#F7F4EE",
          100: "#EFEAE2",
          200: "#DED5C8",
          300: "#CDC0AA",
          400: "#B0A088",
          500: "#8A7A5E",
        },
        clay: "#C9B89F",
        walnut: "#594A3D",
        ink: "#1A1714",
        sage: "#A6AE9A",
        accent: "#7A6B57",
        wine: {
          DEFAULT: "#A8232E",
          deep: "#7A1820",
          soft: "#C03241",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "fluid-hero": "clamp(2.75rem, 7vw, 6rem)",
        "fluid-h1": "clamp(2.25rem, 5vw, 4rem)",
        "fluid-h2": "clamp(1.75rem, 3.5vw, 2.75rem)",
        "fluid-h3": "clamp(1.25rem, 2vw, 1.625rem)",
      },
      letterSpacing: {
        "ultra-tight": "-0.04em",
        "ultra-wide": "0.32em",
      },
      maxWidth: {
        "8xl": "88rem",
        prose: "62ch",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        marquee: "marquee 22s linear infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
