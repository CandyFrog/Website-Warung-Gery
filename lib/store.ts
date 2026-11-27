'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, products as initialProducts, PROMOS, SHOP } from './products'
import { useCart, Order } from './cart'

export type Role = 'user' | 'admin'

export type UserProfile = {
  customerId?: string
  username?: string
  name: string
  phone: string
  address: string
}

export type Promo = {
  code: string
  discount: number
  active: boolean
  label: string
}

export type ShopSettings = {
  name: string
  wa: string
  waLabel: string
  openHour: number
  closeHour: number
  freeShippingMin: number
  shippingFee: number
  announcement: string
  showBannerPromos: boolean
  maxBannerPromos: number
  manualStatus: 'auto' | 'open' | 'closed'
}

type StoreState = {
  cloudEnabled: boolean
  syncedOnce: boolean
  role: Role
  adminPin: string
  userProfile: UserProfile
  products: Product[]
  promos: Promo[]
  shop: ShopSettings
  syncBootstrap: () => Promise<void>
  loginAdmin: (pin: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  loginCustomerAccount: (data: { identifier: string; pin: string }) => Promise<{ ok: boolean; error?: string }>
  registerCustomerAccount: (data: { username: string; name: string; phone: string; address: string; pin: string }) => Promise<{ ok: boolean; error?: string }>
  updateCustomerProfile: (data: { name: string; address: string }) => Promise<{ ok: boolean; error?: string }>
  setAdminPin: (pin: string) => Promise<void>
  setUserProfile: (profile: Partial<UserProfile>) => void
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (id: number, patch: Partial<Product>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  upsertPromo: (promo: Promo) => Promise<void>
  togglePromo: (code: string) => Promise<void>
  deletePromo: (code: string) => Promise<void>
  updateShop: (patch: Partial<ShopSettings>) => Promise<void>
  resetProducts: () => void
}

const seededProducts: Product[] = initialProducts.map((p) => ({
  ...p,
  stock: 25,
  available: true,
}))

const seededPromos: Promo[] = Object.entries(PROMOS).map(([code, discount]) => ({
  code,
  discount,
  active: true,
  label: `Diskon ${Math.round(discount * 100)}% semua belanja`,
}))

const seededShop: ShopSettings = {
  ...SHOP,
  announcement: 'Gratis ongkir belanja mulai Rp100.000! Pakai kode GERY10 untuk diskon 10%.',
  showBannerPromos: true,
  maxBannerPromos: 2,
  manualStatus: 'auto',
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cloudEnabled: false,
      syncedOnce: false,
      role: 'user',
      adminPin: '1234',
      userProfile: { name: '', phone: '', address: '' },
      products: seededProducts,
      promos: seededPromos,
      shop: seededShop,

      syncBootstrap: async () => {
        try {
          const guestIds = useCart.getState().orders.map((o) => o.id).join(',')
          const url = guestIds ? `/api/bootstrap?ids=${encodeURIComponent(guestIds)}` : '/api/bootstrap'
          const res = await fetch(url, { cache: 'no-store' })
          if (!res.ok) return
          const data = await res.json()

          if (!data.configured) {
            set({ cloudEnabled: false, syncedOnce: true })
            return
          }

          const nextState: Partial<StoreState> = {
            cloudEnabled: true,
            syncedOnce: true,
          }
          if (data.session?.role) {
            nextState.role = data.session.role
          } else {
            nextState.role = 'user'
          }
          if (data.session?.customerId || data.session?.phone) {
            nextState.userProfile = {
              customerId: data.session.customerId,
              username: data.session.username || '',
              name: data.session.name || '',
              phone: data.session.phone || '',
              address: data.session.address || '',
            }
          } else if (data.session?.role === 'admin') {
            nextState.userProfile = {
              username: 'administrator',
              name: 'Administrator',
              phone: data.shop?.wa || '088905601902',
              address: data.shop?.name || 'Warung Gery',
            }
          }
          if (Array.isArray(data.products) && data.products.length > 0) {
            nextState.products = data.products
          }
          if (Array.isArray(data.promos)) {
            nextState.promos = data.promos.map((pr: Promo) => ({ ...pr, discount: Number(pr.discount) }))
          }
          if (data.shop) {
            nextState.shop = data.shop
          }
          set(nextState)

          if (Array.isArray(data.orders)) {
            useCart.getState().setOrders(data.orders as Order[])
          }
        } catch {
          // Offline / network error fallback
        }
      },

      loginAdmin: async (pin) => {
        if (get().cloudEnabled) {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'admin_login', pin }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) return { ok: false, error: data.error || 'PIN Admin salah.' }
          set({
            role: 'admin',
            userProfile: data.session || {
              username: 'administrator',
              name: 'Administrator',
              phone: get().shop.wa || '088905601902',
              address: get().shop.name || 'Warung Gery',
            },
          })
          await get().syncBootstrap()
          return { ok: true }
        }

        if (pin.trim() === get().adminPin) {
          set({
            role: 'admin',
            userProfile: {
              username: 'administrator',
              name: 'Administrator',
              phone: get().shop.wa || '088905601902',
              address: get().shop.name || 'Warung Gery',
            },
          })
          return { ok: true }
        }
        return { ok: false, error: 'PIN salah. Coba lagi (default demo: 1234).' }
      },

      logout: async () => {
        set({ role: 'user', userProfile: { name: '', phone: '', address: '' } })
        if (get().cloudEnabled) {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' }),
          }).catch(() => {})
          await get().syncBootstrap()
        }
      },

      loginCustomerAccount: async ({ identifier, pin }) => {
        if (!get().cloudEnabled) {
          return { ok: false, error: 'Login dengan ID butuh koneksi Database Cloud.' }
        }
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'customer_login', identifier, pin }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return { ok: false, error: data.error || 'Gagal masuk akun.' }
        set({ role: 'user', userProfile: data.session })
        await get().syncBootstrap()
        return { ok: true }
      },

      registerCustomerAccount: async ({ username, name, phone, address, pin }) => {
        if (get().cloudEnabled) {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'customer_register', username, name, phone, address, pin }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) return { ok: false, error: data.error || 'Gagal mendaftar.' }
          set({ role: 'user', userProfile: data.session })
          await get().syncBootstrap()
          return { ok: true }
        }

        set({ role: 'user', userProfile: { username, name, phone, address } })
        return { ok: true }
      },

      updateCustomerProfile: async ({ name, address }) => {
        if (get().cloudEnabled && get().userProfile.customerId) {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'customer_update', name, address }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) return { ok: false, error: data.error || 'Gagal memperbarui profil.' }
          set({ userProfile: data.session })
          return { ok: true }
        }
        set((s) => ({ userProfile: { ...s.userProfile, name, address } }))
        return { ok: true }
      },

      setAdminPin: async (pin) => {
        const clean = pin.trim() || '1234'
        set({ adminPin: clean })
        if (get().cloudEnabled) {
          await fetch('/api/shop', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminPin: clean }),
          }).catch(() => {})
        }
      },

      setUserProfile: (profile) => set((s) => ({ userProfile: { ...s.userProfile, ...profile } })),

      addProduct: async (p) => {
        if (get().cloudEnabled) {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          })
          const data = await res.json().catch(() => ({}))
          if (res.ok && data.product) {
            set((s) => ({ products: [...s.products, data.product] }))
            return
          }
        }
        set((s) => {
          const nextId = s.products.reduce((m, x) => Math.max(m, x.id), 0) + 1
          return { products: [{ ...p, id: nextId, available: p.available ?? true, stock: p.stock ?? 10 }, ...s.products] }
        })
      },

      updateProduct: async (id, patch) => {
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }))
        if (get().cloudEnabled) {
          await fetch('/api/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...patch }),
          }).catch(() => {})
        }
      },

      deleteProduct: async (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
        if (get().cloudEnabled) {
          await fetch(`/api/products?id=${id}`, { method: 'DELETE' }).catch(() => {})
        }
      },

      resetProducts: () => set({ products: seededProducts }),

      upsertPromo: async (promo) => {
        const code = promo.code.trim().toUpperCase()
        set((s) => {
          const exists = s.promos.some((x) => x.code === code)
          return {
            promos: exists
              ? s.promos.map((x) => (x.code === code ? { ...promo, code } : x))
              : [{ ...promo, code }, ...s.promos],
          }
        })
        if (get().cloudEnabled) {
          await fetch('/api/promos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...promo, code }),
          }).catch(() => {})
        }
      },

      togglePromo: async (code) => {
        const current = get().promos.find((x) => x.code === code)
        const nextActive = current ? !current.active : true
        set((s) => ({
          promos: s.promos.map((x) => (x.code === code ? { ...x, active: nextActive } : x)),
        }))
        if (get().cloudEnabled) {
          await fetch('/api/promos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, active: nextActive }),
          }).catch(() => {})
        }
      },

      deletePromo: async (code) => {
        set((s) => ({ promos: s.promos.filter((x) => x.code !== code) }))
        if (get().cloudEnabled) {
          await fetch(`/api/promos?code=${encodeURIComponent(code)}`, { method: 'DELETE' }).catch(() => {})
        }
      },

      updateShop: async (patch) => {
        set((s) => ({ shop: { ...s.shop, ...patch } }))
        if (get().cloudEnabled) {
          await fetch('/api/shop', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
          }).catch(() => {})
        }
      },
    }),
    {
      name: 'warung-gery-store-v1',
      partialize: (state) => ({
        role: state.role,
        adminPin: state.adminPin,
        userProfile: state.userProfile,
        products: state.products,
        promos: state.promos,
        shop: state.shop,
      }),
    }
  )
)
