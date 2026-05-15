import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ["Heebo", "sans-serif"],
      },
      colors: {
        brand: {
          bg: "#2e1e45",
          dark: "#412a62",
          card: "#54367e",
          accent: "#7a59a5",
          "accent-2": "#67439a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
