import { nextui } from "@nextui-org/theme";
import scrollbar from "tailwind-scrollbar";
import { type Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        fredoka: ["Fredoka", "sans-serif"],
        abeezee: ["Poppins", "sans-serif"],
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--nextui-default))",
        input: "hsl(var(--nextui-default))",
        ring: "hsl(var(--nextui-focus))",
        destructive: {
          DEFAULT: "hsl(var(--nextui-danger))",
          foreground: "hsl(var(--nextui-danger-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--nextui-content1))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--nextui-secondary))",
          foreground: "hsl(var(--nextui-secondary-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--nextui-content1))",
          foreground: "hsl(var(--nextui-content1-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--nextui-content1))",
          foreground: "hsl(var(--nextui-content1-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--nextui-radius-large)",
        md: "var(--nextui-radius-medium)",
        sm: "var(--nextui-radius-small)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    scrollbar({ nocompatible: true }),
    nextui(),
  ],
} satisfies Config;
