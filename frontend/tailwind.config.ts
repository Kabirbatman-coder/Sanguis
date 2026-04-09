import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f3ef",
        ink: "#1f262b",
        mist: "#eef3f6",
        line: "#e7dcd1",
        rose: "#f06b78",
        coral: "#fa8072",
        wine: "#8b2332",
        mint: "#d8efe8",
        lagoon: "#2b6f77",
        gold: "#f5ca7a",
      },
      fontFamily: {
        display: ['"Georgia"', '"Times New Roman"', "serif"],
        body: ['"Segoe UI"', '"Helvetica Neue"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 50px rgba(112, 77, 61, 0.10)",
        panel: "0 24px 60px rgba(118, 82, 63, 0.12)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(250, 128, 114, 0.32), transparent 34%), radial-gradient(circle at 85% 18%, rgba(240, 107, 120, 0.18), transparent 22%), linear-gradient(180deg, #fffaf7 0%, #f7f1eb 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
