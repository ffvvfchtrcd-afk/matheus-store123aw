import { useState, useEffect, useContext } from 'react'
import { DatabaseContext } from '../../context/DatabaseContext'
import { getAllCategories, saveCategory, deleteCategory, getBrands, saveBrand, deleteBrand } from '../../db/categoryRepo'
import { useToast } from '../../context/ToastContext'
import { Button } from '../../components/ui/Button'

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const INPUT_CLASS = 'w-full px-2.5 py-1.5 bg-surface-tertiary border border-border rounded text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted'
const LABEL_CLASS = 'block text-xs font-medium text-text-muted mb-1'
const SELECT_CLASS = 'w-full px-2.5 py-1.5 bg-surface-tertiary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-text-muted'

function CategoryModal({ show, onClose, onSave, initial }) {
  const [form, setForm] = useState({ label: '', slug: '', description: '' })

  useEffect(() => {
    if (initial) setForm({ label: initial.label, slug: initial.slug, description: initial.description || '' })
    else setForm({ label: '', slug: '', description: '' })
  }, [initial, show])

  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface-secondary border border-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-text-primary mb-4">{initial ? 'Editar Categoria' : 'Nova Categoria'}</h3>
        <div className="space-y-3">
          <div>
            <label className={LABEL_CLASS}>Nome</label>
            <input className={INPUT_CLASS} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value, slug: slugify(e.target.value) })} placeholder="Ex: Masculino" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Slug</label>
            <input className={INPUT_CLASS} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="masculino" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Descrição</label>
            <textarea className={INPUT_CLASS + ' resize-none'} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)} disabled={!form.label || !form.slug}>Salvar</Button>
        </div>
      </div>
    </div>
  )
}

function SubcategoryModal({ show, onClose, onSave, initial, categories, currentCategorySlug }) {
  const [form, setForm] = useState({ label: '', slug: '', categorySlug: '' })

  useEffect(() => {
    if (initial) setForm({ label: initial.label, slug: initial.slug, categorySlug: initial._categorySlug || currentCategorySlug })
    else setForm({ label: '', slug: '', categorySlug: currentCategorySlug })
  }, [initial, show, currentCategorySlug])

  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface-secondary border border-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-text-primary mb-4">{initial ? 'Editar Subcategoria' : 'Nova Subcategoria'}</h3>
        <div className="space-y-3">
          <div>
            <label className={LABEL_CLASS}>Categoria</label>
            <select className={SELECT_CLASS} value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Nome</label>
            <input className={INPUT_CLASS} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value, slug: slugify(e.target.value) })} placeholder="Ex: Camisetas" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Slug</label>
            <input className={INPUT_CLASS} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="camisetas" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)} disabled={!form.label || !form.slug || !form.categorySlug}>Salvar</Button>
        </div>
      </div>
    </div>
  )
}

