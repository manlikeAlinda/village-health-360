import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",        // Note: adjusted for your folder structure
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Note: adjusted for your folder structure
  ],
  theme: {
    extend: {
      colors: {
        // Official Palette from Proposal 
        brand: {
          blue: "#004AAD",    // Primary Actions / Health
          wash: "#F97316",    // Orange for WASH
          agri: "#22C55E",    // Green for Agriculture
          live: "#A855F7",    // Purple for Livelihoods
          alert: "#EF4444",   // Red for Outbreaks
          bg: "#F7F8F9",      // Soft Grey Background
        },
      },
    },
  },
  plugins: [],
};
export default config;