'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, User, X, LogOut, KeyRound, Check, UserPlus, LogIn, Edit3 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useToast } from '@/lib/toast'

type Props = {
  open: boolean
  onClose: () => void
  initialTab?: 'user' | 'admin'
}

export default function RoleModal({ open, onClose, initialTab = 'user' }: Props) {
  const router = useRouter()
  const {
    role, cloudEnabled, userProfile,
    loginCustomerAccount, registerCustomerAccount, updateCustomerProfile,
    loginAdmin, logout,
  } = useStore()
  const showToast = useToast((s) => s.show)

  const [tab, setTab] = useState<'user' | 'admin'>(initialTab)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [editingProfile, setEditingProfile] = useState(false)

  // Login state
  const [identifier, setIdentifier] = useState('')
  const [loginPin, setLoginPin] = useState('')

  // Register & Edit state
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [regPin, setRegPin] = useState('')

  const [userErr, setUserErr] = useState('')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(false)

  const isUserLoggedIn = role === 'user' && Boolean(userProfile.customerId || userProfile.phone)

  useEffect(() => {
    if (open) {
      setTab(role === 'admin' ? 'admin' : initialTab)
      setEditingProfile(false)
      setIdentifier('')
      setLoginPin('')
      setUsername('')
      setName(userProfile.name || '')
      setPhone(userProfile.phone || '')
      setAddress(userProfile.address || '')
      setRegPin('')
      setUserErr('')
      setPin('')
      setPinError('')
    }
  }, [open, initialTab, role, userProfile])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserErr('')
    setLoading(true)
    const res = await loginCustomerAccount({ identifier, pin: loginPin })
    setLoading(false)
    if (!res.ok) return setUserErr(res.error || 'Gagal masuk.')
    showToast('Berhasil masuk ke akun!')
    onClose()
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserErr('')
    setLoading(true)
    const res = await registerCustomerAccount({ username, name, phone, address, pin: regPin })
    setLoading(false)
    if (!res.ok) return setUserErr(res.error || 'Gagal mendaftar.')
    showToast('Akun berhasil dibuat & langsung masuk!')
    onClose()
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserErr('')
    setLoading(true)
    const res = await updateCustomerProfile({ name, address })
    setLoading(false)
    if (!res.ok) return setUserErr(res.error || 'Gagal menyimpan profil.')
    showToast('Profil diperbarui!')
    setEditingProfile(false)
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
                isUserLoggedIn ? (
                  editingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-3">
                      <p className="font-display text-base font-extrabold">Edit Profil</p>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-mute">Nama lengkap</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-mute">Alamat rumah</label>
                        <input className="input" placeholder="Jl. Melati No. 12, RT 02" value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                      {userErr && <p className="text-xs font-bold text-sale">{userErr}</p>}
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => setEditingProfile(false)} className="btn btn-line flex-1">
                          Batal
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-brand flex-1">
                          <Check className="h-4 w-4" /> {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg/60 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-base font-extrabold">{userProfile.name || 'Pelanggan'}</p>
                          {userProfile.username && (
                            <p className="text-xs font-bold text-brand">@{userProfile.username}</p>
                          )}
                          <p className="text-xs text-mute">{userProfile.phone}</p>
                          {userProfile.address && <p className="mt-0.5 truncate text-xs text-mute">{userProfile.address}</p>}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => setEditingProfile(true)} className="btn btn-line w-full text-sm">
                          <Edit3 className="h-4 w-4 text-brand" /> Edit Nama / Alamat
                        </button>
                        <button type="button" onClick={handleLogout} className="btn btn-line w-full text-sm text-sale">
                          <LogOut className="h-4 w-4" /> Keluar Akun
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-bg p-1">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setUserErr('') }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
                          authMode === 'login' ? 'bg-card text-brand shadow-sm' : 'text-mute hover:text-ink'
                        }`}
                      >
                        <LogIn className="h-3.5 w-3.5" /> Masuk
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setUserErr('') }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold transition-all ${
                          authMode === 'register' ? 'bg-card text-brand shadow-sm' : 'text-mute hover:text-ink'
                        }`}
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Daftar Baru
                      </button>
                    </div>

                    {authMode === 'login' ? (
                      <form onSubmit={handleLogin} className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-mute">ID / Username atau No. HP</label>
                          <input
                            className="input"
                            placeholder="Misal: budi01 atau 0857..."
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-mute">PIN Akun</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            className="input"
                            placeholder="••••"
                            value={loginPin}
                            onChange={(e) => setLoginPin(e.target.value)}
                            required
                          />
                        </div>
                        {userErr && <p className="text-xs font-bold text-sale">{userErr}</p>}
                        <button type="submit" disabled={loading} className="btn btn-brand w-full">
                          <LogIn className="h-4 w-4" /> {loading ? 'Memeriksa...' : 'Masuk'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleRegister} className="space-y-2.5">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-mute">ID / Username (unik, tanpa spasi)</label>
                          <input
                            className="input lowercase"
                            placeholder="Misal: budi01"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))}
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-mute">Nama lengkap</label>
                          <input className="input" placeholder="Misal: Budi Santoso" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-mute">No. HP / WhatsApp</label>
                          <input className="input" placeholder="08xxxxxxxxxx" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-mute">Alamat rumah (opsional)</label>
                          <input className="input" placeholder="Jl. Melati No. 12, RT 02" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-mute">Buat PIN Akun (min. 4 digit)</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            className="input"
                            placeholder="••••"
                            value={regPin}
                            onChange={(e) => setRegPin(e.target.value)}
                            required
                          />
                        </div>
                        {userErr && <p className="text-xs font-bold text-sale">{userErr}</p>}
                        <button type="submit" disabled={loading} className="btn btn-brand mt-1 w-full">
                          <UserPlus className="h-4 w-4" /> {loading ? 'Mendaftarkan...' : 'Daftar & Masuk'}
                        </button>
                      </form>
                    )}
                  </div>
                )
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
