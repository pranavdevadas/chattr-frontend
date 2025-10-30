/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primarylight: '#7B3FD3',
        primarydark: '#5A0FC8',
        red: {
          300: '#FCA5A5',
          500: '#EF4444',
        },
        green: {
          500: '#10B981',
        },
      },
      fontFamily: {
        sora: ['Sora-Regular'],
        soraBold: ['Sora-SemiBold'],
      },
    },
  },
  plugins: [],
};
