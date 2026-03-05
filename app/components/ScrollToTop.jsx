'use client'
import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 z-30 w-10 h-10 rounded-full vs-card border vs-border shadow-lg flex items-center justify-center vs-text transition-all hover:scale-110"
      aria-label="Scroll to top"
    >
      <ChevronUp size={20} />
    </button>
  )
}
