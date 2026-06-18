import { cn } from '../../utils/cn'

export function Container({ className, children, as: Tag = 'div', ...props }) {
  return (
    <Tag className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </Tag>
  )
}
