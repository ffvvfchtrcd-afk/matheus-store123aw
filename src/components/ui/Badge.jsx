import { cn } from '../../utils/cn'

export function Badge({ count, dot, className }) {
  if (!count && !dot) return null
  return (
    <span
      className={cn(
        'absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1',
        dot && 'min-w-[8px] h-[8px] p-0',
        className
      )}
    >
      {!dot && count > 99 ? '99+' : dot ? '' : count}
    </span>
  )
}
