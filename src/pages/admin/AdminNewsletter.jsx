import { useState, useEffect, useContext } from 'react'
import { DatabaseContext } from '../../context/DatabaseContext'
import { getSubscribers } from '../../db/newsletterRepo'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'

export default function AdminNewsletter() {
  const { ready } = useContext(DatabaseContext)
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(subscribers, 20)

  useEffect(() => {
    if (!ready) return
    setLoading(true)
    ;(async () => {
      try {
        const list = await getSubscribers()
        setSubscribers(list || [])
      } catch {}
      setLoading(false)
    })()
  }, [ready])

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
  }

  if (subscribers.length === 0) {
    return <EmptyState title="Nenhum assinante" description="Ninguém se cadastrou na newsletter ainda." actionLabel="Voltar" actionLink="/admin" />
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Newsletter ({subscribers.length})</h2>
      <p className="text-sm text-text-secondary mb-6">Assinantes cadastrados.</p>

      <div className="bg-surface-secondary border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="text-left py-3 px-4 font-medium">Email</th>
              <th className="text-left py-3 px-4 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((sub) => (
              <tr key={sub.email} className="border-b border-border/50 hover:bg-surface-hover/30 transition-colors">
                <td className="py-3 px-4 text-text-primary">{sub.email}</td>
                <td className="py-3 px-4 text-text-secondary text-xs">
                  {new Date(sub.subscribedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  )
}
