'use client'
export default function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle('dark')
    try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch {}
  }
  return (
    <button onClick={toggle} aria-label="Ganti tema terang/gelap" className="btn btn-line !px-3 !py-1.5 text-sm">
      Tema
    </button>
  )
}
