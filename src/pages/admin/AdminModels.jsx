import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { DatabaseContext } from '../../context/DatabaseContext'
import { getModels, saveModel, deleteModel } from '../../db/modelRepo'
import { getAllCategories } from '../../db/categoryRepo'
import { transaction } from '../../db/db'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const INPUT_CLASS = 'w-full px-2.5 py-1.5 bg-surface-tertiary border border-border rounded text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors'
const LABEL_CLASS = 'block text-xs font-medium text-text-muted mb-1'
const SELECT_CLASS = 'w-full px-2.5 py-1.5 bg-surface-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-text-muted transition-colors'

function emptyModel() {
  return {
    slug: '', name: '', brand: '', subcategory: '', gender: '', description: '',
    featured: false, rating: 0, reviews: 0, discountPercentage: 0,
    colors: [], sizes: [], images: [], details: { material: '', care: '' },
    variants: [], colorImages: {},
  }
}

function skuColor(code, name) {
  return name.substring(0, 3).toUpperCase()
}

function buildSku(slug, color, size) {
  const prefix = slug.substring(0, 7).toUpperCase().replace(/-/g, '')
  const c = skuColor(null, color)
  return `${prefix}-${c}-${size}`
}

function variantsToMatrix(variants, colors, sizes) {
  const matrix = {}
  for (const v of variants || []) {
    if (!matrix[v.color]) matrix[v.color] = {}
    matrix[v.color][v.size] = { price: v.price || 0, originalPrice: v.originalPrice || 0, stock: v.stock || 0 }
  }
  return matrix
}

function matrixToVariants(matrix, colors, sizes, slug) {
  const variants = []
  for (const color of colors) {
    for (const size of sizes) {
      const cell = matrix[color]?.[size]
      if (!cell) continue
      const sku = buildSku(slug, color, size)
      variants.push({
        sku,
        size,
        color,
        price: cell.price || 0,
        originalPrice: cell.originalPrice || 0,
        stock: cell.stock || 0,
      })
    }
  }
  return variants
}

