import { useEffect } from 'react'
import { CloseIcon } from '../ui/Icons'

const SIZE_TABLES = {
  'PP': { bust: '80', waist: '62', hip: '88' },
  'P': { bust: '84', waist: '66', hip: '92' },
  'M': { bust: '88', waist: '70', hip: '96' },
  'G': { bust: '94', waist: '76', hip: '102' },
  'GG': { bust: '100', waist: '82', hip: '108' },
  'XG': { bust: '106', waist: '88', hip: '114' },
  '36': { bust: '80', waist: '62', hip: '88' },
  '38': { bust: '84', waist: '66', hip: '92' },
  '40': { bust: '88', waist: '70', hip: '96' },
  '42': { bust: '94', waist: '76', hip: '102' },
  '44': { bust: '100', waist: '82', hip: '108' },
  '46': { bust: '106', waist: '88', hip: '114' },
}

export function SizeGuideModal({ sizes, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const knownSizes = (sizes || []).filter((s) => SIZE_TABLES[s])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Guia de tamanhos">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-secondary border-2 border-accent/35 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in shadow-[0_0_25px_rgba(232,184,74,0.15)] p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors" aria-label="Fechar">
          <CloseIcon className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-text-primary mb-6">Guia de Tamanhos</h2>

        {knownSizes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text-muted font-medium">Tamanho</th>
                  <th className="text-center py-2 px-3 text-text-muted font-medium">Busto (cm)</th>
                  <th className="text-center py-2 px-3 text-text-muted font-medium">Cintura (cm)</th>
                  <th className="text-center py-2 px-3 text-text-muted font-medium">Quadril (cm)</th>
                </tr>
              </thead>
              <tbody>
                {knownSizes.map((size) => {
                  const m = SIZE_TABLES[size]
                  return (
                    <tr key={size} className="border-b border-border/50">
                      <td className="py-2.5 px-3 font-medium text-text-primary">{size}</td>
                      <td className="text-center py-2.5 px-3 text-text-secondary">{m.bust}</td>
                      <td className="text-center py-2.5 px-3 text-text-secondary">{m.waist}</td>
                      <td className="text-center py-2.5 px-3 text-text-secondary">{m.hip}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-secondary text-center py-4">Medidas não disponíveis para estes tamanhos.</p>
        )}

        <p className="text-xs text-text-muted mt-6">As medidas são aproximadas e podem variar entre marcas.</p>
      </div>
    </div>
  )
}
