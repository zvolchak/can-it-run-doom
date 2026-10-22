import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-text)",
        surface: "var(--color-surface)",
        raised: "var(--color-surface-raised)",
        muted: "var(--color-muted)",
        line: "var(--color-border)",
        control: "var(--color-control-border)",
        accent: "var(--color-accent)",
        danger: "var(--color-danger)",
        backdrop: "var(--color-backdrop)",
      },
    },
  },
  plugins: [],
} satisfies Config;
