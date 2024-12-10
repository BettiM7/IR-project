/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royalRed: "#990000",
        royalRed10: "#c26666",
        royalRed20: "#ad3333",
        outlineGray: "#aaa",
        secondaryGray: "#888",
      },
    },
  },
  plugins: [],
};
