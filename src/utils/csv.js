export function exportOrdersCSV(orders) {
  const headers = ['Pedido', 'Cliente', 'Data', 'Status', 'Itens', 'Subtotal', 'Frete', 'Total', 'Pagamento']
  const rows = orders.map((o) => [
    o.orderNumber,
    o.username || '—',
    new Date(o.createdAt).toLocaleDateString('pt-BR'),
    o.status,
    o.items?.length || 0,
    o.subtotal || 0,
    o.shippingCost || 0,
    o.total || 0,
    o.payment?.method || '—',
  ])

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportModelsCSV(models) {
  const headers = ['Slug', 'Nome', 'Marca', 'Gênero', 'Subcategoria', 'Preço Mínimo', 'Destaque']
  const rows = models.map((m) => [
    m.slug,
    m.name,
    m.brand,
    m.gender,
    m.subcategory,
    Math.min(...(m.variants || []).map((v) => v.price)),
    m.featured ? 'Sim' : 'Não',
  ])

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `produtos_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
