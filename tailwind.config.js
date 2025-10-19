// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  safelist: [
    // Gradients and arbitrary color utilities
    { pattern: /^bg-gradient-to-/ },
    { pattern: /^from-\[#([A-Fa-f0-9]{3,6})\]/ },
    { pattern: /^via-\[#([A-Fa-f0-9]{3,6})\]/ },
    { pattern: /^to-\[#([A-Fa-f0-9]{3,6})\]/ },
    { pattern: /^bg-\[#([A-Fa-f0-9]{3,6})\]/ },
    { pattern: /^text-\[#([A-Fa-f0-9]{3,6})\]/ },
    { pattern: /^border-\[#([A-Fa-f0-9]{3,6})\]/ },
  ],

  theme: {
    extend: {
      colors: {
        brandBlue: "#1e3a8a",
        brandGold: "#f0d48a",
      },
      screens: {
        'sm': '480px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        '2xl': '1400px',
        '3xl': '1600px',
        '4xl': '1800px',  
      },
      backgroundImage: {
        'hero-pattern': "url('/imfc-am2025.jpg')",
      },
    },
  },

  plugins: [],
};
