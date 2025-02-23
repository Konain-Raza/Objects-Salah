/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        gilroy: ['Gilroy-Regular', 'sans-serif'],
        gilroyBold: ['Gilroy-Bold', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
