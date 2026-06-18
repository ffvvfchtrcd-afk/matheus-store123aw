import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CloseIcon } from './Icons'

const ICONS = {
  success: CheckIcon,
  error: CloseIcon,
  info: CheckIcon,
  warning: CloseIcon,
}

const BG = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-accent text-black',
  warning: 'bg-yellow-500 text-black',
}

export function Toast({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration)
    return () => clearTimeout(timerRef.current)
  }, [toast, onRemove])

  const Icon = ICONS[toast.type] || ICONS.info

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
        BG[toast.type] || BG.info
      } ${exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => { clearTimeout(timerRef.current); setExiting(true); setTimeout(() => onRemove(toast.id), 300) }} className="p-0.5 hover:opacity-70 transition-opacity">
        <CloseIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
