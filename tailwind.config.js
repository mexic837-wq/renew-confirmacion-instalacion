/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'water-blue': '#13E0E8', // Updated to match logo Cyan
        'renew-cyan': '#13E0E8',
        'renew-green': '#00FFC2',
        'renew-yellow': '#FFD600',
        'light-gray': '#F3F4F6',
        'ios-white': '#FFFFFF',
        'ios-bg': '#F2F2F7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
