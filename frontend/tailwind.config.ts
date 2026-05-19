import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FFDEE9',
          rose: '#f9c6d7',
          cream: '#fff8f4',
          deep: '#c9748f',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 80px rgba(201, 116, 143, 0.12)',
      },
    },
  },
} satisfies Config