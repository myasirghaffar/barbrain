/**
 * Resolve product image for display.
 * Uses API image URL (product.image) only — no local assets, to keep bundle size small.
 */
export function getBottleImage(product) {
  if (!product) return null;
  const uri = product.image;
  return uri && typeof uri === 'string' ? { uri } : null;
}
