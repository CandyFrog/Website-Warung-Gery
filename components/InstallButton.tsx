'use client'
import { useEffect, useState } from 'react'

export default function InstallButton() {
  const [evt, setEvt] = useState<any>(null)
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])
  if (!evt) return <p className="text-sm text-mute">Tombol install muncul di Chrome HP atau desktop kalau web ini bisa dipasang.</p>
  return <button className="btn btn-brand" onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null) }}>Install aplikasi Warung Gery</button>
}
