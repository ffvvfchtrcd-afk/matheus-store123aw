import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CloseIcon } from '../ui/Icons'

const BANNER_KEY = 'lojavm_top_banner'
const BANNER_DISMISSED_KEY = 'lojavm_top_banner_dismissed'

export function TopBanner({ onHeightChange }) {
  const [banner, setBanner] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(BANNER_KEY))
      if (data && data.url) setBanner(data)
      const wasDismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
      if (wasDismissed) setDismissed(true)
    } catch {}
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => {
      onHeightChange?.(entry.contentRect.height)
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [banner, dismissed, onHeightChange])

  const handleDismiss = () => {
    setDismissed(true)
    onHeightChange?.(0)
    localStorage.setItem(BANNER_DISMISSED_KEY, '1')
  }

  if (!banner || dismissed) return null

  return (
    <div ref={ref} className="relative w-full group z-[70]">
      <Link to={banner.link || '#'} className="block">
        <img
          src={banner.url}
          alt="Banner"
          className="w-full h-auto max-h-[120px] object-cover"
        />
      </Link>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Fechar banner"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export function getBanner() {
  try {
    return JSON.parse(localStorage.getItem(BANNER_KEY)) || null
  } catch {
    return null
  }
}

export function setBanner(url, link = '') {
  localStorage.setItem(BANNER_KEY, JSON.stringify({ url, link }))
  localStorage.removeItem(BANNER_DISMISSED_KEY)
}

export function clearBanner() {
  localStorage.removeItem(BANNER_KEY)
  localStorage.removeItem(BANNER_DISMISSED_KEY)
}
