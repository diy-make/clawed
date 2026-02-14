/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'spin-slow-reverse': 'spin-reverse 60s linear infinite',
        'morph': 'morph 10s ease-in-out infinite',
        'float': 'float 12s ease-in-out infinite',
        'float-delayed': 'float-delayed 15s ease-in-out infinite',
      },
      keyframes: {
        'spin-reverse': {
          'from': { transform: 'rotate(360deg)' },
          'to': { transform: 'rotate(0deg)' },
        },
        'morph': {
          '0%, 100%': { borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%' },
          '25%': { borderRadius: '60% 40% 40% 60% / 60% 40% 60% 40%' },
          '50%': { borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' },
          '75%': { borderRadius: '40% 60% 40% 60% / 40% 60% 40% 60%' },
        },
        'float': {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(-12deg)' },
          '50%': { transform: 'translate(-10px, -20px) rotate(-15deg)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(45deg)' },
          '50%': { transform: 'translate(10px, 20px) rotate(40deg)' },
        }
      }
    },
  },
  plugins: [],
}
