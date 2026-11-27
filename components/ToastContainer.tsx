'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useToast } from '@/lib/toast'

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-line bg-card/95 px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-md"
          >
            {t.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-sale" />
            ) : t.type === 'info' ? (
              <Info className="h-4 w-4 shrink-0 text-tagink dark:text-tag" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
            )}
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 rounded-full p-0.5 text-mute hover:bg-line/50 hover:text-ink"
              aria-label="Tutup notifikasi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
