// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css}",
  ],
  safelist: [
    { pattern: /from-\[#.*\]|via-\[#.*\]|to-\[#.*\]/ },
    { pattern: /bg-gradient-to-(t|b|l|r|tl|tr|bl|br)/ },
    { pattern: /bg-\[#.*\]/ },
    { pattern: /text-\[#.*\]/ },
    { pattern: /border-\[#.*\]/ },
    { pattern: /shadow-\[#.*\]/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
