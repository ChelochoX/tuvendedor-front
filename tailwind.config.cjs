// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFCC00", // Amarillo principal
        secondary: "#000000", // Negro, fondo del panel izquierdo
        accentYellowLight: "#FFF4CC", // Amarillo claro para el panel derecho
      },
    },
  },
  plugins: [],
};
