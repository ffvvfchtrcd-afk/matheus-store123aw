const BRAND_LOGOS = {
  'Nike': 'M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z',
  'Adidas': 'M3 20l5-12 5 12-5-4-5 4zm8 0l5-12 5 12-5-4-5 4z',
  "Levi's": 'M4 4h16v4L12 8 4 8V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z',
  'Tommy Hilfiger': 'M5 4h14v2H5V4zm0 4h14v2H5V8zm0 4h14v2H5v-2zm0 4h14v2H5v-2z',
  'Calvin Klein': 'M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z',
  'Puma': 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 100-16 8 8 0 000 16z',
  'Hering': 'M4 5h16v2H4V5zm0 4h16v2H4V9zm0 4h16v2H4v-2zm0 4h16v2H4v-2z',
  'Casio': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37V7z',
  'Farm': 'M12 2l9 6v8l-9 6-9-6V8l9-6zm0 2.18L5 8.63v6.74l7 4.45 7-4.45V8.63l-7-4.45z',
  'Zara': 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
  'Animale': 'M12 2l4 4-4 4-4-4 4-4zm-6 8l4 4-4 4-4-4 4-4zm12 0l4 4-4 4-4-4 4-4zm-6 6l4 4-4 4-4-4 4-4z',
  'H&M': 'M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z',
  'Renner': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  'Arezzo': 'M12 2l6 6-6 6-6-6 6-6zm-8 10l4 4-4 4-4-4 4-4zm16 0l4 4-4 4-4-4 4-4zm-8 6l4 4-4 4-4-4 4-4z',
  'Schutz': 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM7 7h10v10H7V7z',
  'Riachuelo': 'M5 3h14v2H5V3zm0 4h14v2H5V7zm0 4h14v2H5v-2zm0 4h14v2H5v-2zm0 4h14v2H5v-2z',
  'Vivara': 'M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1 3-6z',
}

const BRAND_COLORS = {
  'Nike': { bg: '#1a1a2e', fg: '#ffffff' },
  'Adidas': { bg: '#1a1a2e', fg: '#ffffff' },
  "Levi's": { bg: '#1a1a2e', fg: '#ffffff' },
  'Tommy Hilfiger': { bg: '#1a1a2e', fg: '#ffffff' },
  'Calvin Klein': { bg: '#1a1a2e', fg: '#ffffff' },
  'Puma': { bg: '#1a1a2e', fg: '#ffffff' },
  'Hering': { bg: '#1a1a2e', fg: '#ffffff' },
  'Casio': { bg: '#1a1a2e', fg: '#ffffff' },
  'Farm': { bg: '#1a1a2e', fg: '#ffffff' },
  'Zara': { bg: '#1a1a2e', fg: '#ffffff' },
  'Animale': { bg: '#1a1a2e', fg: '#ffffff' },
  'H&M': { bg: '#1a1a2e', fg: '#ffffff' },
  'Renner': { bg: '#1a1a2e', fg: '#ffffff' },
  'Arezzo': { bg: '#1a1a2e', fg: '#ffffff' },
  'Schutz': { bg: '#1a1a2e', fg: '#ffffff' },
  'Riachuelo': { bg: '#1a1a2e', fg: '#ffffff' },
  'Vivara': { bg: '#1a1a2e', fg: '#ffffff' },
}

