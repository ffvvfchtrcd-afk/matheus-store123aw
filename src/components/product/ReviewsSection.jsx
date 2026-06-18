import { useState, useEffect } from 'react'
import { StarIcon, StarEmptyIcon } from '../ui/Icons'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { addReview, getReviewsByModel } from '../../db/reviewRepo'

function ReviewForm({ modelSlug, onSubmitted }) {
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return
    if (!isAuthenticated) {
      addToast('Faça login para avaliar.', 'info')
      return
    }
    setSaving(true)
    try {
      await addReview({
        modelSlug,
        username: user.username,
        name: user.name || user.username,
        rating,
        comment,
      })
      addToast('Avaliação enviada!', 'success')
      setRating(0)
      setComment('')
      onSubmitted?.()
    } catch {
      addToast('Erro ao enviar avaliação.', 'error')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            {star <= (hoverRating || rating) ? (
              <StarIcon className="w-5 h-5 text-accent" />
            ) : (
              <StarEmptyIcon className="w-5 h-5 text-text-muted" />
            )}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Conte sua experiência com o produto (opcional)"
        rows={3}
        className="w-full px-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors resize-none"
      />
      <Button type="submit" variant="primary" size="sm" disabled={rating === 0 || saving}>
        {saving ? 'Enviando...' : 'Enviar Avaliação'}
      </Button>
    </form>
  )
}

export function ReviewsSection({ modelSlug, rating, reviewCount }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const r = await getReviewsByModel(modelSlug)
      setReviews(r || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    if (modelSlug) loadReviews()
  }, [modelSlug])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : rating || 0

  return (
    <section className="border-t border-border pt-8 mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Avaliações</h2>
        <span className="text-sm text-text-muted">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-surface-secondary rounded-xl border border-border">
          <span className="text-3xl font-bold text-text-primary">{avgRating}</span>
          <div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-accent' : 'text-text-muted opacity-30'}`} />
              ))}
            </div>
            <span className="text-xs text-text-muted">{reviews.length} {reviews.length === 1 ? 'avaliacão' : 'avaliações'}</span>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {loading ? (
          [1, 2].map((i) => <div key={i} className="h-24 bg-surface-secondary animate-pulse rounded-xl" />)
        ) : reviews.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">Nenhuma avaliação ainda. Seja o primeiro!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-surface-secondary border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">{review.name || review.username}</span>
                <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-accent' : 'text-text-muted opacity-30'}`} />
                ))}
              </div>
              {review.comment && <p className="text-sm text-text-secondary">{review.comment}</p>}
            </div>
          ))
        )}
      </div>

      <div className="bg-surface-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Deixe sua avaliação</h3>
        <ReviewForm modelSlug={modelSlug} onSubmitted={loadReviews} />
      </div>
    </section>
  )
}
