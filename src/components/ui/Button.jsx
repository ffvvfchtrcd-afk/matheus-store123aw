import { cloneElement, isValidElement } from 'react'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-accent text-black hover:bg-accent-hover',
  secondary: 'border border-border text-text-primary hover:bg-surface-tertiary',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
  danger: 'bg-red-600 text-white hover:bg-red-700',
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
