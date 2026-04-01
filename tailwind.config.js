/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#090b0d',
        panel: '#101418',
        soft: '#171d22',
        line: '#23303b',
        text: '#eef4f7',
        muted: '#98aab5',
        accent: '#ff5a5f',
        accentSoft: '#ffb5b0',
        danger: '#ff7b7b',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 24px 80px rgba(95, 10, 20, 0.28)',
        lift: '0 20px 50px rgba(0, 0, 0, 0.28)',
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(255,90,95,0.16), transparent 28%), radial-gradient(circle at 80% 0%, rgba(255,181,176,0.12), transparent 25%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
      },
    },
  },
  plugins: [],
}
