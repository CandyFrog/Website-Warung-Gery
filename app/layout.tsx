import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Figtree } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ToastContainer from '@/components/ToastContainer'
import DataSync from '@/components/DataSync'

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' })
const body = Figtree({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: { default: 'Warung Gery', template: '%s | Warung Gery' },
  description: 'Belanja harian di Warung Gery. Pilih barang, kirim pesanan lewat WhatsApp.',
}
export const viewport: Viewport = { themeColor: '#0F5C4D' }

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen flex flex-col">
        <DataSync />
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  )
}