function BrandModal({ show, onClose, onSave, initial, categories, brands }) {
  const [form, setForm] = useState({ name: '', slug: '', gender: '', subcategory: '' })

  useEffect(() => {
    if (initial) setForm({ name: initial.name, slug: initial.slug, gender: initial.gender, subcategory: initial.subcategory })
    else setForm({ name: '', slug: '', gender: '', subcategory: '' })
  }, [initial, show])

  const selectedCat = categories.find((c) => c.slug === form.gender)
  const subcats = selectedCat?.subcategories || []

  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface-secondary border border-border rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-text-primary mb-4">{initial ? 'Editar Marca' : 'Nova Marca'}</h3>
        <div className="space-y-3">
          <div>
            <label className={LABEL_CLASS}>Nome</label>
            <input className={INPUT_CLASS} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Ex: Nike" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Slug</label>
            <input className={INPUT_CLASS} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="nike" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Categoria (Gênero)</label>
            <select className={SELECT_CLASS} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value, subcategory: '' })}>
              <option value="">Selecione...</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Subcategoria</label>
            <select className={SELECT_CLASS} value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} disabled={!form.gender}>
              <option value="">Selecione...</option>
              {subcats.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)} disabled={!form.name || !form.slug || !form.gender || !form.subcategory}>Salvar</Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const { ready } = useContext(DatabaseContext)
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  const [catModal, setCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState(null)

  const [subModal, setSubModal] = useState(false)
  const [editingSub, setEditingSub] = useState(null)
  const [subCategorySlug, setSubCategorySlug] = useState('')

  const [brandModal, setBrandModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [brandSubFilter, setBrandSubFilter] = useState('')
  const [brandCatFilter, setBrandCatFilter] = useState('')

  const load = async () => {
    if (!ready) return
    setLoading(true)
    try {
      const [cats, brds] = await Promise.all([getAllCategories(), getBrands()])
      setCategories(cats)
      setBrands(brds)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [ready])

  const toggleExpand = (slug) => setExpanded((p) => ({ ...p, [slug]: !p[slug] }))

  const handleSaveCategory = async (form) => {
    try {
      const existing = categories.find((c) => c.slug === form.slug)
      const catData = existing
        ? { ...existing, label: form.label, description: form.description }
        : { slug: form.slug, label: form.label, description: form.description, subcategories: [] }
      if (editingCat && editingCat.slug !== form.slug) {
        await deleteCategory(editingCat.slug)
      }
      await saveCategory(catData)
      addToast(`Categoria "${form.label}" salva!`, 'success')
      setCatModal(false)
      setEditingCat(null)
      load()
    } catch (e) {
      addToast('Erro ao salvar categoria: ' + e.message, 'error')
    }
  }

  const handleDeleteCategory = async (cat) => {
    if (!confirm(`Excluir categoria "${cat.label}"? Todas as subcategorias e marcas associadas serão removidas.`)) return
    try {
      for (const sub of cat.subcategories || []) {
        for (const brand of brands.filter((b) => b.gender === cat.slug && b.subcategory === sub.slug)) {
          await deleteBrand(brand.name)
        }
      }
      await deleteCategory(cat.slug)
      addToast('Categoria excluída!', 'success')
      load()
    } catch (e) {
      addToast('Erro ao excluir: ' + e.message, 'error')
    }
  }

  const handleSaveSubcategory = async (form) => {
    try {
      const targetCat = categories.find((c) => c.slug === form.categorySlug)
      if (!targetCat) return
      const subs = [...(targetCat.subcategories || [])]

      if (editingSub) {
        const oldCat = categories.find((c) => c.slug === editingSub._categorySlug)
        if (oldCat && oldCat.slug !== form.categorySlug) {
          oldCat.subcategories = (oldCat.subcategories || []).filter((s) => s.slug !== editingSub.slug)
          await saveCategory(oldCat)
        }
        const idx = subs.findIndex((s) => s.slug === editingSub.slug)
        if (idx !== -1) subs[idx] = { slug: form.slug, label: form.label }
        else subs.push({ slug: form.slug, label: form.label })
      } else {
        const idx = subs.findIndex((s) => s.slug === form.slug)
        if (idx !== -1) subs[idx] = { slug: form.slug, label: form.label }
        else subs.push({ slug: form.slug, label: form.label })
      }
      targetCat.subcategories = subs
      await saveCategory(targetCat)
      addToast(`Subcategoria "${form.label}" salva!`, 'success')
      setSubModal(false)
      setEditingSub(null)
      load()
    } catch (e) {
      addToast('Erro ao salvar subcategoria: ' + e.message, 'error')
    }
  }

  const handleDeleteSubcategory = async (cat, sub) => {
    if (!confirm(`Excluir subcategoria "${sub.label}"?`)) return
    try {
      cat.subcategories = (cat.subcategories || []).filter((s) => s.slug !== sub.slug)
      await saveCategory(cat)
      for (const brand of brands.filter((b) => b.gender === cat.slug && b.subcategory === sub.slug)) {
        await deleteBrand(brand.name)
      }
      addToast('Subcategoria excluída!', 'success')
      load()
    } catch (e) {
      addToast('Erro ao excluir: ' + e.message, 'error')
    }
  }

  const moveSubcategory = async (cat, sub, direction) => {
    const subs = [...(cat.subcategories || [])]
    const idx = subs.findIndex((s) => s.slug === sub.slug)
    if (idx === -1) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= subs.length) return
    ;[subs[idx], subs[newIdx]] = [subs[newIdx], subs[idx]]
    cat.subcategories = subs
    await saveCategory(cat)
    load()
  }

  const handleSaveBrand = async (form) => {
    try {
      const brandData = { name: form.name, slug: form.slug, gender: form.gender, subcategory: form.subcategory }
      await saveBrand(brandData)
      addToast(`Marca "${form.name}" salva!`, 'success')
      setBrandModal(false)
      setEditingBrand(null)
      load()
    } catch (e) {
      addToast('Erro ao salvar marca: ' + e.message, 'error')
    }
  }

  const handleDeleteBrand = async (brand) => {
    if (!confirm(`Excluir marca "${brand.name}"?`)) return
    try {
      await deleteBrand(brand.name)
      addToast('Marca excluída!', 'success')
      load()
    } catch (e) {
      addToast('Erro ao excluir: ' + e.message, 'error')
    }
  }

  const filteredBrands = brands.filter((b) => {
    if (brandCatFilter && b.gender !== brandCatFilter) return false
    if (brandSubFilter && b.subcategory !== brandSubFilter) return false
    return true
  })

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-secondary animate-pulse rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Categorias</h2>
        <Button variant="primary" size="sm" onClick={() => { setEditingCat(null); setCatModal(true) }}>
          + Nova Categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.slug} className="bg-surface-secondary border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => toggleExpand(cat.slug)} className="text-text-muted hover:text-text-primary transition-colors">
                    <svg className={'w-4 h-4 transition-transform ' + (expanded[cat.slug] ? 'rotate-90' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div>
                    <span className="text-sm font-semibold text-text-primary">{cat.label}</span>
                    <span className="text-xs text-text-muted ml-2 font-mono">/{cat.slug}</span>
                    {cat.description && <p className="text-xs text-text-muted mt-0.5">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => { setEditingCat(cat); setCatModal(true) }} className="p-1.5 text-text-muted hover:text-accent transition-colors" title="Editar">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors" title="Excluir">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {expanded[cat.slug] && (
                <div className="p-5 space-y-4">
                  {(cat.subcategories || []).length === 0 ? (
                    <p className="text-xs text-text-muted">Nenhuma subcategoria.</p>
                  ) : (
                    <div className="space-y-2">
                      {cat.subcategories.map((sub, idx) => {
                        const subBrands = brands.filter((b) => b.gender === cat.slug && b.subcategory === sub.slug)
                        return (
                          <div key={sub.slug} className="bg-surface-tertiary/50 border border-border/50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm font-medium text-text-primary">{sub.label}</span>
                                <span className="text-xs text-text-muted font-mono">{sub.slug}</span>
                                <span className="text-xs text-text-muted">({subBrands.length} marcas)</span>
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button onClick={() => moveSubcategory(cat, sub, -1)} disabled={idx === 0} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors" title="Mover para cima">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                </button>
                                <button onClick={() => moveSubcategory(cat, sub, 1)} disabled={idx === cat.subcategories.length - 1} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors" title="Mover para baixo">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <button onClick={() => { setEditingSub({ ...sub, _categorySlug: cat.slug }); setSubCategorySlug(cat.slug); setSubModal(true) }} className="p-1.5 text-text-muted hover:text-accent transition-colors" title="Editar">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button onClick={() => handleDeleteSubcategory(cat, sub)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors" title="Excluir">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                            {subBrands.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2 ml-2">
                                {subBrands.map((b) => (
                                  <div key={b.name} className="flex items-center gap-1 px-2 py-0.5 bg-surface-secondary border border-border/50 rounded text-xs text-text-secondary group">
                                    <span>{b.name}</span>
                                    <button onClick={() => handleDeleteBrand(b)} className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                ))}
                                <button onClick={() => { setEditingBrand(null); setBrandCatFilter(cat.slug); setBrandSubFilter(sub.slug); setBrandModal(true) }} className="text-xs text-accent hover:underline">
                                  + Marca
                                </button>
                              </div>
                            )}
                            {subBrands.length === 0 && (
                              <button onClick={() => { setEditingBrand(null); setBrandCatFilter(cat.slug); setBrandSubFilter(sub.slug); setBrandModal(true) }} className="text-xs text-accent hover:underline ml-2 mt-1">
                                + Adicionar Marca
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button onClick={() => { setEditingSub(null); setSubCategorySlug(cat.slug); setSubModal(true) }} className="text-xs text-accent hover:underline">
                    + Nova Subcategoria
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface-secondary border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Todas as Marcas</h3>
          <Button variant="secondary" size="sm" onClick={() => { setEditingBrand(null); setBrandCatFilter(''); setBrandSubFilter(''); setBrandModal(true) }}>
            + Nova Marca
          </Button>
        </div>
        <div className="flex gap-2 mb-4">
          <select className={SELECT_CLASS + ' max-w-[200px]'} value={brandCatFilter} onChange={(e) => { setBrandCatFilter(e.target.value); setBrandSubFilter('') }}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
          {brandCatFilter && (
            <select className={SELECT_CLASS + ' max-w-[200px]'} value={brandSubFilter} onChange={(e) => setBrandSubFilter(e.target.value)}>
              <option value="">Todas as subcategorias</option>
              {categories.find((c) => c.slug === brandCatFilter)?.subcategories?.map((s) => (
                <option key={s.slug} value={s.slug}>{s.label}</option>
              ))}
            </select>
          )}
        </div>
        {filteredBrands.length === 0 ? (
          <p className="text-xs text-text-muted">Nenhuma marca encontrada.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredBrands.map((b) => (
              <div key={b.name} className="flex items-center justify-between gap-1 px-3 py-2 bg-surface-tertiary/50 border border-border/50 rounded-lg group">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{b.name}</p>
                  <p className="text-[10px] text-text-muted truncate">{categories.find((c) => c.slug === b.gender)?.label} / {categories.find((c) => c.slug === b.gender)?.subcategories?.find((s) => s.slug === b.subcategory)?.label || b.subcategory}</p>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => { setEditingBrand(b); setBrandCatFilter(''); setBrandSubFilter(''); setBrandModal(true) }} className="p-1 text-text-muted hover:text-accent transition-colors" title="Editar">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteBrand(b)} className="p-1 text-text-muted hover:text-red-400 transition-colors" title="Excluir">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryModal show={catModal} onClose={() => { setCatModal(false); setEditingCat(null) }} onSave={handleSaveCategory} initial={editingCat} />
      <SubcategoryModal show={subModal} onClose={() => { setSubModal(false); setEditingSub(null) }} onSave={handleSaveSubcategory} initial={editingSub} categories={categories} currentCategorySlug={subCategorySlug} />
      <BrandModal show={brandModal} onClose={() => { setBrandModal(false); setEditingBrand(null) }} onSave={handleSaveBrand} initial={editingBrand} categories={categories} brands={brands} />
    </div>
  )
}