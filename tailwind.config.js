/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#172554', 900: '#0f1b3d', 800: '#172554', 700: '#1e3a8a', 100: '#dbe5fb', 50: '#eef3fd' },
        sky: { DEFAULT: '#3B82F6', 600: '#2563eb', 700: '#1d4ed8', 100: '#dbeafe', 50: '#eff6ff' },
        canvas: '#F8FAFC',
        sun: { DEFAULT: '#FACC15', 600: '#ca8a04', 100: '#fef9c3' },
        ink: { DEFAULT: '#1E293B', 600: '#475569', 500: '#64748b' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,37,84,.04), 0 8px 24px -8px rgba(23,37,84,.12)',
        lift: '0 2px 4px rgba(23,37,84,.06), 0 20px 40px -12px rgba(23,37,84,.22)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
