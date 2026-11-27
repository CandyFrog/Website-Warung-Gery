import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', card: 'var(--card)', ink: 'var(--ink)', mute: 'var(--mute)', line: 'var(--line)',
        brand: 'var(--brand)', brandink: 'var(--brand-ink)', tag: 'var(--tag)', tagink: 'var(--tag-ink)', sale: 'var(--sale)',
      },
      fontFamily: { display: ['var(--font-display)', 'sans-serif'], sans: ['var(--font-body)', 'sans-serif'] },
    },
  },
  plugins: [],
}
export default config
