import { cloneElement, isValidElement } from 'react'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-accent text-black hover:bg-accent-hover shadow-[0_0_12px_rgba(232,184,74,0.3)] hover:shadow-[0_0_20px_rgba(232,184,74,0.45)] border border-accent/40',
  secondary: 'border-2 border-accent/40 text-text-primary hover:bg-accent/10 hover:border-accent/70 hover:shadow-[0_0_15px_rgba(232,184,74,0.2)]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary hover:border hover:border-accent/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-500/40',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', fullWidth, className, disabled, children, asChild, ...props }) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  )

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(classes, children.props.className),
      disabled,
      ...props,
    })
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
