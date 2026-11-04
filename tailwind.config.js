/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kinexis: {
          navy: '#0F172A',
          blue: '#1E293B',
          gold: '#EAB308',
          card: '#182234'
        }
      }
    },
  },
  plugins: [],
}