function ProductModal({ show, onClose, onSave, initial, categories }) {
  const [form, setForm] = useState(emptyModel())
  const [sizeInput, setSizeInput] = useState('')
  const [matrix, setMatrix] = useState({})
  const [subcats, setSubcats] = useState([])
  const [brands, setBrands] = useState([])

  const sizes = form.sizes || []

  useEffect(() => {
    if (initial) {
      const allSizes = [...new Set((initial.variants || []).map((v) => v.size).filter(Boolean))]
      const f = {
        slug: initial.slug || '', name: initial.name || '', brand: initial.brand || '',
        subcategory: initial.subcategory || '', gender: initial.gender || '',
        description: initial.description || '', featured: !!initial.featured,
        rating: initial.rating || 0, reviews: initial.reviews || 0,
        discountPercentage: initial.discountPercentage || 0,
        colors: initial.colors || [], sizes: allSizes, images: initial.images || [],
        details: initial.details || { material: '', care: '' },
        variants: initial.variants || [], colorImages: initial.colorImages || {},
      }
      setForm(f)
      setSizeInput(allSizes.join(', '))
      setMatrix(variantsToMatrix(initial.variants, initial.colors || [], allSizes))
    } else {
      setForm(emptyModel())
      setSizeInput('')
      setMatrix({})
    }
    setSubcats([])
    setBrands([])
  }, [initial, show])

  useEffect(() => {
    if (!form.gender) { setSubcats([]); return }
    const cat = categories.find((c) => c.slug === form.gender)
    setSubcats(cat?.subcategories || [])
  }, [form.gender, categories])

  useEffect(() => {
    if (!form.gender || !form.subcategory) { setBrands([]); return }
    ;(async () => {
      try {
        const { getBrands } = await import('../../db/categoryRepo')
        const result = await getBrands({ gender: form.gender, subcategory: form.subcategory })
        setBrands(result.map((b) => b.name))
      } catch {}
    })()
  }, [form.gender, form.subcategory])

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const setSizes = (text) => {
    setSizeInput(text)
    const parsed = text.split(',').map((s) => s.trim()).filter(Boolean)
    setForm((p) => ({ ...p, sizes: parsed }))
  }

  const ensureCell = (color, size) => {
    setMatrix((prev) => {
      const next = { ...prev }
      if (!next[color]) next[color] = {}
      if (!next[color][size]) next[color][size] = { price: 0, originalPrice: 0, stock: 0 }
      return next
    })
  }

  const updateCell = (color, size, key, value) => {
    ensureCell(color, size)
    setMatrix((prev) => ({
      ...prev,
      [color]: { ...prev[color], [size]: { ...prev[color][size], [key]: value } },
    }))
  }

  const addColor = () => {
    const name = prompt('Nome da cor:')
    if (!name) return
    if (form.colors.includes(name)) { alert('Cor já existe'); return }
    setForm((p) => ({
      ...p,
      colors: [...p.colors, name],
      colorImages: { ...p.colorImages, [name]: '' },
    }))
  }

  const removeColor = (name) => {
    setForm((p) => ({
      ...p,
      colors: p.colors.filter((c) => c !== name),
      colorImages: Object.fromEntries(Object.entries(p.colorImages).filter(([k]) => k !== name)),
    }))
    setMatrix((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const addImage = () => {
    const url = prompt('URL da imagem:')
    if (!url) return
    setForm((p) => ({ ...p, images: [...p.images, url] }))
  }

  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-10" onClick={onClose}>
      <div className="bg-surface-secondary border border-border rounded-xl p-6 w-full max-w-5xl mx-4 my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-text-primary">{initial ? `Editar: ${initial.name}` : 'Novo Produto'}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={LABEL_CLASS}>Nome do Produto</label>
              <input className={INPUT_CLASS} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Camiseta Oversized Algodão" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Slug</label>
              <input className={INPUT_CLASS} value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="camiseta-oversized" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Desconto (%)</label>
              <input className={INPUT_CLASS} type="number" min="0" max="100" value={form.discountPercentage} onChange={(e) => set('discountPercentage', Number(e.target.value))} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Gênero / Categoria</label>
              <select className={SELECT_CLASS} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="">Selecione...</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Subcategoria</label>
              <select className={SELECT_CLASS} value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} disabled={!form.gender}>
                <option value="">Selecione...</option>
                {subcats.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Marca</label>
              <select className={SELECT_CLASS} value={form.brand} onChange={(e) => set('brand', e.target.value)} disabled={!form.subcategory}>
                <option value="">Selecione...</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-accent" />
                <span className="text-xs text-text-secondary">Destaque</span>
              </label>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Descrição</label>
            <textarea className={INPUT_CLASS + ' resize-none'} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Descrição do produto..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Material</label>
              <input className={INPUT_CLASS} value={form.details.material} onChange={(e) => set('details', { ...form.details, material: e.target.value })} placeholder="Ex: Algodão premium" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Cuidados</label>
              <input className={INPUT_CLASS} value={form.details.care} onChange={(e) => set('details', { ...form.details, care: e.target.value })} placeholder="Ex: Lavar à máquina" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={LABEL_CLASS + ' mb-0'}>Imagens do Produto</label>
              <button onClick={addImage} className="text-xs text-accent hover:underline">+ Adicionar URL</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt="" className="w-16 h-20 object-cover rounded border border-border" onError={(e) => { e.target.style.display = 'none' }} />
                  <button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {form.images.length === 0 && <span className="text-xs text-text-muted">Nenhuma imagem adicionada.</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={LABEL_CLASS + ' mb-0'}>Cores</label>
                <button onClick={addColor} className="text-xs text-accent hover:underline">+ Adicionar</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.colors.length === 0 && <span className="text-xs text-text-muted">Nenhuma cor.</span>}
                {form.colors.map((color) => (
                  <div key={color} className="flex items-center gap-1 px-2 py-1 bg-surface-tertiary border border-border/50 rounded text-xs text-text-secondary group">
                    <span>{color}</span>
                    <button onClick={() => removeColor(color)} className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              {form.colors.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] text-text-muted">URL da imagem por cor:</p>
                  {form.colors.map((color) => (
                    <div key={color} className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary w-20 flex-shrink-0 truncate">{color}</span>
                      <input className={INPUT_CLASS} placeholder="URL..." value={form.colorImages[color] || ''} onChange={(e) => set('colorImages', { ...form.colorImages, [color]: e.target.value })} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={LABEL_CLASS}>Tamanhos Disponíveis</label>
              <input className={INPUT_CLASS} value={sizeInput} onChange={(e) => setSizes(e.target.value)} placeholder="Ex: P, M, G, GG  ou  38, 39, 40, 41, 42, 43, 44" />
              <p className="text-[10px] text-text-muted mt-1">Separe por vírgula. Os tamanhos serão organizados em colunas na matriz abaixo.</p>
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sizes.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {form.colors.length > 0 && sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={LABEL_CLASS + ' mb-0'}>Matriz de Preço e Estoque</label>
                <button onClick={() => {
                  const price = prompt('Preço padrão para todas as células (R$):')
                  if (price === null) return
                  const stock = prompt('Estoque padrão para todas as células:')
                  if (stock === null) return
                  const p = parseFloat(price) || 0
                  const s = parseInt(stock) || 0
                  const next = {}
                  for (const color of form.colors) {
                    next[color] = {}
                    for (const size of sizes) {
                      next[color][size] = { price: p, originalPrice: p, stock: s }
                    }
                  }
                  setMatrix(next)
                }} className="text-xs text-accent hover:underline">
                  Preencher Tabela
                </button>
              </div>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-surface-tertiary/50">
                      <th className="text-left py-2 px-3 font-medium text-text-muted sticky left-0 bg-surface-tertiary/50 min-w-[90px]">Cor \ Tamanho</th>
                      {sizes.map((size) => (
                        <th key={size} className="text-center py-2 px-2 font-medium text-text-muted min-w-[100px]">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.colors.map((color) => (
                      <tr key={color} className="border-t border-border/50">
                        <td className="py-2 px-3 font-medium text-text-secondary text-xs sticky left-0 bg-surface-secondary border-r border-border/50 min-w-[90px]">{color}</td>
                        {sizes.map((size) => {
                          const cell = matrix[color]?.[size] || { price: 0, originalPrice: 0, stock: 0 }
                          return (
                            <td key={size} className="py-1.5 px-1.5 border-r border-border/50">
                              <div className="flex flex-col gap-1">
                                <div className="flex gap-1">
                                  <input className="w-full px-1.5 py-1 bg-surface-tertiary border border-border rounded text-[10px] text-text-primary text-center focus:outline-none focus:border-text-muted"
                                    type="number" step="0.01" placeholder="R$" value={cell.price || ''}
                                    onChange={(e) => updateCell(color, size, 'price', parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="flex gap-1">
                                  <input className="w-full px-1.5 py-1 bg-surface-tertiary border border-border rounded text-[10px] text-text-primary text-center focus:outline-none focus:border-text-muted"
                                    type="number" placeholder="Estq" value={cell.stock || ''}
                                    onChange={(e) => updateCell(color, size, 'stock', parseInt(e.target.value) || 0)} />
                                </div>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-text-muted mt-1">Preencha Preço e Estoque para cada combinação de Cor × Tamanho. Células vazias não geram variantes.</p>
            </div>
          )}

          {form.colors.length > 0 && sizes.length > 0 && (
            <div className="bg-surface-tertiary/30 border border-border/50 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">
                <span className="text-text-primary font-medium">Resumo:</span> Serão geradas <strong>{form.colors.length * sizes.length}</strong> variantes ({form.colors.length} cores × {sizes.length} tamanhos)
              </p>
              <p className="text-[10px] text-text-muted">SKUs gerados automaticamente no formato: <span className="font-mono">SLUG-XXX-TAM</span></p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={() => {
            const variants = matrixToVariants(matrix, form.colors, sizes, form.slug)
            const finalForm = { ...form, variants, sizes }
            onSave(finalForm)
          }} disabled={!form.name || !form.slug || !form.gender || !form.subcategory || !form.brand || variantsCount(matrix, form.colors, sizes) === 0}>
            Salvar Produto ({variantsCount(matrix, form.colors, sizes)} variantes)
          </Button>
        </div>
      </div>
    </div>
  )
}

function variantsCount(matrix, colors, sizes) {
  let count = 0
  for (const color of colors) {
    for (const size of sizes) {
      const cell = matrix[color]?.[size]
      if (cell && (cell.price > 0 || cell.stock > 0)) count++
    }
  }
  return count
}

export default function AdminModels() {
  const { ready } = useContext(DatabaseContext)
  const { addToast } = useToast()
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(models, 10)

  const load = async () => {
    if (!ready) return
    setLoading(true)
    try {
      const [all, cats] = await Promise.all([getModels({}), getAllCategories()])
      setModels(all)
      setCategories(cats)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [ready])

  const openNew = () => {
    const cat = categories[0]
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (model) => {
    setEditing(model)
    setShowModal(true)
  }

  const handleSave = async (form) => {
    try {
      const modelData = {
        ...form,
        slug: form.slug || slugify(form.name),
        rating: Number(form.rating) || 0,
        reviews: Number(form.reviews) || 0,
        discountPercentage: Number(form.discountPercentage) || 0,
        featured: !!form.featured,
      }
      if (!editing) {
        const existing = await import('../../db/modelRepo').then((m) => m.getModelBySlug(modelData.slug))
        if (existing) { addToast('Já existe um produto com este slug.', 'error'); return }
      }
      await saveModel(modelData)
      if (!editing) addToast('Produto criado com sucesso!', 'success')
      else addToast('Produto atualizado!', 'success')
      setShowModal(false)
      setEditing(null)
      load()
    } catch (e) {
      addToast('Erro ao salvar: ' + e.message, 'error')
    }
  }

  const handleDelete = async (model) => {
    if (!confirm(`Excluir "${model.name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteModel(model.slug)
      addToast('Produto excluído!', 'success')
      load()
    } catch (e) {
      addToast('Erro ao excluir: ' + e.message, 'error')
    }
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-surface-secondary animate-pulse rounded-xl" />)}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Produtos ({models.length})</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={async () => {
            const { exportModelsCSV } = await import('../../utils/csv')
            exportModelsCSV(models)
          }} className="text-xs">
            Exportar CSV
          </Button>
          <Button variant="primary" size="sm" onClick={openNew}>
            + Novo Produto
          </Button>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted mb-4">Nenhum produto cadastrado.</p>
          <Button variant="primary" size="sm" onClick={openNew}>Criar Primeiro Produto</Button>
        </div>
      ) : (
        <div className="bg-surface-secondary border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">Produto</th>
                <th className="text-left py-3 px-4 font-medium">Marca</th>
                <th className="text-left py-3 px-4 font-medium">Categoria</th>
                <th className="text-left py-3 px-4 font-medium">Preço</th>
                <th className="text-left py-3 px-4 font-medium">Estoque</th>
                <th className="text-left py-3 px-4 font-medium">Destaque</th>
                <th className="text-right py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.map((model) => {
                const prices = (model.variants || []).map((v) => v.price).filter((p) => p > 0)
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0
                const totalStock = (model.variants || []).reduce((s, v) => s + (v.stock || 0), 0)
                return (
                  <tr key={model.slug} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <Link to={`/produto/${model.slug}`} className="font-medium text-text-primary hover:text-accent transition-colors text-sm">
                          {model.name}
                        </Link>
                        <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">{model.slug}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{model.brand}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-[10px] text-text-muted">
                        <span>{categories.find((c) => c.slug === model.gender)?.label || model.gender}</span>
                        <span>{model.subcategory}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-text-primary font-medium">{minPrice > 0 ? `R$ ${minPrice.toFixed(2).replace('.', ',')}` : '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${totalStock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {model.featured ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded font-medium">Destaque</span>
                      ) : (
                        <span className="text-[10px] text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button onClick={() => openEdit(model)} className="p-1.5 text-text-muted hover:text-accent transition-colors" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(model)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors" title="Excluir">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />

      <ProductModal show={showModal} onClose={() => { setShowModal(false); setEditing(null) }} onSave={handleSave} initial={editing} categories={categories} />
    </div>
  )
}