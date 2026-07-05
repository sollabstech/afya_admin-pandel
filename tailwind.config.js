/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F7D000',
        'primary-dark': '#E6C000',
        secondary: '#1976D2',
        'secondary-dark': '#1565C0',
        dark: '#1C1C1C',
        sidebar: '#111827',
        'sidebar-hover': '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
