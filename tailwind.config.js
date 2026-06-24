/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#132238',
        lab: {
          50: '#f4fbfa',
          100: '#dff4f1',
          200: '#bfe9e3',
          500: '#208b83',
          600: '#176f69',
          700: '#135954',
        },
        signal: '#315cfd',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(19, 34, 56, 0.08)',
      },
    },
  },
  plugins: [],
};
