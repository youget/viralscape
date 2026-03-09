'use client'
import { useState, useEffect, useCallback } from 'react'

let showToastFn = null

export function toast(message, link) {
  if (showToastFn) showToastFn(message, link)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, link) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, link }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    showToastFn = addToast
    return () => { showToastFn = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <div key={t.id} className="vs-card border vs-border rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2 animate-slide-up">
          <span className="text-xs font-semibold vs-text">{t.message}</span>
          {t.link && (
            <a href={t.link} className="text-[10px] font-bold underline" style={{ color: 'var(--vs-accent)' }}>
              View
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
