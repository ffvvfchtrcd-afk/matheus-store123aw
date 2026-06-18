export function productDiscount(original, current) {
  if (!original || !current || original <= current) return 0
  return Math.round((1 - current / original) * 100)
}
