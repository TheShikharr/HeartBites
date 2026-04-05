/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dancingscript: ["Dancing Script", "cursive"],
        lobster: ["Lobster Two"],
      }
    },
  },
  plugins: [],
}