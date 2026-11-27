'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useHydrated } from '@/lib/cart'

export default function DataSync() {
  const hydrated = useHydrated()
  const syncBootstrap = useStore((s) => s.syncBootstrap)

  useEffect(() => {
    if (!hydrated) return
    syncBootstrap()

    const onFocus = () => syncBootstrap()
    window.addEventListener('focus', onFocus)
    const timer = setInterval(syncBootstrap, 15000)

    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(timer)
    }
  }, [hydrated, syncBootstrap])

  return null
}
