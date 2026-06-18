import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { getBanner, setBanner, clearBanner } from '../../components/layout/TopBanner'
import { useToast } from '../../context/ToastContext'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminBanner() {
  const { addToast } = useToast()
  const [url, setUrl] = useState('')
  const [link, setLink] = useState('')
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const b = getBanner()
    if (b) {
      setUrl(b.url)
      setLink(b.link || '')
      setCurrent(b)
    }
  }, [])

  const handleSave = () => {
    if (!url.trim()) {
      addToast('Insira a URL da imagem do banner.', 'error')
      return
    }
    setBanner(url.trim(), link.trim())
    setCurrent({ url: url.trim(), link: link.trim() })
    addToast('Banner salvo com sucesso!', 'success')
  }

  const handleClear = () => {
    clearBanner()
    setUrl('')
    setLink('')
    setCurrent(null)
    addToast('Banner removido.', 'info')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Banner do Topo</h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure o banner que aparece no topo de todas as páginas.
        </p>
      </div>

      <div className="bg-surface-secondary border border-accent/30 rounded-xl p-6 space-y-4 shadow-[0_0_10px_rgba(232,184,74,0.08)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🖼️</span>
          <h2 className="text-lg font-semibold text-text-primary">Imagem do Banner</h2>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">URL da Imagem</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com/banner.jpg"
            className="w-full px-3 py-2.5 bg-surface-tertiary border border-accent/30 rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_12px_rgba(232,184,74,0.25)] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Link de Destino (opcional)</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/ofertas ou https://..."
            className="w-full px-3 py-2.5 bg-surface-tertiary border border-accent/30 rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_12px_rgba(232,184,74,0.25)] transition-all"
          />
        </div>

        {url && (
          <div className="mt-4">
            <p className="text-xs font-medium text-text-secondary mb-2">Pré-visualização:</p>
            <img
              src={url}
              alt="Preview do banner"
              className="w-full max-h-[120px] object-cover rounded-lg border border-border"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="primary" size="sm" onClick={handleSave}>
            Salvar Banner
          </Button>
          {current && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-400 hover:bg-red-500/10">
              <TrashIcon className="w-4 h-4 mr-1" />
              Remover Banner
            </Button>
          )}
        </div>

        {current && (
          <p className="text-xs text-text-muted">
            Banner ativo. O visitante pode fechar o banner, que só volta a aparecer quando você atualizar.
          </p>
        )}
      </div>
    </div>
  )
}
