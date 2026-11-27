'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, User, X, LogOut, KeyRound, Check } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useToast } from '@/lib/toast'

type Props = {
  open: boolean
  onClose: () => void
  initialTab?: 'user' | 'admin'
}

export default function RoleModal({ open, onClose, initialTab = 'user' }: Props) {
  const router = useRouter()
  const { role, cloudEnabled, userProfile, loginCustomer, loginAdmin, logout } = useStore()
  const showToast = useToast((s) => s.show)

  const [tab, setTab] = useState<'user' | 'admin'>(initialTab)
  const [name, setName] = useState(userProfile.name)
  const [phone, setPhone] = useState(userProfile.phone)
  const [address, setAddress] = useState(userProfile.address)
  const [userPin, setUserPin] = useState('')
  const [userErr, setUserErr] = useState('')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setTab(role === 'admin' ? 'admin' : initialTab)
      setName(userProfile.name)
      setPhone(userProfile.phone)
      setAddress(userProfile.address)
      setUserPin('')
      setUserErr('')
      setPin('')
      setPinError('')
    }
  }, [open, initialTab, role, userProfile])

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserErr('')
    setLoading(true)
    const res = await loginCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pin: userPin.trim() || '1234',
    })
    setLoading(false)
    if (!res.ok) {
      setUserErr(res.error || 'Gagal menyimpan akun.')
      return
    }
    showToast('Akun pelanggan aktif & tersinkron!')
    onClose()
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await loginAdmin(pin)
    setLoading(false)
    if (res.ok) {
      showToast('Berhasil masuk sebagai Admin Warung')
      onClose()
      router.push('/admin')
    } else {
      setPinError(res.error || 'PIN salah.')
    }
  }

  const handleLogout = async () => {
    await logout()
    showToast('Berhasil keluar dari sesi', 'info')
    onClose()
    router.push('/')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-extrabold">Akun & Mode Akses</h2>
                <p className="text-xs text-mute">
                  {cloudEnabled ? 'Terhubung ke Database Cloud (Multi-HP)' : 'Mode Lokal (Browser ini)'}
                </p>
              </div>
              <button onClick={onClose} className="rounded-full p-1.5 text-mute hover:bg-line/50 hover:text-ink" aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b border-line bg-bg/50 p-2">
              <button
                type="button"
                onClick={() => setTab('user')}
                className={`flex items-center justify-center gap-2 rounded-2xl py-2 text-sm font-bold transition-all ${
                  tab === 'user' ? 'bg-card text-brand shadow-sm' : 'text-mute hover:text-ink'
                }`}
              >
                <User className="h-4 w-4" /> Pelanggan
              </button>
              <button
                type="button"
                onClick={() => setTab('admin')}
                className={`flex items-center justify-center gap-2 rounded-2xl py-2 text-sm font-bold transition-all ${
                  tab === 'admin' ? 'bg-card text-brand shadow-sm' : 'text-mute hover:text-ink'
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Admin Warung
              </button>
            </div>

            <div className="p-5">
              {tab === 'user' ? (
                <form onSubmit={saveUser} className="space-y-3">
                  <p className="text-xs text-mute">
                    {cloudEnabled
                      ? 'Masuk atau daftar dengan No. HP & PIN supaya profil dan riwayat pesananmu tersinkron di semua HP.'
                      : 'Simpan data diri biar pas checkout di keranjang nggak perlu ketik ulang.'}
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-mute">Nama lengkap</label>
                    <input className="input" placeholder="Misal: Budi Santoso" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-mute">No. HP / WhatsApp</label>
                    <input className="input" placeholder="08xxxxxxxxxx" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-mute">Alamat rumah (opsional)</label>
                    <input className="input" placeholder="Jl. Melati No. 12, RT 02" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  {cloudEnabled && (
                    <div>
                      <label className="mb-1 block text-xs font-bold text-mute">PIN Akun (min. 4 digit)</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        className="input"
                        placeholder="Buat atau masukkan PIN akunmu"
                        value={userPin}
                        onChange={(e) => setUserPin(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  {userErr && <p className="text-xs font-bold text-sale">{userErr}</p>}
                  <button type="submit" disabled={loading} className="btn btn-brand mt-2 w-full">
                    <Check className="h-4 w-4" /> {loading ? 'Menyimpan...' : 'Masuk / Simpan Profil'}
                  </button>
                  {userProfile.phone && (
                    <button type="button" onClick={handleLogout} className="btn btn-line w-full text-xs text-sale">
                      <LogOut className="h-3.5 w-3.5" /> Keluar Akun Pelanggan
                    </button>
                  )}
                </form>
              ) : role === 'admin' ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold">Mode Admin Aktif</p>
                    <p className="text-sm text-mute">Kamu sedang login sebagai pengelola Warung Gery.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        router.push('/admin')
                      }}
                      className="btn btn-brand w-full"
                    >
                      Buka Dashboard Admin
                    </button>
                    <button type="button" onClick={handleLogout} className="btn btn-line w-full text-sale">
                      <LogOut className="h-4 w-4" /> Keluar ke Mode Pelanggan
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div className="rounded-2xl border border-line bg-bg/60 p-3 text-xs text-mute">
                    Masuk sebagai Admin untuk kelola produk, stok, status pesanan, kode promo, dan jam buka warung.
                    <span className="mt-1 block font-bold text-ink">PIN Demo: 1234</span>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-mute">Masukkan PIN Admin</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                      <input
                        type="password"
                        inputMode="numeric"
                        className="input !pl-9"
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value)
                          setPinError('')
                        }}
                        autoFocus
                      />
                    </div>
                    {pinError && <p className="mt-1 text-xs font-bold text-sale">{pinError}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-brand w-full">
                    <ShieldCheck className="h-4 w-4" /> {loading ? 'Memeriksa...' : 'Masuk sebagai Admin'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
