module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.{css}",
  ],
  safelist: [
    // arbitrary hex/bg/text classes you use dynamically
    { pattern: /^(bg|text|from|to)-\[#?[0-9a-fA-F]{3,6}\]$/ },
    { pattern: /^bg-gradient-to-(r|l|t|b)$/ },
  ],
  theme: { extend: {} },
  plugins: [],
}