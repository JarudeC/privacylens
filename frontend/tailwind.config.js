/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'primary': '#FE2C55',
        'secondary': '#00E5FF',
        'privacy': {
          'low': '#FFC107',
          'medium': '#FF9800',
          'high': '#F44336',
          'safe': '#4CAF50'
        },
        'gray': {
          '800': '#161823',
          '600': '#8A8A8A',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      minHeight: {
        '11': '2.75rem',
      }
    }
  },
  plugins: [],
}