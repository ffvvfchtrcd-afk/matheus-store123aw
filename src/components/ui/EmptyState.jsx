import { Button } from './Button'
import { Container } from './Container'

export function EmptyState({ icon: Icon, title, description, actionLabel, actionLink, onAction }) {
  return (
    <Container className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="mb-6 p-4 rounded-full bg-surface-secondary">
          <Icon className="w-16 h-16 text-text-muted" />
        </div>
      )}
      <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
      {description && <p className="text-text-secondary text-sm max-w-md mb-6">{description}</p>}
      {actionLabel && (
        <Button as={actionLink ? 'a' : 'button'} href={actionLink} onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </Container>
  )
}