function svgToDataUri(svg) {
  const encoded = svg
    .replace(/%/g, '%25')
    .replace(/"/g, '%22')
    .replace(/'/g, '%27')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/#/g, '%23')
    .replace(/&/g, '%26')
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

export function getBrandImage(brand) {
  const colors = BRAND_COLORS[brand] || { bg: '#1a1a2e', fg: '#ffffff' }
  const logoPath = BRAND_LOGOS[brand] || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  return svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${colors.bg}" rx="20"/>
    <circle cx="100" cy="70" r="30" fill="${colors.fg}" opacity="0.08"/>
    <path d="${logoPath}" fill="${colors.fg}" opacity="0.9" transform="translate(${brand.length > 6 ? '60' : '70'}, 80) scale(3)"/>
    <text x="100" y="150" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="${colors.fg}" opacity="0.9">${brand}</text>
    <rect x="40" y="165" width="120" height="2" rx="1" fill="${colors.fg}" opacity="0.1"/>
  </svg>`)
}

export function getSubcategoryImage(slug, gender) {
  const bg = gender === 'masculino' ? '#1a1a2e' : '#2e1a2e'
  const fg = '#f5f5f5'
  const labels = {
    'calcas': 'Calças',
    'camisetas': 'Camisetas',
    'tenis': 'Tênis',
    'cuecas': 'Cuecas',
    'relogios': 'Relógios',
    'calcas-shorts': 'Calças/Shorts',
    'vestidos': 'Vestidos',
    'sapatos': 'Sapatos',
    'saltos': 'Saltos',
    'blusas': 'Blusas',
    'acessorios': 'Acessórios',
  }
  const label = labels[slug] || slug
  return svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="${bg}" rx="16"/>
    <rect x="80" y="80" width="240" height="240" rx="16" fill="${fg}" opacity="0.04"/>
    <text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="${fg}" opacity="0.06">${label.charAt(0)}</text>
    <rect x="60" y="300" width="280" height="4" rx="2" fill="${fg}" opacity="0.06"/>
  </svg>`)
}

const COLORS = {
  Preto: '#171717',
  Branco: '#f5f5f5',
  Cinza: '#a3a3a3',
  Azul: '#3b82f6',
  Vermelho: '#ef4444',
  Verde: '#22c55e',
  Bege: '#d6d3d1',
  Marrom: '#78350f',
  Rosa: '#f472b6',
  Dourado: '#f59e0b',
  Prata: '#9ca3af',
}

function productSvg(name, bgColor, textColor) {
  const label = name.length > 18 ? name.substring(0, 16) + '…' : name
  const bg = bgColor || '#262626'
  const fg = textColor || '#a3a3a3'
  return svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <rect width="400" height="500" fill="${bg}"/>
    <rect x="80" y="100" width="240" height="240" rx="16" fill="${fg}" opacity="0.08"/>
    <rect x="120" y="130" width="160" height="180" rx="8" fill="${fg}" opacity="0.12"/>
    <circle cx="200" cy="220" r="40" fill="${fg}" opacity="0.06"/>
    <circle cx="200" cy="220" r="20" fill="${fg}" opacity="0.08"/>
    <rect x="100" y="370" width="200" height="8" rx="4" fill="${fg}" opacity="0.15"/>
    <rect x="120" y="388" width="160" height="6" rx="3" fill="${fg}" opacity="0.1"/>
    <rect x="140" y="404" width="100" height="6" rx="3" fill="${fg}" opacity="0.08"/>
    <text x="200" y="460" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" fill="${fg}" opacity="0.5">${label}</text>
  </svg>`)
}

function categorySvg(label) {
  const bg = '#1a1a1a'
  const fg = '#f5f5f5'
  const icon = label === 'Masculino'
    ? `<circle cx="200" cy="200" r="60" fill="${fg}" opacity="0.08"/>
       <circle cx="200" cy="200" r="35" fill="${fg}" opacity="0.12"/>
       <rect x="145" y="270" width="110" height="80" rx="8" fill="${fg}" opacity="0.06"/>`
    : `<circle cx="200" cy="180" r="55" fill="${fg}" opacity="0.08"/>
       <path d="M155 230l45-20 45 20v50l-45 20-45-20v-50z" fill="${fg}" opacity="0.06"/>
       <circle cx="200" cy="180" r="30" fill="${fg}" opacity="0.12"/>`

  return svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="${bg}"/>
    <rect x="60" y="60" width="680" height="480" rx="24" fill="${fg}" opacity="0.03"/>
    <rect x="100" y="100" width="600" height="400" rx="16" fill="${fg}" opacity="0.02"/>
    ${icon}
    <text x="400" y="380" text-anchor="middle" font-family="Inter, sans-serif" font-size="42" font-weight="700" fill="${fg}" opacity="0.9">${label}</text>
    <rect x="250" y="410" width="300" height="4" rx="2" fill="${fg}" opacity="0.15"/>
  </svg>`)
}

function heroSvg() {
  const bg = '#171717'
  const fg = '#f5f5f5'
  return svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="600" viewBox="0 0 1440 600">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#262626"/><stop offset="100%" stop-color="#171717"/></linearGradient></defs>
    <rect width="1440" height="600" fill="url(#g)"/>
    <circle cx="200" cy="150" r="80" fill="${fg}" opacity="0.03"/>
    <circle cx="400" cy="100" r="120" fill="${fg}" opacity="0.02"/>
    <circle cx="1240" cy="200" r="100" fill="${fg}" opacity="0.03"/>
    <circle cx="1100" cy="450" r="150" fill="${fg}" opacity="0.02"/>
    <rect x="520" y="180" width="400" height="240" rx="20" fill="${fg}" opacity="0.04"/>
    <rect x="560" y="220" width="320" height="160" rx="12" fill="${fg}" opacity="0.06"/>
  </svg>`)
}

export function getProductImage(product) {
  const color = product.colors?.[0]
  const bgColor = COLORS[color] || '#262626'
  const textColor = bgColor === '#f5f5f5' ? '#171717' : '#f5f5f5'
  return productSvg(product.name, bgColor, textColor)
}

export function getCategoryImage(slug) {
  const label = slug === 'masculino' ? 'Masculino' : 'Feminino'
  return categorySvg(label)
}

export function getHeroImage() {
  return heroSvg()
}

export function generateProductPlaceholder(name, colorName) {
  const bgColor = COLORS[colorName] || '#262626'
  const textColor = bgColor === '#f5f5f5' ? '#171717' : '#f5f5f5'
  return productSvg(name, bgColor, textColor)
}

export { COLORS }
